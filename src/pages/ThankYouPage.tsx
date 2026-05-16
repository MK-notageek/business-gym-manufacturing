import { useLocation, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

// GHL passes rev=high or rev=low

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    clarity?: (...args: unknown[]) => void
    __pbaScheduleFired?: boolean
  }
}

export default function ThankYouPage() {
  const { search, state } = useLocation() as { search: string; state: { name?: string; email?: string; phone?: string; rev?: string } | null }
  const params = new URLSearchParams(search)

  // Pull the user's name from any of the historical URL shapes:
  //   ?full_name=... | ?name=... | ?first_name=...&last_name=...
  // The widget only pre-fills its single "Full Name" field from `full_name`/`name`,
  // so we normalise to that on the iframe URL.
  const rawName      = (params.get('full_name') || params.get('name') || '').trim()
  const firstFromUrl = params.get('first_name') || ''
  const lastFromUrl  = params.get('last_name')  || ''
  const composedName = rawName || [firstFromUrl, lastFromUrl].filter(Boolean).join(' ').trim()
  const firstNameRaw = firstFromUrl || composedName.split(/\s+/)[0] || ''
  const firstName    = firstNameRaw || 'there'
  const lastName     = lastFromUrl  || composedName.split(/\s+/).slice(1).join(' ')
  const name         = composedName || 'there'
  const email        = params.get('email') || state?.email || ''
  const phone        = params.get('phone') || state?.phone || ''
  const rev          = params.get('rev')   || state?.rev   || ''
  const cid          = params.get('cid')   || ''
  const isHigh       = rev === 'high'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Step detection: GHL widget heights vary by step.
  //   step-1 (form):       ~838px — crop header, land on form
  //   step-2 (calendar):   >=1000px — crop deeper, land on month header
  //   step-3 (time slots): drops back to ~600-1000px AFTER step-2 was seen —
  //                        no crop, show entire iframe so all slots are visible
  // We track whether step-2 was ever reached to disambiguate step-1 vs step-3
  // (their iframe heights can overlap).
  const [stepClass, setStepClass] = useState<'step-1' | 'step-2' | 'step-3'>('step-1')
  const everSawStep2Ref = useRef(false)

  // A native ResizeObserver on the iframe element is more reliable than
  // iFrameResize's onResized callback (which depends on the widget's internal
  // postMessage protocol firing correctly). A 750ms poll is also installed as a
  // belt-and-suspenders fallback in case ResizeObserver doesn't fire on the
  // step-1 -> step-2 height transition.
  const iframeStepRef = useRef<HTMLIFrameElement | null>(null)
  useEffect(() => {
    const el = iframeStepRef.current
    if (!el) return
    const applyForHeight = (h: number, src: string) => {
      if (!h) return
      if (h >= 900) {
        everSawStep2Ref.current = true
        setStepClass('step-2')
      } else if (h >= 400) {
        setStepClass(everSawStep2Ref.current ? 'step-3' : 'step-1')
      }
      // Debug — remove after step detection is verified in the wild.
      if (typeof console !== 'undefined') console.log(`[step-detect ${src}]`, h, everSawStep2Ref.current ? '(post-2)' : '')
    }
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(entries => {
        for (const entry of entries) applyForHeight(entry.contentRect.height, 'ro')
      })
      ro.observe(el)
    }
    const id = setInterval(() => applyForHeight(el.offsetHeight, 'poll'), 750)
    return () => { if (ro) ro.disconnect(); clearInterval(id) }
  }, [])

  // form_embed.js attaches iFrameResize to matching iframes ONCE on DOMContentLoaded.
  // Because this iframe is mounted later by React Router after the script's initial
  // scan, it never gets resized. We invoke window.iFrameResize manually here so
  // the iframe element auto-resizes to its widget content height. onResized also
  // updates stepClass so the crop tracks the current step.
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    let cancelled = false
    const onResized = (info?: { height?: number }) => {
      if (cancelled) return
      if (info?.height) {
        if (info.height >= 1000) {
          everSawStep2Ref.current = true
          setStepClass('step-2')
        } else if (info.height >= 400) {
          setStepClass(everSawStep2Ref.current ? 'step-3' : 'step-1')
        }
      }
    }
    const tryInit = (attempt = 0) => {
      if (cancelled) return
      const fn = (window as unknown as { iFrameResize?: (opts: object, target: HTMLIFrameElement) => void }).iFrameResize
      if (typeof fn === 'function') {
        try {
          fn({
            log: false,
            checkOrigin: false,
            enablePublicMethods: true,
            scrolling: false,
            heightCalculationMethod: 'offset',
            autoResize: true,
            sizeWidth: false,
            sizeHeight: true,
            onResized,
          }, iframe)
        } catch { /* ignore */ }
        return
      }
      if (attempt < 50) setTimeout(() => tryInit(attempt + 1), 100)
    }
    tryInit()
    return () => { cancelled = true }
  }, [])

  // Fire Meta "Schedule" event when GHL calendar reports a confirmed booking.
  useEffect(() => {
    // calendar always renders now; keep the effect running regardless of rev
    function onMsg(e: MessageEvent) {
      if (!e.origin || !/growthhub|msgsndr|leadconnector/i.test(e.origin)) return
      const raw = typeof e.data === 'string' ? e.data : JSON.stringify(e.data ?? '')
      // Debug — leave on temporarily so we can confirm the actual event names GHL uses.
      // Remove or comment after verifying.
      if (typeof console !== 'undefined') console.log('[GHL msg]', raw.slice(0, 250))

      // Reveal the iframe as soon as the widget signals it has rendered — most
      // commonly via set-iframe-height. This is far faster than waiting for
      // iFrameResize's onResized debounce or the safety hard timer.
      // Also drive step detection from the reported height so the crop adjusts
      // when the user advances from form (step 1) to calendar (step 2).
      if (/set[-_ ]?iframe[-_ ]?height|iframe[-_ ]?(loaded|ready)/i.test(raw)) {
        const m = raw.match(/"height"\s*:\s*(\d+)/i)
        const h = m ? parseInt(m[1], 10) : 0
        if (h >= 900) {
          everSawStep2Ref.current = true
          setStepClass('step-2')
        } else if (h >= 400) {
          setStepClass(everSawStep2Ref.current ? 'step-3' : 'step-1')
        }
      }

      if (window.__pbaScheduleFired) return

      // Broad detection. GHL's booking widget appears to fire one of several event
      // shapes when an appointment is created — different account configs / widget
      // versions emit different keys, so we match any of the common signatures
      // *except* clearly non-booking lifecycle events like load / init / sticky-fill.
      const isInitNoise = /set-sticky-contacts|fetch-(query-params|sticky-contacts)|iframeLoaded|iframe-ready|set-iframe-height|scrollTo|inPageLink/i.test(raw)
      if (isInitNoise) return

      const isBookingEvent =
        /appointment[-_ ]?(created|booked|confirmed|scheduled|success)/i.test(raw) ||
        /booking[-_ ]?(created|confirmed|booked|success|complete)/i.test(raw) ||
        /event[-_ ]?scheduled/i.test(raw) ||
        /slot[-_ ]?(booked|confirmed)/i.test(raw) ||
        /(hsBookingConfirmed|hsAppointmentBooked|onCalendarBooked)/i.test(raw) ||
        /"status"\s*:\s*"(confirmed|booked|scheduled|success)"/i.test(raw) ||
        /"appointmentId"/i.test(raw)

      if (!isBookingEvent) return

      window.__pbaScheduleFired = true
      console.log('[GHL booking detected] firing Schedule + tagging contact', cid)
      try { window.fbq?.('track', 'Schedule') } catch {}
      try { window.clarity?.('event', 'call_booked') } catch {}
      if (cid) {
        fetch('/api/calendar-booked', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contactId: cid }),
        }).catch(() => { /* swallow */ })
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [cid])

  const calendarParams = new URLSearchParams()
  if (composedName) {
    calendarParams.set('full_name', composedName)
    calendarParams.set('name', composedName)
  }
  if (email) calendarParams.set('email', email)
  if (phone) calendarParams.set('phone', phone)
  const qs = calendarParams.toString()
  const calendarSrc = `https://link.growthhub.net.nz/widget/bookings/profit-roadmap-session${qs ? `?${qs}` : ''}`

  return (
    <>
      <style>{`
        :root{--p:#8b53ec;--b:#23affe;--g:linear-gradient(135deg,#8b53ec,#23affe);--bg:#0a0a14;--dim:rgba(255,255,255,.7);--mut:rgba(255,255,255,.45);--card:rgba(255,255,255,.04);--bdr:rgba(139,83,236,.15);--e:cubic-bezier(.16,1,.3,1)}
        *{margin:0;padding:0;box-sizing:border-box}html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
        body{background:var(--bg);color:#fff;font-family:'Inter',sans-serif;font-size:16px;line-height:1.6;min-height:100vh;font-feature-settings:'ss01','cv11','cv02';font-variant-numeric:tabular-nums;text-rendering:optimizeLegibility}
        .mx{max-width:720px;margin:0 auto;padding:0 clamp(20px,5vw,48px)}
        .G{background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .P{font-family:'DM Sans',sans-serif}
        .orb{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none}
        .cal-card{background:#fff;border-radius:14px;margin-top:16px;overflow:hidden;box-shadow:0 1px 2px rgba(0,0,0,.4),0 8px 32px rgba(0,0,0,.22);position:relative;min-height:380px}
        .cal-clip{overflow:hidden}
        /* Negative top margin crops the GHL widget's "Service Details" header
           on step 1 (event title + 45-min badge + description) and the longer
           header + "Any Available" dropdown on step 2 (calendar/date picker).
           Measured at the form title (step 1) and the "May 2026" month header
           (step 2). Step 2 crop is larger because the widget keeps the info
           pane visible above the calendar grid. */
        .cal-frame{width:100%;border:0;display:block;background:#fff;height:760px;transition:height .25s ease,margin-top .2s ease;margin-top:-310px}
        .cal-frame.step-2{margin-top:-420px}
        .cal-frame.step-3{margin-top:0}
        .ty-page{padding-top:clamp(20px,4vw,40px);padding-bottom:64px}
        .ty-email{font-size:13px;margin-bottom:14px;font-weight:500;letter-spacing:.01em}
        .ty-cta-line{font-size:clamp(22px,2.8vw,28px);font-weight:700;line-height:1.3;letter-spacing:-.015em;color:#fff;max-width:680px;margin:0 auto}
        .ty-footer{margin-top:18px;font-size:12px;color:var(--mut)}
        .ty-footer a{color:var(--mut);text-decoration:underline}
        @media (max-width:640px){
          .ty-page{padding-top:18px;padding-bottom:40px}
          .ty-email{font-size:12px;margin-bottom:10px}
          .ty-cta-line{font-size:19px;line-height:1.3;padding:0 2px}
          .cal-card{margin-top:12px}
          .cal-frame{margin-top:-335px}
          .cal-frame.step-2{margin-top:-490px}
          .cal-frame.step-3{margin-top:0}
        }
      `}</style>

      <div className="orb" style={{width:500,height:500,background:'radial-gradient(circle,rgba(139,83,236,.18),transparent 70%)',top:-100,right:-150}} />
      <div className="orb" style={{width:400,height:400,background:'radial-gradient(circle,rgba(35,175,254,.14),transparent 70%)',bottom:-100,left:-100}} />

      <div className="mx ty-page" style={{position:'relative',zIndex:1,textAlign:'center'}}>
        {email && (
          <p className="ty-email" style={{color:'var(--mut)'}}>
            Your roadmap is on its way to <strong style={{color:'rgba(255,255,255,.85)'}}>{email}</strong>.
          </p>
        )}
        <p className="P ty-cta-line">
          <span className="G">Want us to help you fix it inside your factory?</span> Book a 30-minute call with one of our top <span className="G">PBA</span> advisors for completely free.
        </p>

        <div className="cal-card">
          <div className="cal-clip">
            <iframe
              ref={(el) => { iframeRef.current = el; iframeStepRef.current = el }}
              src={calendarSrc}
              id="profit-roadmap-session"
              title="Book your call"
              className={`cal-frame ${stepClass}`}
              scrolling="no"
            />
          </div>
        </div>

        <div className="ty-footer">
          <Link to="/">← Back to home</Link>
        </div>
      </div>
    </>
  )
}
