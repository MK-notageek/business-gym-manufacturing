// PUT a single field (or any subset) to an existing GHL contact.
// Called on blur after a partial contact has been created.

const CF = {
  annual_revenue:    'TYG5Nl56EZ3XR5r9OGUN',
  number_of_staff:   'rC8FDi8dhPCs7RES5cpd',
  biggest_challenge: 'gsx0tJNhvSmPWndQs8jt',
  hours_on_floor:    'c5gpyq6uZqKWEz8Xpw6p',
  lp_variant:        'qThCgTXGjBcPvpxrsQwO',
}

export default async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const GHL_API_KEY = process.env.GHL_PIT_BERNARD?.trim()
  if (!GHL_API_KEY) {
    console.error('[update-contact] GHL_PIT_BERNARD env var not set')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  const {
    contactId,
    full_name, email, phone,
    annual_revenue, number_of_staff, biggest_challenge, hours_on_floor,
    lp_variant,
  } = req.body || {}
  if (!contactId) return res.status(400).json({ error: 'contactId required' })

  const body = {}

  if (typeof full_name === 'string' && full_name.trim()) {
    const [firstName, ...rest] = full_name.trim().split(' ')
    body.firstName = firstName
    body.lastName  = rest.join(' ') || ''
  }
  if (typeof email === 'string' && email.trim()) body.email = email.trim()
  if (typeof phone === 'string' && phone.trim()) body.phone = phone.trim()

  const customFields = []
  if (typeof annual_revenue === 'string'    && annual_revenue.trim())    customFields.push({ id: CF.annual_revenue,    fieldValue: annual_revenue.trim() })
  if (typeof number_of_staff === 'string'   && number_of_staff.trim())   customFields.push({ id: CF.number_of_staff,   fieldValue: number_of_staff.trim() })
  if (typeof biggest_challenge === 'string' && biggest_challenge.trim()) customFields.push({ id: CF.biggest_challenge, fieldValue: biggest_challenge.trim() })
  if (typeof hours_on_floor === 'string'    && hours_on_floor.trim())    customFields.push({ id: CF.hours_on_floor,    fieldValue: hours_on_floor.trim() })
  if (typeof lp_variant === 'string' && lp_variant.trim()) {
    const VALID_VARIANTS = ['headline-30pct', 'headline-10hrs']
    if (VALID_VARIANTS.includes(lp_variant.trim())) {
      customFields.push({ id: CF.lp_variant, fieldValue: lp_variant.trim() })
    }
  }
  if (customFields.length) body.customFields = customFields

  if (Object.keys(body).length === 0) {
    return res.status(200).json({ ok: true, skipped: 'no fields' })
  }

  try {
    const r = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Version': '2021-07-28',
      },
      body: JSON.stringify(body),
    })
    const text = await r.text()
    console.log('[update-contact]', contactId, '→', r.status, text.slice(0, 300))
    if (!r.ok) return res.status(502).json({ error: 'GHL update failed', status: r.status })
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[update-contact] threw:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
