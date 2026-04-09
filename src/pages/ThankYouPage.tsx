import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'

// GHL passes rev=high or rev=low

export default function ThankYouPage() {
  const { search, state } = useLocation() as { search: string; state: { name?: string; email?: string; rev?: string } | null }
  const params = new URLSearchParams(search)

  const rawName   = params.get('full_name') || params.get('name') || ''
  const firstName = params.get('first_name') || rawName.split(' ')[0] || 'there'
  const lastName  = params.get('last_name')  || rawName.split(' ').slice(1).join(' ')
  const name      = firstName + (lastName ? ' ' + lastName : '')
  const email     = params.get('email') || state?.email || ''
  const rev       = params.get('rev')   || state?.rev   || ''
  const isHigh    = rev === 'high'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
            <div className="priority-box">
              <h3 style={{fontSize:18,fontWeight:700,marginBottom:10}}>You've been added to the priority list.</h3>
              <p style={{fontSize:15,color:'var(--dim)',lineHeight:1.7}}>
                Bernard only takes a handful of calls each week. Expect to hear from us within <strong style={{color:'#fff'}}>under 24 hours</strong> to lock in a time.
              </p>
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
