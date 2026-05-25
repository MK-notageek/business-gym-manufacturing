import { sendCapiEvent, clientIpFromReq, userAgentFromReq } from './_lib/meta-capi.js'

const LOCATION_ID = 'om6L4L1Zfk1cl0MLSbHM'
const SOURCE = 'PBA Lead Magnet'

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
    console.error('[submit-form] GHL_PIT_BERNARD env var not set')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  const {
    full_name, email, phone,
    annual_revenue, number_of_staff, biggest_challenge, hours_on_floor,
    lp_variant,
    contactId: incomingContactId,
    meta_event_id, meta_fbp, meta_fbc, meta_source_url, meta_test_event_code,
  } = req.body || {}

  const [firstName, ...rest] = (full_name || '').trim().split(' ')
  const lastName = rest.join(' ') || ''
  const trimmedEmail = (email || '').trim()

  const isTest = /\btest\b/i.test(full_name || '') || /\+test/i.test(trimmedEmail)
  const tags = ['lead-magnet', 'roadmap-download', 'lead-magnet-survey-submitted']
  if (isTest) tags.push('test')
  // Accept new ('50k' / '500k') or legacy ('a' / 'b') variant labels.
  const variantLabel = lp_variant === 'a' ? '50k' : lp_variant === 'b' ? '500k'
    : (lp_variant === '50k' || lp_variant === '500k') ? lp_variant : null
  if (variantLabel) tags.push(`${variantLabel}-variant`)

  const customFields = []
  if (annual_revenue)    customFields.push({ id: CF.annual_revenue,    value: annual_revenue })
  if (number_of_staff)   customFields.push({ id: CF.number_of_staff,   value: number_of_staff })
  if (biggest_challenge) customFields.push({ id: CF.biggest_challenge, value: biggest_challenge })
  if (hours_on_floor)    customFields.push({ id: CF.hours_on_floor,    value: hours_on_floor })
  if (variantLabel)      customFields.push({ id: CF.lp_variant,        value: variantLabel })

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Version': '2021-07-28',
  }

  let contactId = incomingContactId || null

  // Path A: UPDATE existing partial contact — PUT tags replaces, so `partial` drops off.
  if (incomingContactId) {
    try {
      const body = {
        firstName, lastName,
        email: trimmedEmail || undefined,
        phone: phone || undefined,
        tags,
      }
      if (customFields.length) body.customFields = customFields

      const r = await fetch(`https://services.leadconnectorhq.com/contacts/${incomingContactId}`, {
        method: 'PUT', headers, body: JSON.stringify(body),
      })
      const text = await r.text()
      console.log('[submit-form UPDATE]', incomingContactId, '→', r.status, text.slice(0, 300))
      if (!r.ok) console.error('[submit-form UPDATE] failed:', r.status)
    } catch (err) {
      console.error('[submit-form UPDATE] threw:', err.message)
    }
    await sendCapiEvent({
      eventName: 'Lead',
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
    return res.status(200).json({ ok: true, contactId })
  }

  // Path B: CREATE fresh (no partial was captured).
  try {
    const body = {
      firstName, lastName,
      email: trimmedEmail,
      phone: phone || undefined,
      locationId: LOCATION_ID,
      source: SOURCE,
      tags,
    }
    if (customFields.length) body.customFields = customFields

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
    await sendCapiEvent({
      eventName: 'Lead',
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
    return res.status(200).json({ ok: true, contactId })
  } catch (err) {
    console.error('[submit-form CREATE] threw:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
