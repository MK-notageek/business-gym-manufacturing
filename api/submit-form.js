import { sendCapiEvent, sendCrmEvent, clientIpFromReq, userAgentFromReq } from './_lib/meta-capi.js'
import { mirrorToTeamCrm } from './_lib/team-crm.js'
import { createContactWithPhoneFallback, updateContactWithPhoneFallback } from './_lib/ghl-contacts.js'
import { normalizePhone } from './_lib/phone.js'
import { ENROLLED_TAG } from './_lib/roadmap-email.js'
import { addContactTags, enrollRoadmapContact, firstEmailStep, getContact, sendRoadmapStep } from './_lib/roadmap-email-runner.js'

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
  const rawPhone = (phone || '').trim()
  // Everything downstream (GHL, Slack, WhatsApp, Meta CAPI) gets E.164, and a
  // number that can't be normalized is not a real number — see _lib/phone.js.
  const trimmedPhone = normalizePhone(rawPhone)

  const missing = Object.entries({
    full_name: (full_name || '').trim(),
    email: trimmedEmail,
    phone: rawPhone,
    annual_revenue,
    number_of_staff,
    biggest_challenge,
    hours_on_floor,
  }).filter(([, value]) => !value).map(([field]) => field)
  if (missing.length) return res.status(400).json({ error: 'Required fields missing', fields: missing })
  if (!EMAIL_RE.test(trimmedEmail)) return res.status(400).json({ error: 'Valid email required', fields: ['email'] })
  if (!trimmedPhone) return res.status(400).json({ error: 'Valid New Zealand phone required', fields: ['phone'] })
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
  if (annual_revenue)    customFields.push({ id: CF.annual_revenue,    fieldValue: annual_revenue })
  if (number_of_staff)   customFields.push({ id: CF.number_of_staff,   fieldValue: number_of_staff })
  if (biggest_challenge) customFields.push({ id: CF.biggest_challenge, fieldValue: biggest_challenge })
  if (hours_on_floor)    customFields.push({ id: CF.hours_on_floor,    fieldValue: hours_on_floor })
  if (variantLabel)      customFields.push({ id: CF.lp_variant,        fieldValue: variantLabel })

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Version': '2021-07-28',
  }

  // GHL can return 200 while silently ignoring a malformed single-select write.
  // Write revenue with the documented fieldValue shape, then confirm it before
  // enrolling the contact in code-managed delivery.
  async function ensureRevenueStored(cid) {
    const r = await fetch(`https://services.leadconnectorhq.com/contacts/${cid}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ customFields: [{ id: CF.annual_revenue, fieldValue: annual_revenue }] }),
    })
    const text = await r.text()
    if (!r.ok) throw new Error(`GHL revenue write failed (${r.status}): ${text.slice(0, 200)}`)
    let data; try { data = JSON.parse(text) } catch { data = {} }
    let fields = data?.contact?.customFields || []
    let saved = fields.find(field => field.id === CF.annual_revenue)
    if ((saved?.fieldValue ?? saved?.value) === annual_revenue) return

    const check = await fetch(`https://services.leadconnectorhq.com/contacts/${cid}`, { headers })
    const checkText = await check.text()
    if (!check.ok) throw new Error(`GHL revenue verification failed (${check.status})`)
    try { data = JSON.parse(checkText) } catch { data = {} }
    fields = data?.contact?.customFields || []
    saved = fields.find(field => field.id === CF.annual_revenue)
    if ((saved?.fieldValue ?? saved?.value) !== annual_revenue) {
      throw new Error('GHL revenue verification returned a different value')
    }
  }

  let contactId = incomingContactId || null
  let phoneStored = true
  try {
    const contactBody = {
      firstName, lastName,
      email: trimmedEmail,
      phone: trimmedPhone,
      tags,
    }
    if (customFields.length) contactBody.customFields = customFields

    if (incomingContactId) {
      const updated = await updateContactWithPhoneFallback({
        contactId: incomingContactId,
        body: contactBody,
        headers,
        logPrefix: 'submit-form UPDATE',
      })
      phoneStored = updated.phoneStored
    } else {
      const createBody = { ...contactBody, locationId: LOCATION_ID, source: SOURCE }
      const created = await createContactWithPhoneFallback({
        body: createBody,
        headers,
        logPrefix: 'submit-form CREATE',
      })
      contactId = created.contactId
      phoneStored = created.phoneStored
      if (created.existing) {
        const existingBody = phoneStored ? contactBody : { ...contactBody }
        if (!phoneStored) delete existingBody.phone
        const updated = await updateContactWithPhoneFallback({
          contactId,
          body: existingBody,
          headers,
          logPrefix: 'submit-form UPDATE existing',
        })
        phoneStored = updated.phoneStored
      }
    }

    if (!isTest) {
      mirrorToTeamCrm({
        firstName,
        lastName,
        email: trimmedEmail,
        phone: phoneStored ? trimmedPhone : undefined,
      }).catch(() => {})
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
    await ensureRevenueStored(contactId)
    const startedAt = new Date()
    // Save the schedule first, but expose it to the cron only after this immediate
    // send attempt. That removes the only window where both paths could send d0.
    await enrollRoadmapContact(contactId, startedAt, GHL_API_KEY, { activate: false })
    let emailQueued = false
    try {
      const contact = await getContact(contactId, GHL_API_KEY)
      await sendRoadmapStep({
        contact,
        step: firstEmailStep(),
        ghlToken: GHL_API_KEY,
        trackingSecret: process.env.ROADMAP_EMAIL_TRACKING_SECRET?.trim(),
      })
      emailQueued = true
    } catch (emailError) {
      // The cron retries any step without its sent tag. The lead submission remains successful.
      console.error('[submit-form] immediate roadmap email queued for retry:', emailError.message)
    }
    await addContactTags(contactId, [ENROLLED_TAG], GHL_API_KEY)
    return res.status(200).json({ ok: true, contactId, phoneStored, emailQueued })
  } catch (err) {
    console.error('[submit-form] failed:', err.message)
    return res.status(502).json({ error: 'CRM submission failed' })
  }
}
