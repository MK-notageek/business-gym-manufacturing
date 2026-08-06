// Phone validation, New Zealand numbers only, real numbers only.
//
// History: this started NZ-only, was opened up to every country, and that was too
// loose — junk like 2222222 and overseas numbers came through. It is back to
// NZ-only, because the audience is NZ and a number we can't ring is worthless.
//
// Two gates, both needed:
//   1. libphonenumber-js checks the number against the real NZ numbering plan
//      (prefix AND length), then we require the result to actually be +64.
//   2. The junk guard below kills the shapes a numbering plan can't rule out —
//      all one digit (2222222222), straight runs (1234567890, 9876543210).
//
// Accepted:  021 123 4567 · 0211234567 · (09) 123-4567 · +64 21 123 4567 · 0064 21 …
// Rejected:  +61 412 345 678 · +1 415 555 2671 · 2222222 · asdf
//
// Keep in sync with src/lib/phone.ts (same logic, TypeScript).
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const COUNTRY = 'NZ'
const CALLING_CODE = '64'

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

// True when the lead has clearly typed a foreign country code, so the form can say
// "NZ only" instead of the generic "that isn't a real number".
export function isOverseasPhone(raw) {
  const value = String(raw || '').replace(/[\s().\-–—]/g, '')
  if (value.startsWith('+')) return !value.startsWith('+' + CALLING_CODE)
  if (value.startsWith('00')) return !value.startsWith('00' + CALLING_CODE)
  return false
}

// Returns the number in E.164 ('+64211234567'), or '' if it is not a real NZ number.
export function normalizePhone(raw) {
  const value = String(raw || '').trim()
  if (!value) return ''
  // Reject letters early so 'asdf' never reaches the parser.
  if (!/^\+?[\d\s().\-–—]+$/.test(value)) return ''

  let parsed
  try {
    parsed = parsePhoneNumberFromString(value, COUNTRY)
  } catch {
    return ''
  }
  if (!parsed || !parsed.isValid()) return ''
  // +61 / +1 / +44 parse perfectly well — they are simply not this audience.
  if (parsed.countryCallingCode !== CALLING_CODE) return ''
  // +64 also covers Pitcairn; only NZ counts.
  if (parsed.country && parsed.country !== COUNTRY) return ''
  if (isJunkDigits(String(parsed.nationalNumber))) return ''
  return parsed.number
}

export function isValidPhone(raw) {
  return normalizePhone(raw) !== ''
}
