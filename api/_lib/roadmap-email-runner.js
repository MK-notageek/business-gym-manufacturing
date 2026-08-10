import {
  EMAIL_STEPS,
  ENROLLED_TAG,
  LOCATION_ID,
  STARTED_AT_FIELD_ID,
  buildRoadmapEmail,
} from './roadmap-email.js'

const API_ROOT = 'https://services.leadconnectorhq.com'

export function ghlHeaders(token, version = '2021-07-28') {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Version': version,
  }
}

async function ghlFetch(path, { token, method = 'GET', body, version } = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    method,
    headers: ghlHeaders(token, version),
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await response.text()
  let data = {}
  try { data = text ? JSON.parse(text) : {} } catch { data = {} }
  if (!response.ok) {
    const message = typeof data?.message === 'string' ? data.message : 'HighLevel request failed'
    throw new Error(`${message} (${response.status})`)
  }
  return data
}

export async function addContactTags(contactId, tags, token) {
  if (!contactId || !tags?.length) return
  await ghlFetch(`/contacts/${encodeURIComponent(contactId)}/tags`, {
    token,
    method: 'POST',
    body: { tags },
  })
}

export async function enrollRoadmapContact(contactId, startedAt, token, { activate = true } = {}) {
  await ghlFetch(`/contacts/${encodeURIComponent(contactId)}`, {
    token,
    method: 'PUT',
    body: {
      customFields: [{ id: STARTED_AT_FIELD_ID, fieldValue: startedAt.toISOString() }],
    },
  })
  if (activate) await addContactTags(contactId, [ENROLLED_TAG], token)
}

export async function sendRoadmapStep({ contact, step, ghlToken, trackingSecret }) {
  if (!contact?.id) throw new Error('Contact id is required')
  const revenueField = (contact.customFields || []).find(field => field.id === 'TYG5Nl56EZ3XR5r9OGUN')
  const revenue = revenueField?.fieldValue ?? revenueField?.value
  const { subject, html } = buildRoadmapEmail({
    contactId: contact.id,
    firstName: contact.firstName,
    revenue,
    step,
    secret: trackingSecret,
  })
  const result = await ghlFetch('/conversations/messages', {
    token: ghlToken,
    method: 'POST',
    body: {
      type: 'Email',
      contactId: contact.id,
      subject,
      html,
    },
  })
  await addContactTags(contact.id, [step.sentTag], ghlToken)
  return {
    messageId: result.messageId || null,
    emailMessageId: result.emailMessageId || null,
  }
}

export async function getContact(contactId, token) {
  const data = await ghlFetch(`/contacts/${encodeURIComponent(contactId)}`, { token })
  return data.contact || null
}

export async function listContacts(token, { maxPages = 20 } = {}) {
  const contacts = []
  let path = `/contacts/?${new URLSearchParams({ locationId: LOCATION_ID, limit: '100' }).toString()}`
  const seen = new Set()
  for (let page = 0; page < maxPages; page += 1) {
    if (seen.has(path)) throw new Error('HighLevel contact pagination loop detected')
    seen.add(path)
    const data = await ghlFetch(path, {
      token,
      version: '2021-07-28',
    })
    const batch = Array.isArray(data.contacts) ? data.contacts : []
    contacts.push(...batch)
    const next = data.meta?.nextPageUrl
    if (!next) return contacts
    const parsed = new URL(next, API_ROOT)
    if (parsed.origin !== API_ROOT) throw new Error('Unexpected HighLevel pagination host')
    path = `${parsed.pathname}${parsed.search}`
  }
  console.error(`[roadmap-email] contact scan truncated after ${maxPages * 100} contacts`)
  return contacts
}

export function firstEmailStep() {
  return EMAIL_STEPS[0]
}
