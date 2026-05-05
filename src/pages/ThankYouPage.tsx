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

  const rawName   = params.get('full_name') || params.get('name') || ''
  const firstNameRaw = params.get('first_name') || rawName.split(' ')[0] || ''
  const firstName = firstNameRaw || 'there'
  const lastName  = params.get('last_name')  || rawName.split(' ').slice(1).join(' ')
  const name      = firstNameRaw ? firstNameRaw + (lastName ? ' ' + lastName : '') : 'there'
  const email     = params.get('email') || state?.email || ''
  const phone     = params.get('phone') || state?.phone || ''
  const rev       = params.get('rev')   || state?.rev   || ''
  const cid       = params.get('cid')   || ''
  const isHigh    = rev === 'high'

  // Split full_name into first_name / last_name on the page URL so form_embed.js can pre-fill the calendar.
  useEffect(() => {
    const fullName = params.get('full_name') || params.get('name')
    if (fullName && !params.get('first_name')) {
      const parts = fullName.trim().split(/\s+/)
      const next = new URLSearchParams(search)
      next.delete('full_name')
      next.delete('name')
      next.set('first_name', parts[0])
      if (parts.length > 1) next.set('last_name', parts.slice(1).join(' '))
      window.location.replace(`/thank-you?${next.toString()}`)
      return
    }
    window.scrollTo(0, 0)
  }, [])

  // form_embed.js attaches iFrameResize to matching iframes ONCE on DOMContentLoaded.
  // Because this iframe is mounted later by React Router after the script's initial
  // scan, it never gets resized — the iframe stays at its CSS height (1180px) even
  // when GHL's content view (e.g. the time-slot picker) is much shorter, leaving a
  // big block of white below the widget. Fix: manually invoke window.iFrameResize on
  // our iframe once it's in the DOM. iFrameResize then listens to GHL's postMessage
  // events and shrinks/grows the iframe to match content.
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  useEffect(() => {
    // calendar always renders now; keep the effect running regardless of rev
    const iframe = iframeRef.current
    if (!iframe) return
    let cancelled = false
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
      if (window.__pbaScheduleFired) return
      if (!e.origin || !/growthhub|msgsndr|leadconnector/i.test(e.origin)) return
      const raw = typeof e.data === 'string' ? e.data : JSON.stringify(e.data ?? '')
      if (/booking[-_ ]?confirmed|appointment[-_ ]?booked|event[-_ ]?scheduled|hsBookingConfirmed|hsAppointmentBooked|onCalendarBooked/i.test(raw)) {
        window.__pbaScheduleFired = true
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
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [cid])

  const calendarParams = new URLSearchParams()
  if (firstNameRaw) calendarParams.set('first_name', firstNameRaw)
  if (lastName) calendarParams.set('last_name', lastName)
  if (email) calendarParams.set('email', email)
  if (phone) calendarParams.set('phone', phone)
  const qs = calendarParams.toString()
  const calendarSrc = `https://link.growthhub.net.nz/widget/bookings/profit-roadmap-session${qs ? `?${qs}` : ''}`

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        :root{--p:#8b53ec;--b:#23affe;--g:linear-gradient(135deg,#8b53ec,#23affe);--bg:#0a0a14;--dim:rgba(255,255,255,.7);--mut:rgba(255,255,255,.45);--card:rgba(255,255,255,.04);--bdr:rgba(139,83,236,.15);--e:cubic-bezier(.16,1,.3,1)}
        *{margin:0;padding:0;box-sizing:border-box}html{-webkit-font-smoothing:antialiased}
        body{background:var(--bg);color:#fff;font-family:'Inter',sans-serif;font-size:16px;line-height:1.6;min-height:100vh}
        .mx{max-width:720px;margin:0 auto;padding:0 clamp(20px,5vw,48px)}
        .G{background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .P{font-family:'DM Sans',sans-serif}
        .orb{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none}
        .check{width:72px;height:72px;border-radius:50%;background:var(--g);display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 32px;box-shadow:0 8px 32px rgba(139,83,236,.4)}
        .pill{display:inline-block;background:rgba(139,83,236,.12);border:1px solid rgba(139,83,236,.3);border-radius:999px;padding:6px 20px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.85);margin-bottom:20px}
        .box{background:var(--card);border:1px solid rgba(139,83,236,.25);border-radius:20px;padding:clamp(24px,4vw,44px);position:relative;overflow:hidden}
        .box::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:20px 20px 0 0}
        .priority-box{background:rgba(139,83,236,.08);border:1px solid rgba(139,83,236,.2);border-radius:16px;padding:24px;text-align:center;margin-top:24px}
        .cal-card{background:#fff;border-radius:14px;margin-top:18px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.35)}
        .cal-frame{width:100%;border:0;display:block;background:#fff;height:1180px;transition:height .25s ease}
        .cal-cta{margin-top:28px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:clamp(20px,2.6vw,26px);line-height:1.25;letter-spacing:-.01em}
        .cal-sub{margin-top:6px;font-size:14px;color:var(--mut)}
        .ty-page{padding-top:clamp(60px,10vw,100px);padding-bottom:80px}
        .ty-check{display:flex}
        .ty-h1{font-size:clamp(32px,5vw,52px);margin-bottom:16px}
        .ty-email{font-size:17px;margin-bottom:8px}
        .ty-sub{font-size:15px;margin-bottom:48px}
        .ty-qualify-pill{display:inline-block}
        .ty-h2{font-size:clamp(22px,3vw,32px);margin:16px 0 12px}
        .ty-desc{font-size:15px;margin-bottom:6px}
        .ty-pressure{font-size:13px;margin-bottom:0}
        .ty-cta-h3{display:block}
        .ty-cta-sub{display:block}
        @media (max-width:640px){
          .ty-page{padding-top:24px;padding-bottom:48px}
          .ty-check{display:none}
          .ty-h1{font-size:24px;margin-bottom:8px}
          .ty-email{font-size:14px;margin-bottom:4px}
          .ty-sub{font-size:13px;margin-bottom:18px}
          .box{padding:18px!important}
          .ty-qualify-pill{display:none}
          .ty-h2{font-size:18px;line-height:1.25;margin:0 0 10px}
          .ty-desc{font-size:13px;line-height:1.5;margin-bottom:8px}
          .ty-pressure{display:none}
          .ty-cta-h3{display:none}
          .ty-cta-sub{display:none}
          .cal-card{margin-top:10px}
        }
      `}</style>

      <div className="orb" style={{width:500,height:500,background:'radial-gradient(circle,rgba(139,83,236,.18),transparent 70%)',top:-100,right:-150}} />
      <div className="orb" style={{width:400,height:400,background:'radial-gradient(circle,rgba(35,175,254,.14),transparent 70%)',bottom:-100,left:-100}} />

      <div className="mx ty-page" style={{position:'relative',zIndex:1,textAlign:'center'}}>

        <div className="check ty-check">✓</div>
        <div className="pill">Roadmap on its way</div>

        <h1 className="P G ty-h1" style={{fontWeight:800,lineHeight:1.1}}>
          You're in, {name}.
        </h1>

        {email && (
          <p className="ty-email" style={{color:'var(--dim)'}}>
            Your NZ Business Profit Roadmap is heading to <strong style={{color:'#fff'}}>{email}</strong>.
          </p>
        )}
        <p className="ty-sub" style={{color:'var(--mut)'}}>
          Check your inbox , it'll arrive within a few minutes.
        </p>

        <div className="box" style={{textAlign:'center'}}>
          <div className="pill ty-qualify-pill">You Qualify</div>
          <h2 className="P ty-h2" style={{fontWeight:700,lineHeight:1.2}}>
            You also qualify for a free <span className="G">Manufacturer's Strategy Session.</span>
          </h2>
          <p className="ty-desc" style={{color:'var(--dim)'}}>
            30 minutes with a senior PBA strategist. Normally <strong style={{color:'#fff'}}>$2,500</strong>. Free for qualified NZ business owners.
          </p>
          <p className="ty-pressure" style={{color:'var(--mut)'}}>No pressure. By the end you'll know what to fix — and whether we're the right team to help.</p>
          <h3 className="cal-cta ty-cta-h3">Choose a time and book your slot.</h3>
          <p className="cal-sub ty-cta-sub">Pick what works for you, we'll see you on the call.</p>
          <div className="cal-card">
            <iframe
              ref={iframeRef}
              src={calendarSrc}
              id="profit-roadmap-session"
              title="Book your Manufacturer's Strategy Session"
              className="cal-frame"
              scrolling="no"
            />
          </div>
        </div>

        <p style={{marginTop:40,fontSize:14,color:'var(--mut)'}}>
          Over the next two weeks we'll also send you practical tips that go deeper on your roadmap.
        </p>
        <div style={{marginTop:24,fontSize:13,color:'var(--mut)'}}>
          <Link to="/" style={{color:'var(--mut)',textDecoration:'underline'}}>← Back to home</Link>
        </div>
      </div>
    </>
  )
}
