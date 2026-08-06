// Client-side twin of api/_lib/phone.js — keep both in sync. If the browser is
// laxer than the server the lead only finds out at the final submit, so the two
// must accept exactly the same set of numbers.
//
// New Zealand numbers only: valid against the real NZ numbering plan, and not junk
// like 2222222. See api/_lib/phone.js for the full reasoning.
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const COUNTRY = 'NZ'
const CALLING_CODE = '64'

function isJunkDigits(digits: string): boolean {
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
export function isOverseasPhone(raw: string): boolean {
  const value = String(raw || '').replace(/[\s().\-–—]/g, '')
  if (value.startsWith('+')) return !value.startsWith('+' + CALLING_CODE)
  if (value.startsWith('00')) return !value.startsWith('00' + CALLING_CODE)
  return false
}

// Returns the number in E.164 ('+64211234567'), or '' if it is not a real NZ number.
export function normalizePhone(raw: string): string {
  const value = String(raw || '').trim()
  if (!value) return ''
  if (!/^\+?[\d\s().\-–—]+$/.test(value)) return ''

  let parsed
  try {
    parsed = parsePhoneNumberFromString(value, COUNTRY)
  } catch {
    return ''
  }
  if (!parsed || !parsed.isValid()) return ''
  if (parsed.countryCallingCode !== CALLING_CODE) return ''
  if (parsed.country && parsed.country !== COUNTRY) return ''
  if (isJunkDigits(String(parsed.nationalNumber))) return ''
  return parsed.number
}

export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== ''
}
