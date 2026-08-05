// Client-side twin of api/_lib/phone.js — keep both in sync. If the browser is
// laxer than the server the lead only finds out at the final submit, so the two
// must accept exactly the same set of numbers.
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const DEFAULT_COUNTRY = 'NZ'

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

// Returns the number in E.164 ('+64211234567'), or '' if it is not a real number.
export function normalizePhone(raw: string): string {
  const value = String(raw || '').trim()
  if (!value) return ''
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

export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== ''
}
