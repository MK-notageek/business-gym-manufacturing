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
//      repeated digits, long sequences, repeating motifs and palindromes.
//
// Accepted:  021 314 8296 · 0213148296 · 09 376 5210 · +64 21 314 8296
// Rejected:  +61 412 345 678 · 021 000 000 · 021 123 4567 · 021 121 2121
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

function isShortPeriodicPattern(digits) {
  for (let width = 1; width <= 3; width++) {
    if (digits.length < width * 2) continue
    let periodic = true
    for (let i = width; i < digits.length; i++) {
      if (digits[i] !== digits[i % width]) {
        periodic = false
        break
      }
    }
    if (periodic) return true
  }
  return false
}

// Inspect the subscriber portion so a legitimate-looking NZ prefix cannot hide
// a fake body: 021 000 000, 021 123 4567, 021 121 2121, or 021 122 1221.
function isJunkDigits(nationalDigits, type) {
  const prefixLength = type === 'MOBILE' ? 2 : 1
  const subscriber = nationalDigits.slice(prefixLength)
  const counts = [...subscriber].reduce((all, digit) => {
    all[digit] = (all[digit] || 0) + 1
    return all
  }, {})

  if (new Set(subscriber).size < 3) return true
  if (/(\d)\1{4}/.test(subscriber)) return true
  if (Math.max(...Object.values(counts)) >= Math.ceil(subscriber.length * 0.75)) return true
  if (hasSequentialRun(subscriber)) return true
  if (isShortPeriodicPattern(subscriber)) return true
  if (subscriber.length >= 6 && subscriber === [...subscriber].reverse().join('')) return true
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
