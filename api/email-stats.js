import { BOOKED_TAG, EMAIL_STEPS, ENROLLED_TAG, eventTag } from './_lib/roadmap-email.js'
import { listContacts } from './_lib/roadmap-email-runner.js'

function rate(numerator, denominator) {
  return denominator ? Number(((numerator / denominator) * 100).toFixed(1)) : 0
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const cronSecret = process.env.CRON_SECRET?.trim()
  if (!cronSecret || req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const ghlToken = process.env.GHL_PIT_BERNARD?.trim()
  if (!ghlToken) return res.status(500).json({ error: 'Server misconfiguration' })

  try {
    const contacts = (await listContacts(ghlToken)).filter(contact => (contact.tags || []).includes(ENROLLED_TAG))
    const booked = contacts.filter(contact => (contact.tags || []).includes(BOOKED_TAG)).length
    const steps = {}
    for (const step of EMAIL_STEPS) {
      const sent = contacts.filter(contact => (contact.tags || []).includes(step.sentTag)).length
      const opened = contacts.filter(contact => (contact.tags || []).includes(eventTag(step.key, 'opened'))).length
      const actions = ['download', 'testimonial', 'video', 'booking']
      const actionCounts = Object.fromEntries(actions.map(action => [
        action,
        contacts.filter(contact => (contact.tags || []).includes(eventTag(step.key, `${action}-clicked`))).length,
      ]))
      const clicked = contacts.filter(contact => actions.some(action => (contact.tags || []).includes(eventTag(step.key, `${action}-clicked`)))).length
      steps[step.key] = { sent, opened, clicked, openRate: rate(opened, sent), clickRate: rate(clicked, sent), actions: actionCounts }
    }
    return res.status(200).json({
      campaign: 'manufacturer-roadmap-email-v1',
      enrolled: contacts.length,
      booked,
      bookingRate: rate(booked, contacts.length),
      steps,
      note: 'Open rates are directional; privacy proxies can inflate them. Click and booking rates are stronger signals.',
    })
  } catch (error) {
    console.error('[email-stats] failed:', error.message)
    return res.status(502).json({ error: 'Email statistics unavailable' })
  }
}
