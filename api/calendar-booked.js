import { sendCapiEvent, clientIpFromReq, userAgentFromReq } from './_lib/meta-capi.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { contactId, meta_event_id, meta_fbp, meta_fbc, meta_source_url, email, phone, full_name } = req.body || {}
  if (!contactId) return res.status(400).json({ error: 'contactId required' })

  const GHL_API_KEY = process.env.GHL_PIT_BERNARD?.trim()
  if (!GHL_API_KEY) {
    console.error('[calendar-booked] GHL_PIT_BERNARD env var not set')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Version': '2021-07-28',
  }

  // GET existing tags, merge with `call-booked`, PUT the union back. POST /tags
  // sometimes drops other tags depending on workflow order — explicit set is safer.
  try {
    const getRes = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, { headers })
    const getTxt = await getRes.text()
    let existingTags = []
    try {
      const data = JSON.parse(getTxt)
      existingTags = (data?.contact?.tags || []).filter(t => typeof t === 'string')
    } catch { /* leave empty */ }
    const merged = Array.from(new Set([...existingTags, 'call-booked']))
    const putRes = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ tags: merged }),
    })
    const putTxt = await putRes.text()
    console.log('[calendar-booked] tags →', putRes.status, 'merged:', merged.join(','), putTxt.slice(0, 200))
  } catch (err) {
    console.error('[calendar-booked] tag threw:', err && err.message)
  }

  try {
    const r = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        body: '📅 Booked profit-roadmap-session slot via roadmap thank-you page',
      }),
    })
    const txt = await r.text()
    console.log('[calendar-booked] note →', r.status, txt.slice(0, 200))
  } catch (err) {
    console.error('[calendar-booked] note threw:', err && err.message)
  }

  sendCapiEvent({
    eventName: 'Schedule',
    eventId: meta_event_id,
    eventSourceUrl: meta_source_url,
    email,
    phone,
    fullName: full_name,
    fbp: meta_fbp,
    fbc: meta_fbc,
    clientIp: clientIpFromReq(req),
    userAgent: userAgentFromReq(req),
  }).catch(() => {})

  return res.status(200).json({ ok: true })
}
