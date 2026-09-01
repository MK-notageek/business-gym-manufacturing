import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizePhone, isValidPhone, isOverseasPhone } from '../api/_lib/phone.js'

// Real NZ numbers, in the shapes people actually type them.
const VALID = [
  ['021 123 4567',    '+64211234567'],
  ['0211234567',      '+64211234567'],
  ['+64 21 123 4567', '+64211234567'],
  ['64211234567',     '+64211234567'],
  ['0064 21 123 4567', '+64211234567'],
  ['(09) 123-4567',   '+6491234567'],
  ['027 555 1234',    '+64275551234'],
  ['+64-3-477-4000',  '+6434774000'],
  ['022 123 4567',    '+64221234567'],
  [' 021 123 4567 ',  '+64211234567'],
]

// The junk this validation exists to stop, plus every non-NZ country.
const INVALID = [
  '2222222',        // the actual pattern seen on live leads
  '222222',
  '2222222222',     // right length for an NZ mobile, still one repeated digit
  '021 000 000',    // valid NZ shape, but an obvious repeated-digit placeholder
  '021 111 111',
  '1111111111',
  '0000000000',
  '1234567890',     // straight run up, wraps 9→0
  '9876543210',     // straight run down
  '999999999',
  '5555555555',
  '0123456789',
  'asdf',
  'abc123def',
  '+64',
  '123',
  '021 123',        // too short for the NZ plan
  '021 123 4567 890', // too long for the NZ plan
  '+61 412 345 678',  // AU — valid number, wrong country
  '+1 415 555 2671',  // US
  '+44 7911 123456',  // UK
  '+92 300 1234567',  // PK
  '0412345678',       // AU local form: parses as NZ-shaped junk, must be rejected
  '+64 21 123 456789012',
  '',
  '   ',
]

test('accepts real NZ numbers and returns E.164', () => {
  for (const [input, expected] of VALID) {
    assert.equal(normalizePhone(input), expected, `expected ${input} to normalize to ${expected}`)
    assert.equal(isValidPhone(input), true)
  }
})

test('rejects junk and non-NZ numbers', () => {
  for (const input of INVALID) {
    assert.equal(normalizePhone(input), '', `expected ${JSON.stringify(input)} to be rejected`)
    assert.equal(isValidPhone(input), false)
  }
})

test('flags a foreign country code so the form can say NZ only', () => {
  for (const input of ['+61 412 345 678', '+1 415 555 2671', '0061412345678']) {
    assert.equal(isOverseasPhone(input), true, `expected ${input} to read as overseas`)
  }
  for (const input of ['021 123 4567', '+64 21 123 4567', '0064211234567', '2222222', '']) {
    assert.equal(isOverseasPhone(input), false, `expected ${input} not to read as overseas`)
  }
})
