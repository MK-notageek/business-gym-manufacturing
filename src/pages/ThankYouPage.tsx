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

const VIDEOS = [
  { id: 'hqCtdyMNOgY', name: 'Chris', stat: 'Systems Replaced Chaos' },
  { id: 'mHGpgEVoUFY', name: 'Josh', stat: '+36 to 40% Revenue · Weekends Back' },
  { id: 'gAfNzSxSWP4', name: 'Tim', stat: '3 Months Done in 3 Weeks' },
  { id: 'BbcoNuMfjmw', name: 'Mitchell', stat: '9 to 11 Hours Saved Every Week' },
  { id: 'VfQdGgEyjdQ', name: 'Abe', stat: '100+ Improvements Without Him' },
  { id: 'rrMx4Z-ekG0', name: 'Trent', stat: '+50 to 55% Revenue · 22 to 25 Hours Back' },
]

const REVIEWS = [
  { name: 'Adrian Day', initials: 'AD', color: '#4285F4', text: "Bernard is all go. Full of insights and immediate action. We've been blown away by just how quickly PBA implements and starts bringing positive change." },
  { name: 'Your Local Tyre Centre', initials: 'YL', color: '#EA4335', text: "I've been working with Bernard over the past few months. No fluff, no BS, just the things we need to hear. He has given us multiple strategies." },
  { name: 'Tim Farland', initials: 'TF', color: '#34A853', text: "Bernard is the real deal business coach. Genuine, inspiring and full of energy and ideas. I'm seeing a real upward trend in my sales results." },
  { name: 'Joshua Prestidge', initials: 'JP', color: '#FBBC05', text: "Joining Premier Business Academy was one of the best things we have done in years. We joined PBA as we wanted to improve the life our business gives us." },
  { name: 'Trent Koehn', initials: 'TK', color: '#4285F4', text: "Bernard and his team are the best. In just a few minutes I received the answers I had been searching for for months." },
  { name: "Matt O'Connor", initials: 'MO', color: '#EA4335', text: "High energy, motivational and best of all clear action that we can take to create more sales and get out of our comfort zone." },
]

function TestimonialVideo({ id, name, stat }: { id: string; name: string; stat: string }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="vc">
      <button className="vw" type="button" onClick={() => setPlaying(true)} aria-label={`Play ${name} testimonial`}>
        {playing
          ? <iframe src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`} title={`${name} testimonial`} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen />
          : <>
              <img src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`} alt={`${name} testimonial`} loading="lazy" />
              <span className="vp" aria-hidden="true">
                <svg width="56" height="56" viewBox="0 0 60 60"><circle cx="30" cy="30" r="30" fill="url(#testimonial-play)" /><polygon points="24,18 24,42 44,30" fill="#fff" /><defs><linearGradient id="testimonial-play" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8b53ec" /><stop offset="100%" stopColor="#23affe" /></linearGradient></defs></svg>
              </span>
            </>}
      </button>
      <div className="vi"><b>{name}</b><span className="vs">{stat}</span></div>
    </div>
  )
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
        .ty-proof{margin-top:44px}
        .ty-proof-h{font-size:clamp(18px,2.4vw,24px);font-weight:700;line-height:1.3;letter-spacing:-.015em;max-width:600px;margin:0 auto 20px}
        .vg{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
        .vc{border-radius:16px;overflow:hidden;background:var(--card);border:1px solid var(--bdr);transition:transform .25s var(--e)}
        .vc:hover{transform:translateY(-3px)}
        .vw{position:relative;width:100%;padding:0 0 56.25%;cursor:pointer;overflow:hidden;border:0;background:#111;display:block}
        .vw img,.vw iframe{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border:0}
        .vp{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.3)}
        .vi{padding:13px 15px;text-align:left}
        .vi b{display:block;font-size:13.5px}
        .vs{display:block;font-size:14.5px;font-weight:700;margin-top:2px;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .review-head{display:flex;align-items:center;justify-content:center;gap:9px;margin:40px 0 18px;flex-wrap:wrap}
        .review-stars{color:#f59e0b;font-size:15px;letter-spacing:2px}
        .review-meta{font-size:13px;color:var(--mut);font-weight:500}
        .review-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
        .review-card{background:#fff;border-radius:14px;padding:18px;text-align:left;box-shadow:0 8px 28px rgba(0,0,0,.22)}
        .review-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}
        .review-avatar{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex:none}
        .review-name{font-weight:700;font-size:13.5px;color:#111}
        .review-card p{font-size:13px;line-height:1.55;color:#374151}
        .ty-footer{margin-top:18px;font-size:12px;color:var(--mut)}
        .ty-footer a{color:var(--mut);text-decoration:underline}
        @media (min-width:900px){.ty-proof{width:min(1080px,calc(100vw - 48px));position:relative;left:50%;transform:translateX(-50%)}.vg{grid-template-columns:repeat(3,1fr)}.review-grid{grid-template-columns:repeat(3,1fr)}}
        @media (max-width:640px){
          .ty-page{padding-top:18px;padding-bottom:40px}
          .ty-email{font-size:12px;margin-bottom:10px}
          .ty-cta-line{font-size:19px;line-height:1.3;padding:0 2px}
          .cal-card{margin-top:12px}
          .vg,.review-grid{grid-template-columns:1fr}
        }
      `}</style>

      <div className="orb" style={{width:500,height:500,background:'radial-gradient(circle,rgba(139,83,236,.18),transparent 70%)',top:-100,right:-150}} />
      <div className="orb" style={{width:400,height:400,background:'radial-gradient(circle,rgba(35,175,254,.14),transparent 70%)',bottom:-100,left:-100}} />

      <div className="mx ty-page" style={{position:'relative',zIndex:1,textAlign:'center'}}>
        <p className="ty-email">
          We’ve emailed your Profit Roadmap{email ? <> to <strong style={{color:'rgba(255,255,255,.85)'}}>{email}</strong></> : ''}. It should arrive within 60 seconds.
        </p>
        <p className="P ty-cta-line">
          <span className="G">Book your free Growth Assessment Session.</span> In 45 minutes, one of our top <span className="G">PBA</span> advisors will identify the biggest constraint holding your factory back and the best next step.
        </p>

        <div className="cal-card">
          <div className="cal-clip">
            <iframe
              ref={iframeRef}
              src={calendarSrc}
              id="profit-roadmap-session"
              title="Book your free Growth Assessment Session"
              className="cal-frame"
              scrolling="no"
            />
          </div>
        </div>

        <section className="ty-proof" aria-labelledby="manufacturer-results">
          <h2 className="P ty-proof-h" id="manufacturer-results">See what business owners say about working with PBA.</h2>
          <div className="vg">
            {VIDEOS.map(video => <TestimonialVideo key={video.id} {...video} />)}
          </div>

          <div className="review-head">
            <span className="review-stars">★★★★★</span>
            <span className="review-meta"><strong style={{ color: '#fff' }}>5.0</strong> · 141+ Google reviews</span>
          </div>
          <div className="review-grid">
            {REVIEWS.map(review => (
              <article className="review-card" key={review.name}>
                <div className="review-top">
                  <div className="review-avatar" style={{ background: review.color }}>{review.initials}</div>
                  <div><div className="review-name">{review.name}</div><div className="review-stars" style={{ fontSize: 10 }}>★★★★★</div></div>
                </div>
                <p>{review.text}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="ty-footer">
          <Link to="/">← Back to home</Link>
        </div>
      </div>
    </>
  )
}
