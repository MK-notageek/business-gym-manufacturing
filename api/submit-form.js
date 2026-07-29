import { sendCapiEvent, sendCrmEvent, clientIpFromReq, userAgentFromReq } from './_lib/meta-capi.js'
import { mirrorToTeamCrm } from './_lib/team-crm.js'

const LOCATION_ID = 'om6L4L1Zfk1cl0MLSbHM'
const SOURCE = 'PBA Lead Magnet'
const REVENUE_OPTIONS = new Set(['<$1M', '$1M–$2M', '$2M–$5M', '$5M–$10M', '$10M+'])
const STAFF_OPTIONS = new Set(['1-3', '4-10', '11-20', '20+'])
const CHALLENGE_OPTIONS = new Set(['Margins shrinking', 'Stuck on the floor', 'Cash flow', 'Staff retention', 'Growth'])
const HOURS_OPTIONS = new Set(['<20', '20-30', '30-40', '40+'])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

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
  const trimmedPhone = (phone || '').trim()

  const missing = Object.entries({
    full_name: (full_name || '').trim(),
    email: trimmedEmail,
    phone: trimmedPhone,
    annual_revenue,
    number_of_staff,
    biggest_challenge,
    hours_on_floor,
  }).filter(([, value]) => !value).map(([field]) => field)
  if (missing.length) return res.status(400).json({ error: 'Required fields missing', fields: missing })
  if (!EMAIL_RE.test(trimmedEmail)) return res.status(400).json({ error: 'Valid email required', fields: ['email'] })
  if (!REVENUE_OPTIONS.has(annual_revenue)) return res.status(400).json({ error: 'Invalid annual revenue', fields: ['annual_revenue'] })
  if (!STAFF_OPTIONS.has(number_of_staff)) return res.status(400).json({ error: 'Invalid staff count', fields: ['number_of_staff'] })
  if (!CHALLENGE_OPTIONS.has(biggest_challenge)) return res.status(400).json({ error: 'Invalid challenge', fields: ['biggest_challenge'] })
  if (!HOURS_OPTIONS.has(hours_on_floor)) return res.status(400).json({ error: 'Invalid hours', fields: ['hours_on_floor'] })

  const isTest = /\btest\b/i.test(full_name || '') || /\+test/i.test(trimmedEmail)
  const VALID_VARIANTS = ['headline-30pct', 'headline-10hrs']
  const variantLabel = VALID_VARIANTS.includes(lp_variant) ? lp_variant : null

  const tags = ['lead-magnet', 'roadmap-download']
  if (isTest) tags.push('test')
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

  // Commit the workflow trigger only after all required answers are safely stored.
  async function commitDeliveryTag(cid) {
    if (!cid) throw new Error('Cannot commit delivery tag without a contact')
    const r = await fetch(`https://services.leadconnectorhq.com/contacts/${cid}/tags`, {
      method: 'POST', headers, body: JSON.stringify({ tags: ['lead-magnet-survey-submitted'] }),
    })
    const text = await r.text()
    console.log('[submit-form] lead-magnet-survey-submitted tag →', r.status)
    if (!r.ok) throw new Error(`GHL delivery tag failed (${r.status}): ${text.slice(0, 200)}`)
  }

  let contactId = incomingContactId || null
  try {
    const contactBody = {
      firstName, lastName,
      email: trimmedEmail,
      phone: trimmedPhone,
      tags,
    }
    if (customFields.length) contactBody.customFields = customFields

    if (incomingContactId) {
      const r = await fetch(`https://services.leadconnectorhq.com/contacts/${incomingContactId}`, {
        method: 'PUT', headers, body: JSON.stringify(contactBody),
      })
      const text = await r.text()
      console.log('[submit-form UPDATE]', incomingContactId, '→', r.status, text.slice(0, 300))
      if (!r.ok) throw new Error(`GHL contact update failed (${r.status}): ${text.slice(0, 200)}`)
    } else {
      const createBody = { ...contactBody, locationId: LOCATION_ID, source: SOURCE }
      const r = await fetch('https://services.leadconnectorhq.com/contacts/', {
        method: 'POST', headers, body: JSON.stringify(createBody),
      })
      const text = await r.text()
      let data; try { data = JSON.parse(text) } catch { data = { raw: text } }
      console.log('[submit-form CREATE] →', r.status, JSON.stringify(data).slice(0, 400))
      if (r.ok && data?.contact?.id) {
        contactId = data.contact.id
      } else {
        contactId = data?.meta?.contactId || data?.contact?.id || null
        if (!contactId) throw new Error(`GHL contact create failed (${r.status}): ${text.slice(0, 200)}`)
        const update = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
          method: 'PUT', headers, body: JSON.stringify(contactBody),
        })
        const updateText = await update.text()
        if (!update.ok) throw new Error(`GHL existing-contact update failed (${update.status}): ${updateText.slice(0, 200)}`)
      }
    }

    if (!isTest) {
      mirrorToTeamCrm({ firstName, lastName, email: trimmedEmail, phone: trimmedPhone }).catch(() => {})
    }
    await sendCapiEvent({
      eventName: 'Lead',
      eventId: meta_event_id,
      eventSourceUrl: meta_source_url,
      email: trimmedEmail,
      phone: trimmedPhone,
      fullName: full_name,
      fbp: meta_fbp,
      fbc: meta_fbc,
      clientIp: clientIpFromReq(req),
      userAgent: userAgentFromReq(req),
      testEventCode: meta_test_event_code || undefined,
    }).catch(() => {})
    if (annual_revenue === '$10M+') {
      await sendCrmEvent({
        eventName: 'qualified_lead',
        email: trimmedEmail,
        phone: trimmedPhone,
        fullName: full_name,
        testEventCode: meta_test_event_code || undefined,
      }).catch(() => {})
    }
    await commitDeliveryTag(contactId)
    return res.status(200).json({ ok: true, contactId })
  } catch (err) {
    console.error('[submit-form] failed:', err.message)
    return res.status(502).json({ error: 'CRM submission failed' })
  }
}
