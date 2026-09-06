// Phone validation, New Zealand numbers only, real numbers only.
//
// History: this started NZ-only, was opened up to every country, and that was too
// loose — junk like 2222222 and overseas numbers came through. It is back to
// NZ-only, because the audience is NZ and a number we can't ring is worthless.
//
// Two gates, both needed:
//   1. Full libphonenumber metadata checks the NZ prefix, length and callable
//      type; only mobile and fixed-line numbers survive.
//   2. The junk guard checks the subscriber part, not only the whole number, for
//      repeated digits, long runs and short repeating motifs. Deliberately NOT
//      palindromes or 3-digit periods -- those rejected real customers.
//
// Accepted:  021 314 8296 · 0213148296 · 09 376 5210 · +64 21 314 8296
// Rejected:  +61 412 345 678 · 021 000 000 · 021 123 4567 · 021 121 2121
// Kept (real leads that a stricter guard used to reject):  027 536 6635 · 021 405 405
//
// Keep in sync with src/lib/phone.ts (same logic, TypeScript).
import { parsePhoneNumberFromString } from 'libphonenumber-js/max'

const COUNTRY = 'NZ'
const CALLING_CODE = '64'
const CALLABLE_TYPES = new Set(['MOBILE', 'FIXED_LINE', 'FIXED_LINE_OR_MOBILE'])

function hasSequentialRun(digits, minimum = 6) {
  let ascending = 1
  let descending = 1
  for (let i = 1; i < digits.length; i++) {
    const step = (digits.charCodeAt(i) - digits.charCodeAt(i - 1) + 10) % 10
    ascending = step === 1 ? ascending + 1 : 1
    descending = step === 9 ? descending + 1 : 1
    if (ascending >= minimum || descending >= minimum) return true
  }
  return false
}

function isPeriodic(digits, width) {
  if (digits.length < width * 2) return false
  for (let i = width; i < digits.length; i++) if (digits[i] !== digits[i % width]) return false
  return true
}

// Reject only what nobody could be dialled on. This guard used to be stricter and it was
// rejecting real customers: `027 536 6635` and `027 836 5638` are palindromes, `021 405 405`
// repeats on a 3-digit period, and `027 666 5565` uses only two digits. All four are real
// leads on file with real business emails. A false positive here costs a lead, while a junk
// number that slips through costs one uncallable record, so the bias is deliberate.
function isJunkDigits(nationalDigits, type) {
  const subscriber = nationalDigits.slice(type === 'MOBILE' ? 2 : 1)
  if (!subscriber) return true
  if (new Set(subscriber).size < 2) return true
  if (/(\d)\1{4}/.test(subscriber)) return true
  if (hasSequentialRun(subscriber)) return true
  // 1010101 / 2121212 -- a short motif repeated with almost no variety. A 3-digit period
  // is NOT junk: 405405 is a normal NZ mobile.
  if (new Set(subscriber).size <= 3 && (isPeriodic(subscriber, 1) || isPeriodic(subscriber, 2))) return true
  return false
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
  const type = parsed.getType()
  if (!CALLABLE_TYPES.has(type)) return ''
  if (isJunkDigits(String(parsed.nationalNumber), type)) return ''
  return parsed.number
}

export function isValidPhone(raw) {
  return normalizePhone(raw) !== ''
}
