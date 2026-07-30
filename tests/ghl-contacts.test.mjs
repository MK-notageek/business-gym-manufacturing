import assert from 'node:assert/strict'
import test from 'node:test'

import { createContactWithPhoneFallback, updateContactWithPhoneFallback } from '../api/_lib/ghl-contacts.js'

function response(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

test('an existing email contact is updated without overwriting a duplicate phone owner', async t => {
  const requests = []
  const originalFetch = globalThis.fetch
  t.after(() => { globalThis.fetch = originalFetch })
  globalThis.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body))
    if (requests.length === 1) {
      return response(400, {
        message: 'This location does not allow duplicated contacts.',
        meta: { contactId: 'phone-owner', matchingField: 'phone' },
      })
    }
    return response(200, { contact: { id: 'new-lead' } })
  }

  const result = await updateContactWithPhoneFallback({
    contactId: 'new-lead',
    body: {
      email: 'lead@example.com',
      phone: '+44 20 7946 0958',
      customFields: [{ id: 'revenue', fieldValue: '$1M–$2M' }],
    },
    headers: {},
    logPrefix: 'test',
  })

  assert.equal(result.phoneStored, false)
  assert.equal(requests.length, 2)
  assert.equal(requests[0].phone, '+44 20 7946 0958')
  assert.equal('phone' in requests[1], false)
  assert.deepEqual(requests[1].customFields, [{ id: 'revenue', fieldValue: '$1M–$2M' }])
})

test('a new lead retries creation without a phone already owned by another contact', async t => {
  const requests = []
  const originalFetch = globalThis.fetch
  t.after(() => { globalThis.fetch = originalFetch })
  globalThis.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body))
    if (requests.length === 1) {
      return response(400, {
        message: 'This location does not allow duplicated contacts.',
        meta: { contactId: 'phone-owner', matchingField: 'phone' },
      })
    }
    return response(201, { contact: { id: 'new-lead' } })
  }

  const result = await createContactWithPhoneFallback({
    body: {
      email: 'lead@example.com',
      phone: '+61 2 9374 4000',
      locationId: 'location',
    },
    headers: {},
    logPrefix: 'test',
  })

  assert.deepEqual(result, { contactId: 'new-lead', phoneStored: false, existing: false })
  assert.equal(requests.length, 2)
  assert.equal('phone' in requests[1], false)
})
