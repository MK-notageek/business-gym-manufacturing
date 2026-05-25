import crypto from 'node:crypto'

const GRAPH_VERSION = 'v25.0'

function sha256(value) {
  if (value === undefined || value === null || value === '') return undefined
  return crypto.createHash('sha256').update(String(value).trim().toLowerCase()).digest('hex')
}

function normalizePhone(phone) {
  return String(phone || '').replace(/[^0-9]/g, '')
}

function splitName(fullName) {
  const trimmed = String(fullName || '').trim()
  if (!trimmed) return { fn: undefined, ln: undefined }
  const parts = trimmed.split(/\s+/)
  return {
    fn: parts[0],
    ln: parts.length > 1 ? parts.slice(1).join(' ') : undefined,
  }
}

export function clientIpFromReq(req) {
  const h = (req && req.headers) || {}
  const xff = h['x-forwarded-for'] || h['X-Forwarded-For'] || ''
  if (xff) return String(xff).split(',')[0].trim()
  return h['x-real-ip'] || (req && req.socket && req.socket.remoteAddress) || ''
}

export function userAgentFromReq(req) {
  return (req && req.headers && (req.headers['user-agent'] || req.headers['User-Agent'])) || ''
}

export async function sendCapiEvent({
  eventName,
  eventId,
  eventSourceUrl,
  email,
  phone,
  fullName,
  fbp,
  fbc,
  clientIp,
  userAgent,
  customData,
  testEventCode,
}) {
  const pixelId = process.env.META_PIXEL_ID && process.env.META_PIXEL_ID.trim()
  const token = process.env.META_CAPI_TOKEN && process.env.META_CAPI_TOKEN.trim()
  if (!pixelId || !token) {
    console.warn(`[meta-capi] missing META_PIXEL_ID or META_CAPI_TOKEN — skipping ${eventName}`)
    return { ok: false, skipped: true }
  }

  const { fn, ln } = splitName(fullName)
  const userData = {
    em: email ? [sha256(email)] : undefined,
    ph: phone ? [sha256(normalizePhone(phone))] : undefined,
    fn: fn ? [sha256(fn)] : undefined,
    ln: ln ? [sha256(ln)] : undefined,
    client_ip_address: clientIp || undefined,
    client_user_agent: userAgent || undefined,
    fbp: fbp || undefined,
    fbc: fbc || undefined,
  }
  for (const k of Object.keys(userData)) if (userData[k] === undefined) delete userData[k]

  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    event_source_url: eventSourceUrl || undefined,
    event_id: eventId || undefined,
    user_data: userData,
  }
  if (customData && Object.keys(customData).length) event.custom_data = customData
  for (const k of Object.keys(event)) if (event[k] === undefined) delete event[k]

  const body = { data: [event] }
  if (testEventCode) body.test_event_code = testEventCode

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const txt = await r.text()
    if (!r.ok) {
      console.error(`[meta-capi] ${eventName} → ${r.status}`, txt.slice(0, 500))
      return { ok: false, status: r.status, response: txt }
    }
    console.log(`[meta-capi] ${eventName} eid=${eventId || '-'} → ${r.status}`, txt.slice(0, 200))
    return { ok: true, status: r.status, response: txt }
  } catch (err) {
    console.error(`[meta-capi] ${eventName} threw:`, err && err.message)
    return { ok: false, error: err && err.message }
  }
}
