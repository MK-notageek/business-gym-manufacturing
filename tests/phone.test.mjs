import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizePhone, isValidPhone } from '../api/_lib/phone.js'

// Real numbers, in the shapes people actually type them.
const VALID = [
  ['021 123 4567',    '+64211234567'],
  ['0211234567',      '+64211234567'],
  ['+64 21 123 4567', '+64211234567'],
  ['(09) 123-4567',   '+6491234567'],
  ['027 555 1234',    '+64275551234'],
  ['+64-3-477-4000',  '+6434774000'],
  ['+61 412 345 678', '+61412345678'],
  ['+1 415 555 2671', '+14155552671'],
  ['+44 7911 123456', '+447911123456'],
  ['+92 300 1234567', '+923001234567'],
]

// The junk this validation exists to stop, plus the old check's blind spots.
const INVALID = [
  '2222222',        // the actual pattern seen on live leads
  '222222',
  '2222222222',     // right length for an NZ mobile, still one repeated digit
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
  '0412345678',     // AU local form: ambiguous without +61, must be rejected
  '+64 21 123 456789012',
  '',
  '   ',
]

test('accepts real numbers and returns E.164', () => {
  for (const [input, expected] of VALID) {
    assert.equal(normalizePhone(input), expected, `expected ${input} to normalize to ${expected}`)
    assert.equal(isValidPhone(input), true)
  }
})

test('rejects junk numbers', () => {
  for (const input of INVALID) {
    assert.equal(normalizePhone(input), '', `expected ${JSON.stringify(input)} to be rejected`)
    assert.equal(isValidPhone(input), false)
  }
})
