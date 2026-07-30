function parseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

function duplicateDetails(data) {
  const contactId = data?.meta?.contactId || data?.contact?.id || null
  const matchingField = String(data?.meta?.matchingField || '').toLowerCase()
  return { contactId, matchingField }
}

export async function updateContactWithPhoneFallback({
  contactId,
  body,
  headers,
  logPrefix,
}) {
  const url = `https://services.leadconnectorhq.com/contacts/${contactId}`
  const send = payload => fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload),
  })

  const response = await send(body)
  const text = await response.text()
  console.log(`[${logPrefix}]`, contactId, '→', response.status, text.slice(0, 300))
  if (response.ok) return { phoneStored: Boolean(body.phone) }

  const duplicate = duplicateDetails(parseJson(text))
  if (body.phone && duplicate.contactId && duplicate.matchingField === 'phone') {
    const retryBody = { ...body }
    delete retryBody.phone
    console.warn(`[${logPrefix}] phone already belongs to another contact; retrying without phone`)

    const retry = await send(retryBody)
    const retryText = await retry.text()
    console.log(`[${logPrefix} without phone]`, contactId, '→', retry.status, retryText.slice(0, 300))
    if (retry.ok) {
      return {
        phoneStored: false,
        duplicatePhoneContactId: duplicate.contactId,
      }
    }
    throw new Error(`GHL contact update without phone failed (${retry.status}): ${retryText.slice(0, 200)}`)
  }

  throw new Error(`GHL contact update failed (${response.status}): ${text.slice(0, 200)}`)
}

export async function createContactWithPhoneFallback({
  body,
  headers,
  logPrefix,
}) {
  const url = 'https://services.leadconnectorhq.com/contacts/'
  const send = payload => fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  const response = await send(body)
  const text = await response.text()
  const data = parseJson(text)
  console.log(`[${logPrefix}] →`, response.status, JSON.stringify(data).slice(0, 400))
  if (response.ok && data?.contact?.id) {
    return { contactId: data.contact.id, phoneStored: Boolean(body.phone), existing: false }
  }

  const duplicate = duplicateDetails(data)
  if (body.phone && duplicate.contactId && duplicate.matchingField === 'phone') {
    const retryBody = { ...body }
    delete retryBody.phone
    console.warn(`[${logPrefix}] phone already belongs to another contact; creating without phone`)

    const retry = await send(retryBody)
    const retryText = await retry.text()
    const retryData = parseJson(retryText)
    console.log(`[${logPrefix} without phone] →`, retry.status, JSON.stringify(retryData).slice(0, 400))
    if (retry.ok && retryData?.contact?.id) {
      return { contactId: retryData.contact.id, phoneStored: false, existing: false }
    }

    const retryDuplicate = duplicateDetails(retryData)
    if (retryDuplicate.contactId) {
      return { contactId: retryDuplicate.contactId, phoneStored: false, existing: true }
    }
    throw new Error(`GHL contact create without phone failed (${retry.status}): ${retryText.slice(0, 200)}`)
  }

  if (duplicate.contactId) {
    return {
      contactId: duplicate.contactId,
      phoneStored: duplicate.matchingField !== 'phone',
      existing: true,
    }
  }
  throw new Error(`GHL contact create failed (${response.status}): ${text.slice(0, 200)}`)
}
