// Client-side twin of api/_lib/phone.js — keep both in sync. If the browser is
// laxer than the server the lead only finds out at the final submit, so the two
// must accept exactly the same set of numbers.
//
// New Zealand numbers only: valid against the real NZ numbering plan, and not junk
// like 2222222. See api/_lib/phone.js for the full reasoning.
import { parsePhoneNumberFromString } from 'libphonenumber-js/max'

const COUNTRY = 'NZ'
const CALLING_CODE = '64'
const CALLABLE_TYPES = new Set(['MOBILE', 'FIXED_LINE', 'FIXED_LINE_OR_MOBILE'])

function hasSequentialRun(digits: string, minimum = 6): boolean {
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

function isShortPeriodicPattern(digits: string): boolean {
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

function isJunkDigits(nationalDigits: string, type: string): boolean {
  const prefixLength = type === 'MOBILE' ? 2 : 1
  const subscriber = nationalDigits.slice(prefixLength)
  const counts = [...subscriber].reduce<Record<string, number>>((all, digit) => {
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
  const type = parsed.getType()
  if (!type || !CALLABLE_TYPES.has(type)) return ''
  if (isJunkDigits(String(parsed.nationalNumber), type)) return ''
  return parsed.number
}

export function isValidPhone(raw: string): boolean {
  return normalizePhone(raw) !== ''
}
