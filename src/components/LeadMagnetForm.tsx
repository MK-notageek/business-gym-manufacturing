import { useState, useRef, FormEvent, FocusEvent, ChangeEvent } from 'react'

// Shared form for both hero variants. Two-step progression matching the original
// GHL survey: Step 1 captures name/email/phone and triggers the partial-contact
// create on "Continue". Step 2 captures the qualifying dropdowns. Final Submit
// replaces the tags so `partial` drops off and `lead-magnet-survey-submitted` lands.

type Values = {
  full_name: string
  email: string
  phone: string
  number_of_staff: string
  annual_revenue: string
  biggest_challenge: string
  hours_on_floor: string
}

const EMPTY: Values = {
  full_name: '', email: '', phone: '',
  number_of_staff: '', annual_revenue: '', biggest_challenge: '', hours_on_floor: '',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// NZ phone validation. type="tel" only changes the mobile keyboard — it does NOT
// enforce a format — so junk ("asdf", "123") passes unless we check here. Accepts
// +64 / 0064 / 64 / leading-0 forms with spaces, dashes, parens, dots; rejects
// letters and too-short input. NZ national significant numbers run 8 (landline)
// to 10 (mobile) digits once the country code / leading 0 is stripped.
function isValidNZPhone(raw: string): boolean {
  const cleaned = raw.trim().replace(/[\s().-]/g, '')
  if (!/^\+?\d{6,}$/.test(cleaned)) return false
  let national = cleaned.replace(/\D/g, '')
  // Strip country code (0064 exit-code form first, then bare 64) or leading trunk 0.
  if (national.startsWith('0064')) national = national.slice(4)
  else if (national.startsWith('64')) national = national.slice(2)
  else if (national.startsWith('0')) national = national.slice(1)
  return national.length >= 8 && national.length <= 10
}

function getCookie(name: string): string {
  const m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : ''
}

function getMetaTest(): string {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('meta_test') || ''
}

function genEventId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function readVariantCookie(): string {
  if (typeof document === 'undefined') return 'headline-30pct'
  const m = document.cookie.match(/(?:^|;\s*)pba-variant=(headline-30pct|headline-10hrs)/)
  return m?.[1] ?? 'headline-30pct'
}

// Pre-warm the GHL calendar widget once the user starts engaging with the form,
// so by the time they reach /thank-you the iframe's HTML/JS/CSS/fonts/slot API
// responses are already in the browser HTTP cache. URL is intentionally params-
// less — assets cache by path, so the real iframe (with first_name/email/etc.)
// reuses every sub-resource even though its document URL differs.
const WARM_CAL_URL = 'https://link.growthhub.net.nz/widget/bookings/profit-roadmap-session'

export default function LeadMagnetForm() {
  const [step, setStep] = useState<1 | 2>(1)
  const [values, setValues] = useState<Values>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({})
  const [warmCal, setWarmCal] = useState(false)

  const valuesRef = useRef<Values>(values)
  const contactIdRef = useRef<string | null>(null)
  const creatingPromiseRef = useRef<Promise<string | null> | null>(null)
  const lastSentRef = useRef<Record<string, string>>({})

  valuesRef.current = values

  function triggerWarm() {
    if (!warmCal) setWarmCal(true)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const name = e.target.name as keyof Values
    setValues(v => ({ ...v, [name]: e.target.value }))
    if (errors[name]) setErrors(x => ({ ...x, [name]: undefined }))
    triggerWarm()
  }

  async function createPartialContact(buf: Values): Promise<string | null> {
    try {
      const eid = genEventId()
      const res = await fetch('/api/partial-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...buf,
          lp_variant: readVariantCookie(),
          meta_event_id: eid,
          meta_fbp: getCookie('_fbp'),
          meta_fbc: getCookie('_fbc'),
          meta_source_url: window.location.href,
          meta_test_event_code: getMetaTest(),
        }),
      })
      const data = await res.json().catch(() => ({} as any))
      if (res.ok && data.contactId) {
        contactIdRef.current = data.contactId
        for (const [k, v] of Object.entries(buf)) {
          if (typeof v === 'string' && v.trim()) lastSentRef.current[k] = v
        }
        if (typeof window !== 'undefined' && (window as any).fbq) {
          if (buf.email || buf.phone) {
            (window as any).fbq('init', '1420845489575315', { ...(buf.email ? { em: buf.email } : {}), ...(buf.phone ? { ph: buf.phone } : {}) });
          }
          (window as any).fbq('track', 'InitiateCheckout', {}, { eventID: eid })
        }
        return data.contactId
      }
      console.warn('[partial] create missing contactId', res.status, data)
      return null
    } catch (err: any) {
      console.warn('[partial] create threw', err?.message)
      return null
    }
  }

  async function updateField(field: keyof Values, value: string) {
    if (!contactIdRef.current) return
    try {
      const res = await fetch('/api/update-contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: contactIdRef.current, [field]: value, lp_variant: readVariantCookie() }),
      })
      if (res.ok) lastSentRef.current[field] = value
      else console.warn('[partial] update failed', res.status)
    } catch (err: any) {
      console.warn('[partial] update threw', err?.message)
    }
  }

  async function handleBlur(e: FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    const field = e.target.name as keyof Values
    const value = (e.target.value || '').trim()

    if (!value) return
    if (field === 'email' && !EMAIL_RE.test(value)) return
    if (field === 'phone' && !isValidNZPhone(value)) return
    if (lastSentRef.current[field] === value) return

    if (contactIdRef.current) { await updateField(field, value); return }

    if (creatingPromiseRef.current) {
      const id = await creatingPromiseRef.current
      if (id && lastSentRef.current[field] !== value) await updateField(field, value)
      return
    }

    const buf: Values = { ...valuesRef.current, [field]: value }
    const emailValid = EMAIL_RE.test((buf.email || '').trim())
    const nameValid = !!(buf.full_name || '').trim()
    if (emailValid && nameValid) {
      creatingPromiseRef.current = createPartialContact(buf)
      await creatingPromiseRef.current
      creatingPromiseRef.current = null
    }
  }

  function validateStep1(): boolean {
    const next: typeof errors = {}
    if (!values.full_name.trim()) next.full_name = 'Required'
    if (!values.email.trim()) next.email = 'Required'
    else if (!EMAIL_RE.test(values.email.trim())) next.email = 'Enter a valid email'
    if (!values.phone.trim()) next.phone = 'Required'
    else if (!isValidNZPhone(values.phone)) next.phone = 'Enter a valid NZ phone number'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleContinue() {
    if (!validateStep1()) return
    // Fire partial create if blur hasn't already — e.g. user tabbed fast.
    if (!contactIdRef.current && !creatingPromiseRef.current) {
      creatingPromiseRef.current = createPartialContact(valuesRef.current)
      await creatingPromiseRef.current
      creatingPromiseRef.current = null
    }
    setStep(2)
  }

  function validateStep2(): boolean {
    const next: typeof errors = {}
    if (!values.annual_revenue) next.annual_revenue = 'Required'
    if (!values.number_of_staff) next.number_of_staff = 'Required'
    if (!values.biggest_challenge) next.biggest_challenge = 'Required'
    if (!values.hours_on_floor) next.hours_on_floor = 'Required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validateStep2()) return
    setStatus('loading')
    try {
      const eid = genEventId()
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          contactId: contactIdRef.current,
          lp_variant: readVariantCookie(),
          meta_event_id: eid,
          meta_fbp: getCookie('_fbp'),
          meta_fbc: getCookie('_fbc'),
          meta_source_url: window.location.href,
          meta_test_event_code: getMetaTest(),
        }),
      })
      if (!res.ok) throw new Error('failed')
      if (typeof window !== 'undefined' && (window as any).fbq) {
        if (values.email || values.phone) {
          (window as any).fbq('init', '1420845489575315', { ...(values.email ? { em: values.email } : {}), ...(values.phone ? { ph: values.phone } : {}) });
        }
        (window as any).fbq('track', 'Lead', {}, { eventID: eid })
      }
      const rev = values.annual_revenue === '<$1M' ? 'low' : 'high'
      const fullName = values.full_name.trim()
      const qs = new URLSearchParams({ rev })
      // GHL booking widget for this calendar uses a single "Full Name" field —
      // it reads `full_name` from the URL, not first_name/last_name. Keep both
      // aliases so we tolerate any GHL config drift.
      if (fullName) {
        qs.set('full_name', fullName)
        qs.set('name', fullName)
      }
      const trimmedEmail = values.email.trim()
      if (trimmedEmail) qs.set('email', trimmedEmail)
      const trimmedPhone = values.phone.trim()
      if (trimmedPhone) qs.set('phone', trimmedPhone)
      if (contactIdRef.current) qs.set('cid', contactIdRef.current)
      const mt = getMetaTest()
      if (mt) qs.set('meta_test', mt)
      window.location.href = `/thank-you?${qs.toString()}`
    } catch {
      setStatus('error')
    }
  }

  return (
    <form className="lm-form" onSubmit={handleSubmit} onFocusCapture={triggerWarm} noValidate>
      <style>{`
        .lm-form{max-width:520px;margin:0 auto;background:linear-gradient(180deg,rgba(22,20,42,.78),rgba(10,10,20,.85));border:1px solid rgba(139,83,236,.28);border-radius:24px;padding:clamp(28px,4vw,40px);position:relative;backdrop-filter:blur(24px) saturate(140%);-webkit-backdrop-filter:blur(24px) saturate(140%);box-shadow:0 24px 80px rgba(0,0,0,.4),0 1px 0 rgba(255,255,255,.06) inset;display:flex;flex-direction:column;gap:20px}
        .lm-form::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(139,83,236,.7),rgba(35,175,254,.7),transparent);border-radius:24px 24px 0 0}

        .lm-steps{display:flex;gap:8px;margin-bottom:6px}
        .lm-step{flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;position:relative}
        .lm-step.on{background:linear-gradient(90deg,#8b53ec,#23affe)}
        .lm-step-label{font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.5)}
        .lm-step-label b{color:#fff;background:linear-gradient(135deg,#8b53ec,#23affe);-webkit-background-clip:text;-webkit-text-fill-color:transparent}

        .lm-field{display:flex;flex-direction:column;gap:6px;position:relative}
        .lm-label{font-size:11px;font-weight:700;color:rgba(255,255,255,.55);letter-spacing:.12em;text-transform:uppercase;transition:color .2s ease}
        .lm-field:focus-within .lm-label{color:rgba(255,255,255,.9)}
        .lm-req{color:#ff7a8a;margin-left:2px}
        .lm-input,.lm-select{width:100%;background:rgba(10,10,20,.55);border:1.5px solid rgba(139,83,236,.18);border-radius:12px;padding:14px 16px;font-size:15px;color:#fff;font-family:inherit;outline:none;transition:border-color .25s ease,background .25s ease,box-shadow .25s ease;appearance:none;-webkit-appearance:none;font-variant-numeric:tabular-nums}
        .lm-input::placeholder{color:rgba(255,255,255,.32)}
        .lm-input:hover,.lm-select:hover{border-color:rgba(139,83,236,.4);background:rgba(10,10,20,.7)}
        .lm-input:focus,.lm-select:focus{border-color:rgba(139,83,236,.75);background:rgba(10,10,20,.92);box-shadow:0 0 0 4px rgba(139,83,236,.16)}
        .lm-select{cursor:pointer;padding-right:40px;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1.5L6 6.5L11 1.5' stroke='white' stroke-opacity='.65' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/></svg>");background-repeat:no-repeat;background-position:right 16px center}
        .lm-select option{background:#0a0a14;color:#fff}
        .lm-select:invalid{color:rgba(255,255,255,.45)}
        .lm-err-field{border-color:#ef4444 !important}
        .lm-err-msg{font-size:12px;color:#fca5a5;margin-top:2px}

        .lm-btn{background:linear-gradient(135deg,#8b53ec,#23affe);color:#fff;font-weight:700;font-size:15px;padding:16px 32px;border-radius:999px;border:none;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 4px 20px rgba(139,83,236,.32);transition:transform .18s ease,box-shadow .18s ease,opacity .18s;margin-top:4px;letter-spacing:-.005em;font-family:inherit;display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px}
        .lm-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 10px 36px rgba(139,83,236,.45)}
        .lm-btn:active:not(:disabled){transform:translateY(0)}
        .lm-btn:disabled{opacity:.6;cursor:not-allowed}
        .lm-btn-back{background:transparent;border:1.5px solid rgba(255,255,255,.2);box-shadow:none;color:rgba(255,255,255,.8);font-weight:600;font-size:14px;padding:13px 24px}
        .lm-btn-back:hover:not(:disabled){border-color:rgba(255,255,255,.4);transform:none;box-shadow:none}
        .lm-btn-row{display:flex;gap:10px;align-items:center;margin-top:6px}
        .lm-btn-row .lm-btn{flex:1;margin-top:0}

        .lm-note{font-size:12px;color:rgba(255,255,255,.45);text-align:center;margin-top:-4px}
        .lm-err{color:#fca5a5;font-size:13px;text-align:center}
      `}</style>

      {step === 1 && (
        <>
          <div className="lm-field">
            <label className="lm-label" htmlFor="full_name">Full name <span className="lm-req">*</span></label>
            <input id="full_name" className={`lm-input ${errors.full_name?'lm-err-field':''}`}
              type="text" name="full_name" placeholder="Jane Smith" autoComplete="name" required aria-required="true"
              value={values.full_name} onChange={handleChange} onBlur={handleBlur}
            />
            {errors.full_name && <span className="lm-err-msg">{errors.full_name}</span>}
          </div>
          <div className="lm-field">
            <label className="lm-label" htmlFor="email">Email <span className="lm-req">*</span></label>
            <input id="email" className={`lm-input ${errors.email?'lm-err-field':''}`}
              type="email" name="email" placeholder="jane@company.co.nz" autoComplete="email" required aria-required="true"
              value={values.email} onChange={handleChange} onBlur={handleBlur}
            />
            {errors.email && <span className="lm-err-msg">{errors.email}</span>}
          </div>
          <div className="lm-field">
            <label className="lm-label" htmlFor="phone">Phone / WhatsApp <span className="lm-req">*</span></label>
            <input id="phone" className={`lm-input ${errors.phone?'lm-err-field':''}`}
              type="tel" name="phone" placeholder="+64 21 000 0000" autoComplete="tel" required aria-required="true"
              value={values.phone} onChange={handleChange} onBlur={handleBlur}
            />
            {errors.phone && <span className="lm-err-msg">{errors.phone}</span>}
          </div>
          <button type="button" className="lm-btn" onClick={handleContinue}>Continue →</button>
          <p className="lm-note">30 seconds. Completely free.</p>
        </>
      )}

      {step === 2 && (
        <>
          <div className="lm-field">
            <label className="lm-label" htmlFor="annual_revenue">Annual revenue <span className="lm-req">*</span></label>
            <select id="annual_revenue" className={`lm-select ${errors.annual_revenue?'lm-err-field':''}`}
              name="annual_revenue" value={values.annual_revenue} onChange={handleChange} onBlur={handleBlur} required aria-required="true">
              <option value="" disabled>Select your range</option>
              <option value="<$1M">&lt;$1M</option>
              <option value="$1M–$2M">$1M–$2M</option>
              <option value="$2M–$5M">$2M–$5M</option>
              <option value="$5M–$10M">$5M–$10M</option>
              <option value="$10M+">$10M+</option>
            </select>
            {errors.annual_revenue && <span className="lm-err-msg">{errors.annual_revenue}</span>}
          </div>
          <div className="lm-field">
            <label className="lm-label" htmlFor="number_of_staff">Number of staff <span className="lm-req">*</span></label>
            <select id="number_of_staff" className={`lm-select ${errors.number_of_staff?'lm-err-field':''}`}
              name="number_of_staff" value={values.number_of_staff} onChange={handleChange} onBlur={handleBlur} required aria-required="true">
              <option value="" disabled>Select staff count</option>
              <option value="1-3">1-3</option>
              <option value="4-10">4-10</option>
              <option value="11-20">11-20</option>
              <option value="20+">20+</option>
            </select>
            {errors.number_of_staff && <span className="lm-err-msg">{errors.number_of_staff}</span>}
          </div>
          <div className="lm-field">
            <label className="lm-label" htmlFor="biggest_challenge">Biggest challenge <span className="lm-req">*</span></label>
            <select id="biggest_challenge" className={`lm-select ${errors.biggest_challenge?'lm-err-field':''}`}
              name="biggest_challenge" value={values.biggest_challenge} onChange={handleChange} onBlur={handleBlur} required aria-required="true">
              <option value="" disabled>What hurts the most?</option>
              <option value="Margins shrinking">Margins shrinking</option>
              <option value="Stuck on the floor">Stuck on the floor</option>
              <option value="Cash flow">Cash flow</option>
              <option value="Staff retention">Staff retention</option>
              <option value="Growth">Growth</option>
            </select>
            {errors.biggest_challenge && <span className="lm-err-msg">{errors.biggest_challenge}</span>}
          </div>
          <div className="lm-field">
            <label className="lm-label" htmlFor="hours_on_floor">Hours at work <span className="lm-req">*</span></label>
            <select id="hours_on_floor" className={`lm-select ${errors.hours_on_floor?'lm-err-field':''}`}
              name="hours_on_floor" value={values.hours_on_floor} onChange={handleChange} onBlur={handleBlur} required aria-required="true">
              <option value="" disabled>Hours per week</option>
              <option value="Under 20">Under 20</option>
              <option value="20-40">20-40</option>
              <option value="40-60">40-60</option>
              <option value="60+">60+</option>
            </select>
            {errors.hours_on_floor && <span className="lm-err-msg">{errors.hours_on_floor}</span>}
          </div>
          <button type="submit" className="lm-btn" style={{alignSelf:'center',minWidth:260}} disabled={status==='loading'}>
            {status === 'loading' ? 'Sending…' : 'Get My Free Profit Roadmap →'}
          </button>
          {status === 'error' && <p className="lm-err">Something went wrong. Please try again.</p>}
        </>
      )}

      {warmCal && (
        <iframe
          src={WARM_CAL_URL}
          title=""
          aria-hidden="true"
          tabIndex={-1}
          style={{position:'absolute',width:1,height:1,opacity:0,pointerEvents:'none',left:-9999,top:-9999,border:0}}
        />
      )}
    </form>
  )
}
