import { sendCapiEvent, clientIpFromReq, userAgentFromReq } from './_lib/meta-capi.js'

const LOCATION_ID = 'om6L4L1Zfk1cl0MLSbHM'
const SOURCE = 'PBA Lead Magnet'

// Custom field IDs in Bernard's GHL location
const CF = {
  annual_revenue:    'TYG5Nl56EZ3XR5r9OGUN',
  number_of_staff:   'rC8FDi8dhPCs7RES5cpd',
  biggest_challenge: 'gsx0tJNhvSmPWndQs8jt',
  hours_on_floor:    'c5gpyq6uZqKWEz8Xpw6p',
  lp_variant:        'qThCgTXGjBcPvpxrsQwO',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const GHL_API_KEY = process.env.GHL_PIT_BERNARD?.trim()
  if (!GHL_API_KEY) {
    console.error('[partial-contact] GHL_PIT_BERNARD env var not set')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  const {
    full_name, email, phone,
    annual_revenue, number_of_staff, biggest_challenge, hours_on_floor,
    lp_variant,
    meta_event_id, meta_fbp, meta_fbc, meta_source_url, meta_test_event_code,
  } = req.body || {}

  const trimmedEmail = (email || '').trim()
  if (!trimmedEmail) return res.status(400).json({ error: 'Email required' })

  const [firstName, ...rest] = (full_name || '').trim().split(' ')
  const lastName = rest.join(' ') || ''

  // Auto-mark test contacts so Ayaan can purge them easily.
  const isTest = /\btest\b/i.test(full_name || '') || /\+test/i.test(trimmedEmail)

  const VALID_VARIANTS = ['headline-profit', 'headline-10hrs']
  const variantLabel = VALID_VARIANTS.includes(lp_variant) ? lp_variant : null

  const tags = ['lead-magnet', 'roadmap-download', 'partial']
  if (isTest) tags.push('test')
  if (variantLabel) tags.push(`${variantLabel}-variant`)

  const customFields = []
  if (annual_revenue)    customFields.push({ id: CF.annual_revenue,    value: annual_revenue })
  if (number_of_staff)   customFields.push({ id: CF.number_of_staff,   value: number_of_staff })
  if (biggest_challenge) customFields.push({ id: CF.biggest_challenge, value: biggest_challenge })
  if (hours_on_floor)    customFields.push({ id: CF.hours_on_floor,    value: hours_on_floor })
  if (variantLabel)      customFields.push({ id: CF.lp_variant,        value: variantLabel })

  const body = {
    email: trimmedEmail,
    locationId: LOCATION_ID,
    source: SOURCE,
    tags,
  }
  if (firstName) body.firstName = firstName
  if (lastName)  body.lastName  = lastName
  if (phone)     body.phone     = phone
  if (customFields.length) body.customFields = customFields

  try {
    const r = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28',
      },
      body: JSON.stringify(body),
    })
    const text = await r.text()
    let data; try { data = JSON.parse(text) } catch { data = { raw: text } }
    console.log('[partial-contact] →', r.status, JSON.stringify(data).slice(0, 400))

    if (r.ok && data?.contact?.id) {
      await sendCapiEvent({
        eventName: 'InitiateCheckout',
        eventId: meta_event_id,
        eventSourceUrl: meta_source_url,
        email: trimmedEmail,
        phone,
        fullName: full_name,
        fbp: meta_fbp,
        fbc: meta_fbc,
        clientIp: clientIpFromReq(req),
        userAgent: userAgentFromReq(req),
        testEventCode: meta_test_event_code || undefined,
      }).catch(() => {})
      return res.status(200).json({ ok: true, contactId: data.contact.id })
    }
    const existingId = data?.meta?.contactId || data?.contact?.id
    if (existingId) {
      await sendCapiEvent({
        eventName: 'InitiateCheckout',
        eventId: meta_event_id,
        eventSourceUrl: meta_source_url,
        email: trimmedEmail,
        phone,
        fullName: full_name,
        fbp: meta_fbp,
        fbc: meta_fbc,
        clientIp: clientIpFromReq(req),
        userAgent: userAgentFromReq(req),
        testEventCode: meta_test_event_code || undefined,
      }).catch(() => {})
      return res.status(200).json({ ok: true, contactId: existingId, existing: true })
    }
    console.error('[partial-contact] create failed:', r.status, text)
    return res.status(502).json({ error: 'GHL create failed', status: r.status })
  } catch (err) {
    console.error('[partial-contact] threw:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
