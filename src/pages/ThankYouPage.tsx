import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'

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

  const rawName     = params.get('full_name') || params.get('name') || ''
  const firstNameRaw = params.get('first_name') || rawName.split(' ')[0] || ''
  const firstName   = firstNameRaw || 'there'
  const lastName    = params.get('last_name')  || rawName.split(' ').slice(1).join(' ')
  const name        = firstNameRaw ? firstNameRaw + (lastName ? ' ' + lastName : '') : 'there'
  const email       = params.get('email') || state?.email || ''
  const phone       = params.get('phone') || state?.phone || ''
  const rev         = params.get('rev')   || state?.rev   || ''
  const cid         = params.get('cid')   || ''
  const isHigh      = rev === 'high'

  // Split full_name into first_name / last_name on the page URL so form_embed.js can pre-fill.
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

  // GHL calendar widget posts ['msgsndr-booking-complete', payload] as an Array
  // when a booking is confirmed. Fire Schedule pixel + Clarity event + tell our
  // backend to add the call-booked tag.
  useEffect(() => {
    if (!isHigh) return
    function onMsg(e: MessageEvent) {
      if (window.__pbaScheduleFired) return
      const d = e.data
      if (Array.isArray(d) && d[0] === 'msgsndr-booking-complete') {
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
  }, [isHigh, cid])

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
        .cal-frame{width:100%;border:0;display:block;background:#fff;min-height:1180px}
        .cal-cta{margin-top:28px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:clamp(20px,2.6vw,26px);line-height:1.25;letter-spacing:-.01em}
        .cal-sub{margin-top:6px;font-size:14px;color:var(--mut)}
        @media (max-width:720px){ .cal-frame{min-height:1450px} }
        @media (max-width:420px){ .cal-frame{min-height:1520px} }
      `}</style>

      <div className="orb" style={{width:500,height:500,background:'radial-gradient(circle,rgba(139,83,236,.18),transparent 70%)',top:-100,right:-150}} />
      <div className="orb" style={{width:400,height:400,background:'radial-gradient(circle,rgba(35,175,254,.14),transparent 70%)',bottom:-100,left:-100}} />

      <div className="mx" style={{paddingTop:'clamp(60px,10vw,100px)',paddingBottom:80,position:'relative',zIndex:1,textAlign:'center'}}>

        <div className="check">✓</div>
        <div className="pill">Roadmap on its way</div>

        <h1 className="P G" style={{fontSize:'clamp(32px,5vw,52px)',fontWeight:800,lineHeight:1.1,marginBottom:16}}>
          {isHigh ? `You're in, ${name}.` : `Check your inbox, ${name}.`}
        </h1>

        {email && (
          <p style={{fontSize:17,color:'var(--dim)',marginBottom:8}}>
            Your NZ Business Profit Roadmap is heading to <strong style={{color:'#fff'}}>{email}</strong>.
          </p>
        )}
        <p style={{fontSize:15,color:'var(--mut)',marginBottom:48}}>
          Check your inbox , it'll arrive within a few minutes.
        </p>

        {isHigh ? (
          /* ── HIGH VALUE: priority list ── */
          <div className="box" style={{textAlign:'center'}}>
            <div className="pill">You Qualify</div>
            <h2 className="P" style={{fontSize:'clamp(22px,3vw,32px)',fontWeight:700,margin:'16px 0 12px',lineHeight:1.2}}>
              You also qualify to speak with <span className="G">Bernard directly.</span>
            </h2>
            <p style={{fontSize:15,color:'var(--dim)',marginBottom:6}}>
              30 minutes with Bernard. Normally <strong style={{color:'#fff'}}>$2,500</strong>. Free for qualified NZ business owners.
            </p>
            <p style={{fontSize:13,color:'var(--mut)',marginBottom:0}}>No obligation. No sales pitch. Just answers.</p>
            <h3 className="cal-cta">Choose a time and book your slot.</h3>
            <p className="cal-sub">Pick what works for you, Bernard will see you on the call.</p>
            <div className="cal-card">
              <iframe
                src={calendarSrc}
                id="profit-roadmap-session"
                title="Book a strategy call with Bernard"
                className="cal-frame"
                scrolling="no"
              />
            </div>
          </div>
        ) : (
          /* ── NURTURE: personalised roadmap message ── */
          <div className="box">
            <h2 className="P" style={{fontSize:22,fontWeight:700,marginBottom:10}}>Your roadmap is personalised to your stage.</h2>
            <p style={{fontSize:15,color:'var(--dim)',lineHeight:1.7}}>
              Based on where your business is right now, we've put together a roadmap with the specific steps and priorities most relevant to you , not a generic checklist.<br/><br/>
              Open the email, work through it, and you'll know exactly what to focus on first.
            </p>
          </div>
        )}

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
