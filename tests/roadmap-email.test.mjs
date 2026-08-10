import test from 'node:test'
import assert from 'node:assert/strict'

import {
  BOOKED_TAG,
  EMAIL_STEPS,
  ENROLLED_TAG,
  STARTED_AT_FIELD_ID,
  SUBMITTED_TAG,
  buildRoadmapEmail,
  createTrackingToken,
  nextDueStep,
  readTrackingToken,
  redirectFor,
  roadmapUrl,
} from '../api/_lib/roadmap-email.js'
import { enrollRoadmapContact, sendRoadmapStep } from '../api/_lib/roadmap-email-runner.js'

const secret = 'local-test-secret'

test('keeps the established manufacturer CRM submission trigger tag', () => {
  assert.equal(SUBMITTED_TAG, 'lead-magnet-survey-submitted')
})

function contactAt(startedAt, tags = []) {
  return {
    id: 'contact_123',
    tags,
    customFields: [{ id: STARTED_AT_FIELD_ID, fieldValue: startedAt }],
  }
}

test('maps every manufacturer revenue band to its roadmap', () => {
  assert.match(roadmapUrl('<$1M'), /profit-roadmap-under-1m\.pdf$/)
  assert.match(roadmapUrl('$1M–$2M'), /profit-roadmap-1m-2m\.pdf$/)
  assert.match(roadmapUrl('$2M–$5M'), /profit-roadmap-2m-5m\.pdf$/)
  assert.match(roadmapUrl('$5M–$10M'), /profit-roadmap-5m-10m\.pdf$/)
  assert.match(roadmapUrl('$10M+'), /profit-roadmap-10m-plus\.pdf$/)
})

test('tracking tokens are opaque, reversible, and tamper evident', () => {
  const payload = { contactId: 'secret-contact', revenue: '$1M–$2M', step: 'd0' }
  const token = createTrackingToken(payload, secret)
  assert.equal(token.includes(payload.contactId), false)
  assert.deepEqual(readTrackingToken(token, secret), payload)
  const parts = token.split('.')
  parts[2] = `${parts[2][0] === 'A' ? 'B' : 'A'}${parts[2].slice(1)}`
  assert.throws(() => readTrackingToken(parts.join('.'), secret))
})

test('first email includes the requested video preview and tracked links', () => {
  const email = buildRoadmapEmail({
    contactId: 'contact_123',
    firstName: 'Alex',
    revenue: '$2M–$5M',
    step: EMAIL_STEPS[0],
    secret,
  })
  assert.equal(email.subject, 'Your Profit Roadmap is here')
  assert.match(email.html, /pba-logo-full\.webp/)
  assert.doesNotMatch(email.html, /pba-email-logo|You received this because|LC Email settings/)
  assert.match(email.html, /Your Profit Roadmap is ready\./)
  assert.match(email.html, /email-vsl-thumb\.jpg/)
  assert.match(email.html, /\/api\/email-click\?token=/)
  assert.match(email.html, /\/api\/email-open\?token=/)
  assert.match(email.html, /Growth Assessment Session/)
})

test('reminders preserve the retired HighLevel sequence subjects and proof points', () => {
  assert.deepEqual(EMAIL_STEPS.map(step => step.subject), [
    'Your Profit Roadmap is here',
    'The #1 profit leak in NZ factories',
    "Trent's revenue went up 55%",
    '37% more went bust last year',
    "I built a factory. Here's what I learnt.",
  ])
  const htmlFor = key => buildRoadmapEmail({
    contactId: 'contact_123', firstName: 'Alex', revenue: '$2M–$5M',
    step: EMAIL_STEPS.find(step => step.key === key), secret,
  }).html
  assert.match(htmlFor('d1'), /pricing by gut instead of by data/)
  assert.match(htmlFor('d1'), /28% to 41%/)
  assert.match(htmlFor('d3'), /Trent/)
  assert.match(htmlFor('d3'), /50–55%/)
  assert.match(htmlFor('d3'), /22–25 hours/)
  assert.match(htmlFor('d5'), /up 37%/)
  assert.match(htmlFor('d5'), /2,800 companies closed/)
  assert.match(htmlFor('d7'), /shop floor at 5am/)
  assert.match(htmlFor('d7'), /Best Workplace in NZ/)
})

test('scheduler selects one due unsent step and stops after booking', () => {
  const now = new Date('2026-08-10T12:00:00.000Z')
  const started = '2026-08-08T12:00:00.000Z'
  const base = contactAt(started, [ENROLLED_TAG, EMAIL_STEPS[0].sentTag])
  assert.equal(nextDueStep(base, now)?.key, 'd1')
  assert.equal(nextDueStep({ ...base, tags: [...base.tags, BOOKED_TAG] }, now), null)
})

test('tracked destinations keep contact attribution without exposing it in email HTML', () => {
  const payload = { contactId: 'contact_123', revenue: '$5M–$10M', step: 'd3' }
  assert.match(redirectFor(payload, 'download'), /profit-roadmap-5m-10m\.pdf/)
  assert.match(redirectFor(payload, 'video'), /email_action=video&cid=contact_123$/)
  assert.match(redirectFor(payload, 'booking'), /#growth-assessment-session$/)
  assert.throws(() => redirectFor(payload, 'unknown'))
})

test('runner stores enrollment, queues HTML through HighLevel, then records completion', async () => {
  const originalFetch = global.fetch
  const calls = []
  global.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options })
    const isMessage = String(url).endsWith('/conversations/messages')
    return new Response(JSON.stringify(isMessage ? { messageId: 'message_1' } : { contact: {} }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  try {
    await enrollRoadmapContact('contact_123', new Date('2026-08-10T00:00:00.000Z'), 'ghl-test', { activate: false })
    await sendRoadmapStep({
      contact: {
        id: 'contact_123',
        firstName: 'Alex',
        customFields: [{ id: 'TYG5Nl56EZ3XR5r9OGUN', value: '$1M–$2M' }],
      },
      step: EMAIL_STEPS[0],
      ghlToken: 'ghl-test',
      trackingSecret: secret,
    })
  } finally {
    global.fetch = originalFetch
  }
  assert.equal(calls.length, 3)
  assert.equal(calls[0].options.method, 'PUT')
  const messageBody = JSON.parse(calls[1].options.body)
  assert.equal(messageBody.type, 'Email')
  assert.equal(messageBody.subject, EMAIL_STEPS[0].subject)
  assert.match(messageBody.html, /email-vsl-thumb\.jpg/)
  assert.deepEqual(JSON.parse(calls[2].options.body), { tags: [EMAIL_STEPS[0].sentTag] })
})
