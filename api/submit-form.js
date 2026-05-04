// Final submit. If a partial contactId already exists, PUT with clean tags (drops `partial`).
// Otherwise POST a fresh contact. Either way returns { ok, contactId }.
// Pipes URL-param attribution into attributionSource and writes a "Submitted Lead Magnet form"
// activity note that includes the captured fields + UTM context.

const LOCATION_ID = 'om6L4L1Zfk1cl0MLSbHM'
const SOURCE = 'PBA Lead Magnet'

const CF = {
  annual_revenue:    'TYG5Nl56EZ3XR5r9OGUN',
  number_of_staff:   'rC8FDi8dhPCs7RES5cpd',
  biggest_challenge: 'gsx0tJNhvSmPWndQs8jt',
  hours_on_floor:    'c5gpyq6uZqKWEz8Xpw6p',
  lp_variant:        'qThCgTXGjBcPvpxrsQwO',
}

function buildAttribution(a = {}) {
  const at = {
    url: a.url || '',
    medium: a.utm_medium || (a.fbclid ? 'paid' : a.gclid ? 'paid' : ''),
    source: a.utm_source || (a.fbclid ? 'fb' : a.gclid ? 'google' : ''),
    campaign: a.utm_campaign || '',
    utmContent: a.utm_content || '',
    utmTerm: a.utm_term || '',
    campaignId: a.utm_id || '',
    referrer: a.referrer || '',
    userAgent: a.user_agent || '',
    fbclid: a.fbclid || '',
    gclid: a.gclid || '',
    msclkid: a.msclkid || '',
    sessionSource: a.referrer ? safeHost(a.referrer) : '',
  }
  const attributionSource = Object.fromEntries(Object.entries(at).filter(([_, v]) => v))
  const friendly = attributionSource.medium || attributionSource.source
    ? `Lead Magnet (${attributionSource.medium || attributionSource.source})`
    : 'PBA Lead Magnet'
  return {
    attributionSource: Object.keys(attributionSource).length ? attributionSource : null,
    source: friendly,
  }
}
function safeHost(u) { try { return new URL(u).hostname } catch { return '' } }

async function postNote(headers, contactId, body) {
  if (!contactId) return
  try {
    const r = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
      method: 'POST', headers, body: JSON.stringify({ body }),
    })
    if (!r.ok) console.warn('[note] failed', r.status, (await r.text()).slice(0, 200))
  } catch (err) {
    console.warn('[note] threw', err?.message)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const GHL_API_KEY = process.env.GHL_PIT_BERNARD?.trim()
  if (!GHL_API_KEY) {
    console.error('[submit-form] GHL_PIT_BERNARD env var not set')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  const {
    full_name, email, phone,
    annual_revenue, number_of_staff, biggest_challenge, hours_on_floor,
    lp_variant,
    contactId: incomingContactId,
    attribution = {},
  } = req.body || {}

  const [firstName, ...rest] = (full_name || '').trim().split(' ')
  const lastName = rest.join(' ') || ''
  const trimmedEmail = (email || '').trim()

  const isTest = /\btest\b/i.test(full_name || '') || /\+test/i.test(trimmedEmail)
  const tags = ['lead-magnet', 'roadmap-download', 'lead-magnet-survey-submitted']
  if (isTest) tags.push('test')
  if (lp_variant === 'a' || lp_variant === 'b') tags.push(lp_variant === 'a' ? '50k-variant' : '500k-variant')

  const customFields = []
  if (annual_revenue)    customFields.push({ id: CF.annual_revenue,    value: annual_revenue })
  if (number_of_staff)   customFields.push({ id: CF.number_of_staff,   value: number_of_staff })
  if (biggest_challenge) customFields.push({ id: CF.biggest_challenge, value: biggest_challenge })
  if (hours_on_floor)    customFields.push({ id: CF.hours_on_floor,    value: hours_on_floor })
  if (lp_variant)        customFields.push({ id: CF.lp_variant,        value: lp_variant === 'a' ? '50k' : lp_variant === 'b' ? '500k' : lp_variant })

  const attrPack = buildAttribution(attribution)

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Version': '2021-07-28',
  }

  const variantLabel = lp_variant === 'a' ? '50k' : lp_variant === 'b' ? '500k' : '-'
  const submissionLines = [
    `🟢 Submitted Lead Magnet form (variant ${variantLabel})`,
    `Name: ${(full_name || '').trim()}`,
    `Email: ${trimmedEmail}`,
    phone ? `Phone: ${phone}` : null,
    annual_revenue ? `Annual revenue: ${annual_revenue}` : null,
    number_of_staff ? `Number of staff: ${number_of_staff}` : null,
    biggest_challenge ? `Biggest challenge: ${biggest_challenge}` : null,
    hours_on_floor ? `Hours at work: ${hours_on_floor}` : null,
  ]
  const utmLine = [
    attribution.utm_source && `Source: ${attribution.utm_source}`,
    attribution.utm_medium && `Medium: ${attribution.utm_medium}`,
    attribution.utm_campaign && `Campaign: ${attribution.utm_campaign}`,
    attribution.utm_content && `Content: ${attribution.utm_content}`,
    attribution.fbclid && `fbclid: ${attribution.fbclid.slice(0, 24)}…`,
  ].filter(Boolean).join(' · ')
  if (utmLine) submissionLines.push(`Attribution: ${utmLine}`)
  if (attribution.referrer) submissionLines.push(`Referrer: ${attribution.referrer}`)
  if (attribution.url) submissionLines.push(`Page: ${attribution.url}`)
  const submissionNote = submissionLines.filter(Boolean).join('\n')

  let contactId = incomingContactId || null

  // Path A: UPDATE existing partial contact - PUT tags replaces, so `partial` drops off.
  if (incomingContactId) {
    try {
      const body = {
        firstName, lastName,
        email: trimmedEmail || undefined,
        phone: phone || undefined,
        tags,
      }
      if (customFields.length) body.customFields = customFields
      if (attrPack.attributionSource) body.attributionSource = attrPack.attributionSource
      if (attrPack.source) body.source = attrPack.source

      const r = await fetch(`https://services.leadconnectorhq.com/contacts/${incomingContactId}`, {
        method: 'PUT', headers, body: JSON.stringify(body),
      })
      const text = await r.text()
      console.log('[submit-form UPDATE]', incomingContactId, '→', r.status, text.slice(0, 300))
      if (!r.ok) console.error('[submit-form UPDATE] failed:', r.status)
    } catch (err) {
      console.error('[submit-form UPDATE] threw:', err.message)
    }
    await postNote(headers, contactId, submissionNote)
    return res.status(200).json({ ok: true, contactId })
  }

  // Path B: CREATE fresh (no partial was captured).
  try {
    const body = {
      firstName, lastName,
      email: trimmedEmail,
      phone: phone || undefined,
      locationId: LOCATION_ID,
      source: attrPack.source || SOURCE,
      tags,
    }
    if (customFields.length) body.customFields = customFields
    if (attrPack.attributionSource) body.attributionSource = attrPack.attributionSource

    const r = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST', headers, body: JSON.stringify(body),
    })
    const text = await r.text()
    let data; try { data = JSON.parse(text) } catch { data = { raw: text } }
    console.log('[submit-form CREATE] →', r.status, JSON.stringify(data).slice(0, 400))
    if (r.ok && data?.contact?.id) contactId = data.contact.id
    else {
      const existingId = data?.meta?.contactId || data?.contact?.id
      if (existingId) contactId = existingId
      else console.error('[submit-form CREATE] failed:', r.status, text)
    }
    if (contactId) await postNote(headers, contactId, submissionNote)
    return res.status(200).json({ ok: true, contactId })
  } catch (err) {
    console.error('[submit-form CREATE] threw:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
