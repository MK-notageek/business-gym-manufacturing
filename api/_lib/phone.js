// Phone validation, any country, real numbers only.
//
// The old check was "6-15 digits", which let junk like 2222222 straight through —
// that is what most bogus leads actually look like. libphonenumber-js checks the
// number against the real numbering plan of its country (prefix AND length), and
// the junk guard below kills the shapes a plan can't rule out (all one digit,
// straight runs like 1234567890).
//
// Numbers without a leading + are read as New Zealand, since that is the audience.
// Overseas leads must type + and their country code — the error copy says so.
//
// Keep in sync with src/lib/phone.ts (same logic, TypeScript).
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const DEFAULT_COUNTRY = 'NZ'

// Fewer than 3 distinct digits (2222222222), or a straight run up or down with
// wraparound (1234567890, 9876543210). No real number looks like this.
function isJunkDigits(digits) {
  if (new Set(digits).size < 3) return true
  let ascending = true
  let descending = true
  for (let i = 1; i < digits.length; i++) {
    const step = (digits.charCodeAt(i) - digits.charCodeAt(i - 1) + 10) % 10
    if (step !== 1) ascending = false
    if (step !== 9) descending = false
  }
  return ascending || descending
}

// Returns the number in E.164 ('+64211234567'), or '' if it is not a real number.
export function normalizePhone(raw) {
  const value = String(raw || '').trim()
  if (!value) return ''
  // Reject letters early so 'asdf' never reaches the parser.
  if (!/^\+?[\d\s().\-–—]+$/.test(value)) return ''

  let parsed
  try {
    parsed = parsePhoneNumberFromString(value, DEFAULT_COUNTRY)
  } catch {
    return ''
  }
  if (!parsed || !parsed.isValid()) return ''
  if (isJunkDigits(String(parsed.nationalNumber))) return ''
  return parsed.number
}

export function isValidPhone(raw) {
  return normalizePhone(raw) !== ''
}
