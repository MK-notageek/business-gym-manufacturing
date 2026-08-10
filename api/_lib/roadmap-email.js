import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

export const LOCATION_ID = 'om6L4L1Zfk1cl0MLSbHM'
export const BASE_URL = 'https://roadmap.premierbusinessacademy.co.nz'
export const CAMPAIGN = 'manufacturer-roadmap-email-v1'
export const ENROLLED_TAG = `${CAMPAIGN}-enrolled`
export const STARTED_AT_FIELD_ID = 'wTlDJoA2INPoSelc2JrR'
export const BOOKED_TAG = 'call-booked'

const DAY = 24 * 60 * 60 * 1000
const ROADMAPS = {
  '<$1M': 'profit-roadmap-under-1m.pdf',
  '$1M–$2M': 'profit-roadmap-1m-2m.pdf',
  '$2M–$5M': 'profit-roadmap-2m-5m.pdf',
  '$5M–$10M': 'profit-roadmap-5m-10m.pdf',
  '$10M+': 'profit-roadmap-10m-plus.pdf',
}

export const EMAIL_STEPS = [
  { key: 'd0', delayMs: 0, subject: 'Your Profit Roadmap is here' },
  { key: 'd1', delayMs: DAY, subject: 'The #1 profit leak in NZ factories' },
  { key: 'd3', delayMs: 3 * DAY, subject: "Trent's revenue went up 55%" },
  { key: 'd5', delayMs: 5 * DAY, subject: '37% more went bust last year' },
  { key: 'd7', delayMs: 7 * DAY, subject: "I built a factory. Here's what I learnt." },
].map(step => ({ ...step, sentTag: `${CAMPAIGN}-${step.key}-sent` }))

function keyFromSecret(secret) {
  if (!secret) throw new Error('ROADMAP_EMAIL_TRACKING_SECRET is required')
  return createHash('sha256').update(secret).digest()
}

export function createTrackingToken(payload, secret) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', keyFromSecret(secret), iv)
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [iv, authTag, encrypted].map(value => value.toString('base64url')).join('.')
}

export function readTrackingToken(token, secret) {
  const parts = String(token || '').split('.')
  if (parts.length !== 3) throw new Error('Invalid tracking token')
  const [iv, authTag, encrypted] = parts.map(value => Buffer.from(value, 'base64url'))
  const decipher = createDecipheriv('aes-256-gcm', keyFromSecret(secret), iv)
  decipher.setAuthTag(authTag)
  return JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8'))
}

export function roadmapUrl(revenue) {
  const filename = ROADMAPS[revenue]
  if (!filename) throw new Error(`Unknown manufacturer revenue band: ${revenue}`)
  return `${BASE_URL}/roadmaps/${filename}`
}

export function eventTag(stepKey, event) {
  return `${CAMPAIGN}-${stepKey}-${event}`
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]))
}

function paragraph(content, style = '') {
  return `<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:#252738;${style}">${content}</p>`
}

function button(label, url) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 26px"><tr><td style="border-radius:8px;background:#7148e8;box-shadow:0 7px 18px rgba(113,72,232,.22)"><a href="${url}" style="display:inline-block;padding:15px 24px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.1;font-weight:700;color:#ffffff;text-decoration:none">${label}</a></td></tr></table>`
}

function insight(content) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 24px"><tr><td style="border-left:4px solid #23affe;background:#f4f8ff;border-radius:0 10px 10px 0;padding:16px 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#303348">${content}</td></tr></table>`
}

function tracked(token, action) {
  return `${BASE_URL}/api/email-click?token=${encodeURIComponent(token)}&action=${encodeURIComponent(action)}`
}

function contentFor(stepKey, firstName, token) {
  const greeting = escapeHtml(firstName || 'there')
  const booking = tracked(token, 'booking')
  if (stepKey === 'd0') return [
    paragraph(`G’day ${greeting},`),
    paragraph(`We’ve matched you with the Profit Roadmap for your current revenue stage. It shows the seven leaks that most often keep good NZ manufacturers busy without making them more profitable.`),
    button('Download Your Profit Roadmap →', tracked(token, 'download')),
    insight('<strong>Start here:</strong> mark every leak that feels familiar. If three or more apply, your roadmap has already found the first conversation worth having.'),
    paragraph('Before you read it, Bernard recorded this short message for you.', 'font-weight:700;margin-bottom:12px;'),
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px"><tr><td><a href="${tracked(token, 'video')}" style="display:block;text-decoration:none"><img src="${BASE_URL}/media/email-vsl-thumb.jpg" width="580" height="327" alt="Play Bernard’s 2 minute 55 second message" style="display:block;width:100%;max-width:580px;height:auto;border:0;border-radius:12px"></a></td></tr></table>`,
    paragraph('<strong style="color:#7148e8">▶ Watch Bernard’s 2:55 message</strong><br>How to use the roadmap—and when a second set of eyes will help.', 'font-size:13px;line-height:1.55;color:#72768a;'),
    paragraph(`I’m Bernard Powell. I founded Premier Group NZ — a manufacturing business producing 200 tonnes of product a day with 75 staff. I didn’t come from consulting. I came from the shop floor.`),
    paragraph(`I’ve since worked with 1,000+ Kiwi business owners. The pattern is usually the same: long weeks, squeezed margins, and no clear picture of where profit is leaking.`),
    paragraph(`Read the roadmap, circle what hits home, and keep it beside you. If three or more leaks apply, we’ll help you identify the one that matters first.`),
    paragraph('Talk soon,<br><strong>Bernard Powell</strong><br><span style="color:#737789">Founder, Premier Business Academy</span>'),
    insight('<strong>Want help finding your #1 profit priority?</strong><br>A PBA advisor will review your numbers with you in a free 45-minute Growth Assessment Session.'),
    button('Book My Free Growth Assessment →', booking),
  ].join('')

  if (stepKey === 'd1') return [
    paragraph(`${greeting},`),
    paragraph('Yesterday you downloaded the Profit Roadmap. Today I want to go deeper on the one leak that costs NZ manufacturers the most.'),
    paragraph('<strong>It’s not materials. It’s not wages. It’s not energy costs.</strong>'),
    paragraph('<strong>It’s pricing by gut instead of by data.</strong>'),
    paragraph('Most manufacturers doing $500K–$1.5M haven’t changed their pricing in 2–3 years. Their costs have gone up 20–40% in that time. Electricity alone has doubled since 2018.'),
    paragraph('You’re busier than ever but making less money. That’s not a sales problem. That’s a pricing problem.'),
    paragraph('One manufacturer found 30% of their product lines were below breakeven. Within 90 days of fixing pricing, margins went from 28% to 41%. No new customers. No new staff.'),
    paragraph('If you reckon your pricing might be off, that’s exactly what we dig into during a Growth Assessment Session.'),
    paragraph('Bernard'), button('Book Your Free Session →', booking),
  ].join('')

  if (stepKey === 'd3') return [
    paragraph(`${greeting},`), paragraph('I want you to meet Trent.'),
    paragraph('When we first met, Trent was doing everything himself: sales, production oversight, quoting, chasing invoices, and managing staff. He was working 60+ hours a week and revenue had flatlined.'),
    paragraph('<strong>After we worked together:</strong><br>• Revenue up 50–55%<br>• Got back 22–25 hours every week<br>• Same team. No new hires.'),
    paragraph('The biggest shift? Trent stopped being the bottleneck. He built systems so his team could handle the day-to-day without him standing over every job.'),
    button('Watch Trent’s Story →', tracked(token, 'testimonial')),
    paragraph('If you’re working the same hours Trent was and getting the same flat results, a Growth Assessment Session is where we figure out what’s holding things up.'),
    paragraph('Bernard'), button('Book Your Free Session →', booking),
  ].join('')

  if (stepKey === 'd5') return [
    paragraph(`${greeting},`), paragraph('<strong>I’m not going to sugarcoat this.</strong>'),
    paragraph('Manufacturing liquidations in NZ were up 37% last year. Total business insolvencies hit their highest level since the GFC. Over 2,800 companies closed.'),
    paragraph('Most weren’t failing because they had no customers. They were busy. Full order books. Machines running.'),
    paragraph('They went bust because cash flow was negative, margins were shrinking, the owner was holding everything together, and one disruption tipped them over.'),
    paragraph('The manufacturers surviving and growing stopped trying to sort it out alone. They got a second set of eyes on their numbers, operations, and team.'),
    paragraph('If your margins are tighter than they were 2 years ago, it’s worth having a conversation before things get worse.'),
    paragraph('Bernard'), button('Book Before Things Get Tighter →', booking),
  ].join('')

  return [
    paragraph(`${greeting},`),
    paragraph('You’ve had the roadmap for a week now. Before I talk about what’s available to you, I want to tell you how I got here.'),
    paragraph('In 2003, I started a small landscape design and construction business. Over the next few years, I grew it into Premier Group NZ — a manufacturing and distribution operation producing 200 tonnes per day with 62 staff.'),
    paragraph('I’ve stood on the shop floor at 5am wondering how to make payroll. I’ve done the quoting, job costing, stock ordering, HR conversations, and Friday machine-breakdown calls.'),
    paragraph('Premier Group was selected for two AME Global Lean Culture Tours and won IBM Kenexa’s Best Workplace in NZ. 98% employee engagement. On a factory floor.'),
    paragraph('When I sit across from a manufacturing owner, I don’t need to imagine what your day looks like. I’ve lived it.'),
    paragraph('That’s why the Growth Assessment Session works. It’s a practical second set of eyes from people who understand manufacturing.'),
    paragraph('Bernard'), button('Book Your Growth Assessment →', booking),
  ].join('')
}

export function buildRoadmapEmail({ contactId, firstName, revenue, step, secret }) {
  roadmapUrl(revenue)
  const token = createTrackingToken({ contactId, revenue, step: step.key, issuedAt: Date.now() }, secret)
  const pixel = `${BASE_URL}/api/email-open?token=${encodeURIComponent(token)}`
  const headings = {
    d0: ['YOUR FREE MANUFACTURER ROADMAP', 'Your Profit Roadmap is ready.'],
    d1: ['PROFIT LEAK #1', 'The pricing gap hiding in plain sight.'],
    d3: ['MANUFACTURER STORY', 'How Trent got 22–25 hours back.'],
    d5: ['A HARD TRUTH', 'Busy factories still run out of cash.'],
    d7: ['A NOTE FROM BERNARD', 'I’ve stood where you’re standing.'],
  }
  const [eyebrow, heading] = headings[step.key] || ['', step.subject]
  const preheader = step.key === 'd0'
    ? 'Your revenue-matched roadmap and a 2:55 message from Bernard.'
    : step.subject
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head><body style="margin:0;padding:0;background:#eef1f7"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}&#847;&zwnj;&nbsp;&#8199;&zwnj;&nbsp;&#65279;</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#eef1f7"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;background:#ffffff;border:1px solid #e2e5ee;border-radius:16px;overflow:hidden;box-shadow:0 12px 34px rgba(25,28,47,.08)"><tr><td style="padding:24px 30px 20px;border-bottom:1px solid #eceef4"><img src="${BASE_URL}/images/pba-email-logo.png" width="240" height="52" alt="Premier Business Academy" style="display:block;width:240px;max-width:70%;height:auto;border:0"></td></tr><tr><td style="padding:30px 30px 4px"><div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.4;font-weight:800;letter-spacing:.12em;color:#7148e8;margin-bottom:9px">${eyebrow}</div><h1 style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:30px;line-height:1.18;letter-spacing:-.025em;color:#17192a">${heading}</h1>${contentFor(step.key, firstName, token)}</td></tr><tr><td style="padding:22px 30px 26px;background:#17192a"><p style="margin:0 0 7px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#ffffff;font-weight:700">Premier Business Academy · Auckland, New Zealand</p><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;color:#aeb3c4">You received this because you requested the Manufacturer’s Profit Roadmap. PBA’s LC Email settings add the unsubscribe link automatically.</p></td></tr></table><p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#9a9eaa">© Premier Business Academy</p><img src="${pixel}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0"></td></tr></table></body></html>`
  return { subject: step.subject, html, token }
}

export function startedAtFromContact(contact) {
  const field = (contact.customFields || []).find(item => item.id === STARTED_AT_FIELD_ID)
  const value = field?.fieldValue ?? field?.value
  const date = value ? new Date(value) : null
  return date && !Number.isNaN(date.getTime()) ? date : null
}

export function nextDueStep(contact, now = new Date()) {
  const tags = new Set(contact.tags || [])
  if (!tags.has(ENROLLED_TAG) || tags.has(BOOKED_TAG)) return null
  const startedAt = startedAtFromContact(contact)
  if (!startedAt) return null
  return EMAIL_STEPS.find(step => !tags.has(step.sentTag) && startedAt.getTime() + step.delayMs <= now.getTime()) || null
}

export function redirectFor(payload, action) {
  const source = `utm_source=email&utm_medium=nurture&utm_campaign=manufacturer-roadmap&utm_content=${encodeURIComponent(payload.step)}`
  if (action === 'download') return `${roadmapUrl(payload.revenue)}?${source}`
  if (action === 'testimonial') return 'https://www.youtube.com/watch?v=rrMx4Z-ekG0'
  if (action === 'video' || action === 'booking') {
    const contact = payload.contactId ? `&cid=${encodeURIComponent(payload.contactId)}` : ''
    const anchor = action === 'booking' ? '#growth-assessment-session' : ''
    return `${BASE_URL}/thank-you?${source}&email_action=${action}${contact}${anchor}`
  }
  throw new Error('Unknown email action')
}
