import { useLocation, Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

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

  // The GHL booking widget reports its own content height via postMessage
  // (`set-iframe-height`) and via iframe-resizer (form_embed.js). We size the
  // iframe to exactly that height on every device instead of forcing a fixed
  // height and pixel-cropping the header off. A fixed-height crop is calibrated
  // to one browser's rendered widget height (e.g. DevTools desktop emulation)
  // and lands on the wrong slice on real phones, leaving a broken sliver +
  // white void. Auto-sizing to the widget's declared height can't do that.
  // See onMsg for the direct `set-iframe-height` application and the
  // iFrameResize effect below for the iframe-resizer handshake.

  // form_embed.js attaches iFrameResize to matching iframes ONCE on DOMContentLoaded.
  // Because this iframe is mounted later by React Router after the script's initial
  // scan, it never gets resized. We invoke window.iFrameResize manually here so
  // the iframe element auto-resizes to its widget content height. onResized
  // also mirrors the reported height onto the element as a belt-and-suspenders.
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    let cancelled = false
    const onResized = (info?: { height?: number }) => {
      if (cancelled) return
      if (info?.height && iframe) iframe.style.height = `${info.height}px`
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
      if (!e.origin || !/growthhub|msgsndr|leadconnector|link\.premierbusinessacademy/i.test(e.origin)) return
      const raw = typeof e.data === 'string' ? e.data : JSON.stringify(e.data ?? '')
      // Debug, leave on temporarily so we can confirm the actual event names GHL uses.
      // Remove or comment after verifying.
      if (typeof console !== 'undefined') console.log('[GHL msg]', raw.slice(0, 250))

      // Size the iframe to the widget's own declared content height as soon as
      // it signals `set-iframe-height` (grows and shrinks between form /
      // calendar / time-slot steps). This is the reliable cross-device source
      // of truth, replacing the old fixed-height pixel crop that only matched
      // one browser's rendered heights.
      if (/set[-_ ]?iframe[-_ ]?height|iframe[-_ ]?(loaded|ready)/i.test(raw)) {
        const m = raw.match(/"height"\s*:\s*(\d+)/i)
        const h = m ? parseInt(m[1], 10) : 0
        if (h >= 200 && iframeRef.current) iframeRef.current.style.height = `${h}px`
      }

      if (window.__pbaScheduleFired) return

      // Broad detection. GHL's booking widget appears to fire one of several event
      // shapes when an appointment is created, different account configs / widget
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
      const eid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      console.log('[GHL booking detected] firing Schedule + tagging contact', cid, 'eid', eid)
      try { window.fbq?.('track', 'Schedule', {}, { eventID: eid }) } catch {}
      try { window.clarity?.('event', 'call_booked') } catch {}
      const fbpCookie = document.cookie.match(/(?:^|;\s*)_fbp=([^;]*)/)?.[1] || ''
      const fbcCookie = document.cookie.match(/(?:^|;\s*)_fbc=([^;]*)/)?.[1] || ''
      const metaTest = new URLSearchParams(window.location.search).get('meta_test') || ''
      if (cid) {
        fetch('/api/calendar-booked', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactId: cid,
            meta_event_id: eid,
            meta_fbp: fbpCookie,
            meta_fbc: fbcCookie,
            meta_source_url: window.location.href,
            meta_test_event_code: metaTest,
            email,
            phone,
            full_name: composedName,
          }),
        }).catch(() => { /* swallow */ })
      }

      // Move to the post-booking VSL page (mirrors the tradie funnel; the shared
      // GHL calendar's own redirect stays untouched).
      const bp = new URLSearchParams()
      if (composedName) bp.set('name', composedName)
      if (email) bp.set('email', email)
      if (cid) bp.set('cid', cid)
      setTimeout(() => { window.location.href = `/booked?${bp.toString()}` }, 1600)
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
  const calendarSrc = `https://link.premierbusinessacademy.co.nz/widget/bookings/profit-roadmap-session${qs ? `?${qs}` : ''}`

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
        .cal-frame{width:100%;border:0;display:block;background:#fff;min-height:380px;transition:height .25s ease}
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
          <span className="G">Want us to help you fix it inside your factory?</span> Book a 45-minute call with one of our top <span className="G">PBA</span> advisors for completely free.
        </p>

        <div className="cal-card">
          <div className="cal-clip">
            <iframe
              ref={iframeRef}
              src={calendarSrc}
              id="profit-roadmap-session"
              title="Book your call"
              className="cal-frame"
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
