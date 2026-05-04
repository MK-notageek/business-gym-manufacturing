// Creates a GHL contact with a `partial` tag the moment full_name + email are both present
// (mirrors VirtuPro five-star pattern). Returns { ok, contactId } the client stores.
// Also pipes URL-param attribution into the contact's attributionSource so the
// "First / Latest attribution source" panel populates the same way GHL's hosted form did,
// and writes a "Started Lead Magnet form" note onto the contact's activity feed.

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
    console.error('[partial-contact] GHL_PIT_BERNARD env var not set')
    return res.status(500).json({ error: 'Server misconfiguration' })
  }

  const {
    full_name, email, phone,
    annual_revenue, number_of_staff, biggest_challenge, hours_on_floor,
    lp_variant,
    attribution = {},
  } = req.body || {}

  const trimmedEmail = (email || '').trim()
  if (!trimmedEmail) return res.status(400).json({ error: 'Email required' })

  const [firstName, ...rest] = (full_name || '').trim().split(' ')
  const lastName = rest.join(' ') || ''

  const isTest = /\btest\b/i.test(full_name || '') || /\+test/i.test(trimmedEmail)

  const tags = ['lead-magnet', 'roadmap-download', 'partial']
  if (isTest) tags.push('test')
  if (lp_variant === 'a' || lp_variant === 'b') tags.push(lp_variant === 'a' ? '50k-variant' : '500k-variant')

  const customFields = []
  if (annual_revenue)    customFields.push({ id: CF.annual_revenue,    value: annual_revenue })
  if (number_of_staff)   customFields.push({ id: CF.number_of_staff,   value: number_of_staff })
  if (biggest_challenge) customFields.push({ id: CF.biggest_challenge, value: biggest_challenge })
  if (hours_on_floor)    customFields.push({ id: CF.hours_on_floor,    value: hours_on_floor })
  if (lp_variant)        customFields.push({ id: CF.lp_variant,        value: lp_variant === 'a' ? '50k' : lp_variant === 'b' ? '500k' : lp_variant })

  const attrPack = buildAttribution(attribution)
  const body = {
    email: trimmedEmail,
    locationId: LOCATION_ID,
    source: attrPack.source || SOURCE,
    tags,
  }
  if (firstName) body.firstName = firstName
  if (lastName)  body.lastName  = lastName
  if (phone)     body.phone     = phone
  if (customFields.length) body.customFields = customFields
  if (attrPack.attributionSource) body.attributionSource = attrPack.attributionSource

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${GHL_API_KEY}`,
    'Version': '2021-07-28',
  }

  try {
    const r = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST', headers, body: JSON.stringify(body),
    })
    const text = await r.text()
    let data; try { data = JSON.parse(text) } catch { data = { raw: text } }
    console.log('[partial-contact] →', r.status, JSON.stringify(data).slice(0, 400))

    let cid = null
    let existing = false
    if (r.ok && data?.contact?.id) {
      cid = data.contact.id
    } else {
      const existingId = data?.meta?.contactId || data?.contact?.id
      if (existingId) { cid = existingId; existing = true }
    }
    if (!cid) {
      console.error('[partial-contact] create failed:', r.status, text)
      return res.status(502).json({ error: 'GHL create failed', status: r.status })
    }

    if (!existing) {
      const variantLabel = lp_variant === 'a' ? '50k' : lp_variant === 'b' ? '500k' : '-'
      const utmLine = [
        attribution.utm_source && `Source: ${attribution.utm_source}`,
        attribution.utm_medium && `Medium: ${attribution.utm_medium}`,
        attribution.utm_campaign && `Campaign: ${attribution.utm_campaign}`,
        attribution.utm_content && `Content: ${attribution.utm_content}`,
        attribution.fbclid && `fbclid: ${attribution.fbclid.slice(0, 24)}…`,
      ].filter(Boolean).join(' · ')
      const noteBody = [
        `🟢 Started Lead Magnet form (variant ${variantLabel})`,
        `Captured: name + email (partial)`,
        utmLine ? `Attribution: ${utmLine}` : null,
        attribution.referrer ? `Referrer: ${attribution.referrer}` : null,
        attribution.url ? `Page: ${attribution.url}` : null,
      ].filter(Boolean).join('\n')
      await postNote(headers, cid, noteBody)
    }

    return res.status(200).json({ ok: true, contactId: cid, existing })
  } catch (err) {
    console.error('[partial-contact] threw:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
