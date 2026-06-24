// Mirror roadmap-campaign leads into Bernard's TEAM GHL CRM (separate location).
// Fire-and-forget: must never throw into or block the primary submit flow.
//
// The team PIT is WRITE-scoped only (cannot read this location's custom fields
// or tags), so we send name/email/phone + the routing tag and nothing more.
// The `FB Ads-Token` tag must match verbatim — their automation listens on the
// exact string to route the contact to the right pipeline stage.

const TEAM_LOCATION_ID = 'jezTc8yt2U6hWfDNIvxa'
const TEAM_TAG = 'FB Ads-Token'
// Funnel-source tag so the team CRM can tell manufacturer leads from trades
// leads. Sent ALONGSIDE FB Ads-Token, which stays their routing trigger.
const FUNNEL_TAG = 'FB Ads-Manufacturer'
const SOURCE = 'PBA Roadmap (FB Ads)'

export async function mirrorToTeamCrm({ firstName, lastName, email, phone }) {
  const KEY = process.env.GHL_PIT_BERNARD_TEAM?.trim()
  if (!KEY) {
    console.error('[team-crm] GHL_PIT_BERNARD_TEAM env var not set — skipping mirror')
    return
  }

  const trimmedEmail = (email || '').trim()
  if (!trimmedEmail && !phone) {
    console.error('[team-crm] no email or phone — skipping mirror')
    return
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${KEY}`,
    'Version': '2021-07-28',
  }

  const body = {
    locationId: TEAM_LOCATION_ID,
    source: SOURCE,
    tags: [TEAM_TAG, FUNNEL_TAG],
  }
  if (firstName)    body.firstName = firstName
  if (lastName)     body.lastName  = lastName
  if (trimmedEmail) body.email     = trimmedEmail
  if (phone)        body.phone     = phone

  try {
    const r = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST', headers, body: JSON.stringify(body),
    })
    const text = await r.text()
    let data; try { data = JSON.parse(text) } catch { data = { raw: text } }
    console.log('[team-crm CREATE] →', r.status, JSON.stringify(data).slice(0, 300))

    if (r.ok && data?.contact?.id) return data.contact.id

    // GHL returns the existing contact on a duplicate but does NOT apply the
    // tags we sent — so tag it explicitly, else it never routes.
    const existingId = data?.meta?.contactId || data?.contact?.id
    if (existingId) {
      const tr = await fetch(`https://services.leadconnectorhq.com/contacts/${existingId}/tags`, {
        method: 'POST', headers, body: JSON.stringify({ tags: [TEAM_TAG, FUNNEL_TAG] }),
      })
      console.log('[team-crm TAG existing]', existingId, '→', tr.status)
      return existingId
    }
    console.error('[team-crm] create failed:', r.status, text.slice(0, 300))
  } catch (err) {
    console.error('[team-crm] threw:', err.message)
  }
}
