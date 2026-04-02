import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'

// GHL passes rev=high or rev=low

export default function ThankYouPage() {
  const { search, state } = useLocation() as { search: string; state: { name?: string; email?: string; rev?: string } | null }
  const params = new URLSearchParams(search)

  // URL params (from GHL redirect) take priority, fall back to React router state
  const name  = params.get('name')  || state?.name  || 'there'
  const email = params.get('email') || state?.email || ''
  const rev   = params.get('rev')   || state?.rev   || ''
  const isHigh = rev === 'high'

  useEffect(() => {
    window.scrollTo(0, 0)
    if (isHigh) {
const onMessage = (e: MessageEvent) => {
        if (e.data && e.data.type === 'iFrameResize') {
          const iframe = document.getElementById('KD9dnIgB2U3E76hgS3MW_1775052923721') as HTMLIFrameElement | null
          if (iframe && e.data.height) iframe.style.height = e.data.height + 'px'
        }
      }
      window.addEventListener('message', onMessage)
      return () => { window.removeEventListener('message', onMessage) }
    }
  }, [isHigh])

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
        .steps{display:flex;flex-direction:column;gap:12px;margin:28px 0}
        .step{display:flex;gap:16px;align-items:flex-start;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:16px 20px}
        .step-n{width:28px;height:28px;border-radius:50%;background:var(--g);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px}
        .step-t{font-size:15px;font-weight:600;margin-bottom:2px}
        .step-d{font-size:13px;color:var(--dim)}
        .cal-embed{width:100%;height:750px;border:none;border-radius:16px;margin-top:28px;transition:height .3s ease}
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
          /* ── HIGH VALUE: show calendar ── */
          <div className="box" style={{textAlign:'left'}}>
            <div style={{textAlign:'center',marginBottom:8}}>
              <div className="pill">You Qualify</div>
            </div>
            <h2 className="P" style={{fontSize:'clamp(22px,3vw,32px)',fontWeight:700,marginBottom:12,textAlign:'center',lineHeight:1.2}}>
              You also qualify to speak with <span className="G">Bernard directly.</span>
            </h2>
            <p style={{fontSize:15,color:'var(--dim)',textAlign:'center',marginBottom:6,maxWidth:500,margin:'0 auto 6px'}}>
              30 minutes with Bernard. Normally <strong style={{color:'#fff'}}>$2,500</strong>. Free for qualified NZ business owners.
            </p>
            <p style={{fontSize:13,color:'var(--mut)',textAlign:'center',marginBottom:24}}>No obligation. No sales pitch. Just answers.</p>
            <div className="steps">
              <div className="step"><div className="step-n">1</div><div><div className="step-t">Pick a time below</div><div className="step-d">30 minutes is all it takes.</div></div></div>
              <div className="step"><div className="step-n">2</div><div><div className="step-t">You'll get a confirmation + WhatsApp reminder</div><div className="step-d">Reminders at 48h, 24h, 2h, and 15 minutes before.</div></div></div>
              <div className="step"><div className="step-n">3</div><div><div className="step-t">Show up, get answers</div><div className="step-d">You leave knowing exactly what to fix first.</div></div></div>
            </div>
            <iframe
              src="https://api.leadconnectorhq.com/widget/booking/KD9dnIgB2U3E76hgS3MW"
              style={{width:'100%',border:'none',overflow:'hidden'}}
              scrolling="no"
              id="KD9dnIgB2U3E76hgS3MW_1775052923721"
              className="cal-embed"
              title="Book your Straight Talk Session"
            />
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
