import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { isValidPhone, normalizePhone } from '../lib/phone'

type Values = {
  full_name: string
  email: string
  phone: string
  annual_revenue: string
  number_of_staff: string
  biggest_challenge: string
  hours_on_floor: string
}

type Option = { value: string; label: string; hint?: string }

const EMPTY: Values = {
  full_name: '',
  email: '',
  phone: '',
  annual_revenue: '',
  number_of_staff: '',
  biggest_challenge: '',
  hours_on_floor: '',
}

const REVENUE_OPTIONS: Option[] = [
  { value: '<$1M', label: 'Under $1M', hint: 'Getting established' },
  { value: '$1M–$2M', label: '$1M–$2M', hint: 'Growing' },
  { value: '$2M–$5M', label: '$2M–$5M', hint: 'Scaling up' },
  { value: '$5M–$10M', label: '$5M–$10M', hint: 'Established' },
  { value: '$10M+', label: '$10M+', hint: 'Market leader' },
]

const STAFF_OPTIONS: Option[] = [
  { value: '1-3', label: '1–3 staff' },
  { value: '4-10', label: '4–10 staff' },
  { value: '11-20', label: '11–20 staff' },
  { value: '20+', label: '20+ staff' },
]

const CHALLENGE_OPTIONS: Option[] = [
  { value: 'Margins shrinking', label: 'Margins are shrinking' },
  { value: 'Stuck on the floor', label: 'I’m stuck on the floor' },
  { value: 'Cash flow', label: 'Unpredictable cash flow' },
  { value: 'Staff retention', label: 'Keeping good staff' },
  { value: 'Growth', label: 'Growth has stalled' },
]

const HOURS_OPTIONS: Option[] = [
  { value: '<20', label: 'Under 20 hours' },
  { value: '20-30', label: '20–30 hours' },
  { value: '30-40', label: '30–40 hours' },
  { value: '40+', label: '40+ hours' },
]

const STAGES = [
  { key: 'full_name', q: "First, what’s your name?", sub: 'So our PBA advisor knows who they’re helping.' },
  { key: 'email', q: 'Where should we send your Roadmap?', sub: 'Your free copy will land here within 60 seconds.' },
  { key: 'phone', q: 'What’s the best number for you?', sub: 'Outside New Zealand? Start with + and your country code. No spam.' },
  { key: 'annual_revenue', q: 'What does your factory turn over each year?', sub: 'This helps us assess the right growth constraints.' },
  { key: 'number_of_staff', q: 'How many people are on your team?', sub: 'Include everyone working in the business.' },
  { key: 'biggest_challenge', q: 'What is the biggest constraint right now?', sub: 'Pick the one costing you the most.' },
  { key: 'hours_on_floor', q: 'How many hours a week are you working in the business?', sub: 'Your closest estimate is fine.' },
] as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const WARM_CAL_URL = 'https://link.premierbusinessacademy.co.nz/widget/bookings/growth-assessment-session'

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : ''
}

function getMetaTest(): string {
  return new URLSearchParams(window.location.search).get('meta_test') || ''
}

function genEventId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export default function LeadMagnetForm({ variant }: { variant: string }) {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Values>(EMPTY)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')
  const [warmCal, setWarmCal] = useState(false)

  const valuesRef = useRef(values)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const contactIdRef = useRef<string | null>(null)
  const creatingPromiseRef = useRef<Promise<string | null> | null>(null)
  const lastSentRef = useRef<Record<string, string>>({})
  valuesRef.current = values

  useEffect(() => {
    if (step <= 2) setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 60)
  }, [step])

  function triggerWarm() {
    if (!warmCal) setWarmCal(true)
  }

  function setField(field: keyof Values, value: string) {
    setValues(current => ({ ...current, [field]: value }))
    if (error) setError('')
    triggerWarm()
  }

  async function createPartialContact(buffer: Values): Promise<string | null> {
    try {
      const eventId = genEventId()
      const response = await fetch('/api/partial-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...buffer,
          lp_variant: variant,
          meta_event_id: eventId,
          meta_fbp: getCookie('_fbp'),
          meta_fbc: getCookie('_fbc'),
          meta_source_url: window.location.href,
          meta_test_event_code: getMetaTest(),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.contactId) return null

      contactIdRef.current = data.contactId
      Object.entries(buffer).forEach(([key, value]) => {
        if (value.trim()) lastSentRef.current[key] = value
      })
      if (window.fbq) {
        window.fbq('init', '1420845489575315', { em: buffer.email })
        window.fbq('track', 'InitiateCheckout', {}, { eventID: eventId })
      }
      return data.contactId
    } catch {
      return null
    }
  }

  async function ensurePartial(buffer: Values) {
    if (contactIdRef.current || creatingPromiseRef.current) {
      if (creatingPromiseRef.current) await creatingPromiseRef.current
      return
    }
    if (!buffer.full_name.trim() || !EMAIL_RE.test(buffer.email.trim())) return
    creatingPromiseRef.current = createPartialContact(buffer)
    await creatingPromiseRef.current
    creatingPromiseRef.current = null
  }

  async function updateField(field: keyof Values, value: string) {
    if (creatingPromiseRef.current) await creatingPromiseRef.current
    if (!contactIdRef.current || lastSentRef.current[field] === value) return
    try {
      const response = await fetch('/api/update-contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId: contactIdRef.current, [field]: value, lp_variant: variant }),
      })
      if (response.ok) lastSentRef.current[field] = value
    } catch {
      // Partial-field persistence is best effort; final submit still carries everything.
    }
  }

  function validateText(): string {
    if (step === 0 && !values.full_name.trim()) return 'Enter your name'
    if (step === 1 && !EMAIL_RE.test(values.email.trim())) return 'Enter a valid email'
    if (step === 2 && !isValidPhone(values.phone)) {
      return values.phone.trim().startsWith('+')
        ? 'That number isn’t valid for that country code'
        : 'Enter a real phone number — outside NZ, start with + and your country code'
    }
    return ''
  }

  async function advanceText() {
    const validationError = validateText()
    if (validationError) {
      setError(validationError)
      return
    }

    if (step === 1) await ensurePartial(valuesRef.current)
    // Store E.164 so GHL, Slack and the WhatsApp bridge all get a dialable number.
    if (step === 2) {
      const e164 = normalizePhone(values.phone)
      valuesRef.current = { ...valuesRef.current, phone: e164 }
      setField('phone', e164)
      await updateField('phone', e164)
    }
    setStep(current => current + 1)
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      advanceText()
    }
  }

  async function handleBlur() {
    if (step === 1) await ensurePartial(valuesRef.current)
    if (step === 2 && isValidPhone(values.phone)) await updateField('phone', normalizePhone(values.phone))
  }

  function back() {
    setError('')
    setStep(current => Math.max(0, current - 1))
  }

  async function pickOption(field: keyof Values, value: string) {
    const next = { ...valuesRef.current, [field]: value }
    valuesRef.current = next
    setValues(next)
    setError('')
    triggerWarm()
    await updateField(field, value)

    if (step === STAGES.length - 1) await submit(next)
    else setTimeout(() => setStep(current => current + 1), 160)
  }

  async function submit(finalValues: Values) {
    if (status === 'loading') return
    setStatus('loading')
    try {
      const eventId = genEventId()
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...finalValues,
          contactId: contactIdRef.current,
          lp_variant: variant,
          meta_event_id: eventId,
          meta_fbp: getCookie('_fbp'),
          meta_fbc: getCookie('_fbc'),
          meta_source_url: window.location.href,
          meta_test_event_code: getMetaTest(),
        }),
      })
      if (!response.ok) throw new Error('submit failed')

      if (window.fbq) {
        window.fbq('init', '1420845489575315', { em: finalValues.email, ph: finalValues.phone })
        window.fbq('track', 'Lead', {}, { eventID: eventId })
      }

      const query = new URLSearchParams({
        rev: finalValues.annual_revenue === '<$1M' ? 'low' : 'high',
        full_name: finalValues.full_name.trim(),
        name: finalValues.full_name.trim(),
        email: finalValues.email.trim(),
        phone: finalValues.phone.trim(),
      })
      if (contactIdRef.current) query.set('cid', contactIdRef.current)
      const metaTest = getMetaTest()
      if (metaTest) query.set('meta_test', metaTest)
      window.location.href = `/thank-you?${query.toString()}`
    } catch {
      setStatus('error')
    }
  }

  const pct = ((step + 1) / STAGES.length) * 100
  const stage = STAGES[step]
  const options = step === 3
    ? REVENUE_OPTIONS
    : step === 4
      ? STAFF_OPTIONS
      : step === 5
        ? CHALLENGE_OPTIONS
        : HOURS_OPTIONS

  return (
    <div className="lm-form" onFocusCapture={triggerWarm}>
      <style>{`
        .lm-form{max-width:520px;margin:0 auto;background:linear-gradient(180deg,rgba(22,20,42,.82),rgba(10,10,20,.9));border:1px solid rgba(139,83,236,.3);border-radius:24px;padding:clamp(26px,3.4vw,38px);position:relative;backdrop-filter:blur(24px) saturate(140%);box-shadow:0 24px 80px rgba(0,0,0,.45),0 1px 0 rgba(255,255,255,.06) inset;overflow:hidden;text-align:left}
        .lm-form::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(139,83,236,.7),rgba(35,175,254,.7),transparent)}
        .lm-prog-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px;gap:14px}
        .lm-prog-track{flex:1;height:6px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}
        .lm-prog-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#8b53ec,#23affe);transition:width .45s cubic-bezier(.16,1,.3,1)}
        .lm-prog-step{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.5);white-space:nowrap;font-variant-numeric:tabular-nums}
        .lm-stage{animation:lmIn .42s cubic-bezier(.16,1,.3,1)}
        .lm-q{font-family:'DM Sans',sans-serif;font-size:clamp(21px,2.4vw,26px);font-weight:700;line-height:1.2;letter-spacing:-.02em;color:#fff;margin-bottom:6px}
        .lm-sub{font-size:13.5px;color:rgba(255,255,255,.55);margin-bottom:20px;line-height:1.5}
        .lm-input{width:100%;background:rgba(10,10,20,.55);border:1.5px solid rgba(139,83,236,.22);border-radius:14px;padding:17px 18px;font-size:16px;color:#fff;font-family:inherit;outline:none;transition:border-color .25s,background .25s,box-shadow .25s}
        .lm-input::placeholder{color:rgba(255,255,255,.32)}
        .lm-input:hover{border-color:rgba(139,83,236,.42);background:rgba(10,10,20,.72)}
        .lm-input:focus{border-color:rgba(139,83,236,.78);background:rgba(10,10,20,.92);box-shadow:0 0 0 4px rgba(139,83,236,.16)}
        .lm-input.err{border-color:#ef4444}
        .lm-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .lm-opt{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:left;background:rgba(10,10,20,.5);border:1.5px solid rgba(139,83,236,.2);border-radius:14px;padding:14px 15px;font-family:inherit;color:#fff;cursor:pointer;transition:transform .14s,border-color .2s,background .2s,box-shadow .2s;min-height:58px;justify-content:center}
        .lm-opt:hover{border-color:rgba(139,83,236,.6);background:rgba(139,83,236,.1);transform:translateY(-2px)}
        .lm-opt:focus-visible,.lm-btn:focus-visible,.lm-back:focus-visible{outline:3px solid rgba(35,175,254,.8);outline-offset:3px}
        .lm-opt-v{font-size:15px;font-weight:700;letter-spacing:-.01em}
        .lm-opt-h{font-size:11.5px;color:rgba(255,255,255,.5);font-weight:500}
        .lm-row{display:flex;gap:10px;align-items:center;margin-top:20px}
        .lm-btn{flex:1;background:linear-gradient(135deg,#8b53ec,#23affe);color:#fff;font-weight:700;font-size:15.5px;padding:16px 28px;border-radius:999px;border:none;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 4px 20px rgba(139,83,236,.34);transition:transform .18s,box-shadow .18s;font-family:inherit;min-height:52px}
        .lm-btn:hover{transform:translateY(-2px);box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 10px 36px rgba(139,83,236,.48)}
        .lm-btn:active{transform:scale(.98)}
        .lm-back{flex:0 0 auto;background:transparent;border:1.5px solid rgba(255,255,255,.18);color:rgba(255,255,255,.75);font-weight:600;font-size:14px;padding:14px 18px;border-radius:999px;cursor:pointer;font-family:inherit}
        .lm-err{color:#fca5a5;font-size:13px;margin-top:12px;text-align:center}
        .lm-note{font-size:12px;color:rgba(255,255,255,.45);text-align:center;margin-top:14px}
        .lm-load{position:absolute;inset:0;background:rgba(10,10,20,.82);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;z-index:5;border-radius:24px}
        .lm-spin{width:34px;height:34px;border-radius:50%;border:3px solid rgba(139,83,236,.25);border-top-color:#23affe;animation:lmspin .7s linear infinite}
        @keyframes lmspin{to{transform:rotate(360deg)}}
        @keyframes lmIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @media(prefers-reduced-motion:reduce){.lm-stage{animation:none}.lm-prog-fill{transition:none}}
        @media(max-width:420px){.lm-grid{grid-template-columns:1fr}}
      `}</style>

      <div className="lm-prog-row">
        <div className="lm-prog-track"><div className="lm-prog-fill" style={{ width: `${pct}%` }} /></div>
        <div className="lm-prog-step">Step {step + 1} of {STAGES.length}</div>
      </div>

      <div className="lm-stage" key={step}>
        <div className="lm-q">{stage.q}</div>
        <div className="lm-sub">{stage.sub}</div>

        {step === 0 && <input ref={inputRef} className={`lm-input ${error ? 'err' : ''}`} type="text" placeholder="Jane Smith" autoComplete="name" value={values.full_name} onChange={event => setField('full_name', event.target.value)} onKeyDown={onKeyDown} />}
        {step === 1 && <input ref={inputRef} className={`lm-input ${error ? 'err' : ''}`} type="email" placeholder="jane@company.co.nz" autoComplete="email" inputMode="email" value={values.email} onChange={event => setField('email', event.target.value)} onKeyDown={onKeyDown} onBlur={handleBlur} />}
        {step === 2 && <input ref={inputRef} className={`lm-input ${error ? 'err' : ''}`} type="tel" placeholder="+64 21 000 0000" autoComplete="tel" inputMode="tel" value={values.phone} onChange={event => setField('phone', event.target.value)} onKeyDown={onKeyDown} onBlur={handleBlur} />}

        {step >= 3 && (
          <div className="lm-grid">
            {options.map(option => (
              <button key={option.value} type="button" className="lm-opt" onClick={() => pickOption(stage.key, option.value)}>
                <span className="lm-opt-v">{option.label}</span>
                {option.hint && <span className="lm-opt-h">{option.hint}</span>}
              </button>
            ))}
          </div>
        )}

        {error && <div className="lm-err">{error}</div>}

        {step <= 2 && (
          <div className="lm-row">
            {step > 0 && <button type="button" className="lm-back" onClick={back}>← Back</button>}
            <button type="button" className="lm-btn" onClick={advanceText}>Continue →</button>
          </div>
        )}
        {step >= 3 && <div className="lm-row"><button type="button" className="lm-back" onClick={back}>← Back</button></div>}
        {step <= 1 && <div className="lm-note">Your details stay private. Unsubscribe anytime.</div>}
      </div>

      {status === 'error' && <div className="lm-err">Something went wrong. Please try again.</div>}
      {status === 'loading' && <div className="lm-load"><div className="lm-spin" /><div>Building your Profit Roadmap…</div></div>}
      {warmCal && <iframe src={WARM_CAL_URL} title="" aria-hidden="true" tabIndex={-1} style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none', left: -9999, top: -9999, border: 0 }} />}
    </div>
  )
}
