import { useState, useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════
   POST-BOOKING VSL / THANK-YOU PAGE  (/booked)
   Shown after a confirmed booking on /thank-you.
   Ported from pba-confirmation-page + the first-12 video wall.
   Same design system as the LP (purple-blue #8b53ec → #23affe).
   ═══════════════════════════════════════════════════════ */

// Same first-12 testimonials as the LP (post-booking proof while they're warm).
const VIDEOS = [
  { id: '_pJmMLgn9LE', who: 'Business Owner · UK', rs: 'Broke through a $20M ceiling' },
  { id: 'xvsNBrj9ivU', who: 'Andy · NZ', rs: 'Grew fast, cut ad spend to zero' },
  { id: 'mt0UTryP6lk', who: 'Nathan · AU', rs: 'Stopped leaving money on the table' },
  { id: 'zwnLPmL2SDQ', who: 'Randolf · USA', rs: 'Tactics to grow & run his team' },
  { id: 'jguYImcbWyM', who: 'Nur · NZ', rs: 'Saw the real cost of inaction' },
  { id: 'teJexLx8i8A', who: 'James · AU', rs: 'Serious about growth, and it works' },
  { id: '1go1aT89mLc', who: 'Business Owner · DE', rs: 'Lean transformed the floor' },
  { id: 'u2ZU8BPgGKQ', who: 'Matthew · UK', rs: 'The accountability to execute' },
  { id: '9nEAuLyWeJQ', who: 'Vern · UK', rs: 'From operator to owner' },
  { id: 'COGbYSoGss4', who: 'Sebastien · NZ', rs: 'A simple structure & more clarity' },
  { id: 'XL29a8JTKq8', who: 'Trent · USA', rs: 'Got his numbers & systems sorted' },
  { id: '5nixseW-M1A', who: 'Shanon · NZ', rs: 'A ton of progress in months' },
]

// Bernard's pre-call VSL — self-hosted on the confirmation page's Vercel CDN
// (one canonical copy shared by every funnel). Autoplay muted + tap for sound.
const VSL_SRC = 'https://pba-confirmation-page.vercel.app/vsl.mp4'
const VSL_POSTER = 'https://pba-confirmation-page.vercel.app/vsl-poster.jpg'

function VSLPlayer() {
  const ref = useRef<HTMLVideoElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [muted, setMuted] = useState(true)
  const [pct, setPct] = useState(0)
  const [buffering, setBuffering] = useState(false)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true // set the muted PROPERTY before play() — JSX attr alone is unreliable in Chrome
    v.play().catch(() => {})
  }, [])
  const unmute = () => {
    const v = ref.current
    if (!v) return
    v.muted = false
    setMuted(false)
    if (v.paused) v.play().catch(() => {})
  }
  const toggle = () => {
    const v = ref.current
    if (!v) return
    if (v.muted) { unmute(); return }
    if (v.paused) v.play(); else v.pause()
  }
  const seekTo = (clientX: number) => {
    const v = ref.current, t = trackRef.current
    if (!v || !t || !v.duration) return
    const r = t.getBoundingClientRect()
    const frac = Math.min(Math.max((clientX - r.left) / r.width, 0), 1)
    v.currentTime = frac * v.duration
    setPct(frac * 100)
  }
  const onScrub = (e: { clientX: number; stopPropagation: () => void }) => {
    e.stopPropagation()
    seekTo(e.clientX)
    const move = (ev: PointerEvent) => seekTo(ev.clientX)
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }
  return (
    <>
      <video
        ref={ref}
        className="vsl-video"
        playsInline
        muted
        autoPlay
        preload="auto"
        poster={VSL_POSTER}
        onClick={toggle}
        onWaiting={() => setBuffering(true)}
        onStalled={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onTimeUpdate={(e) => { const v = e.currentTarget; if (v.duration) setPct((v.currentTime / v.duration) * 100) }}
      >
        <source src={VSL_SRC} type="video/mp4" />
      </video>
      {muted && (
        <div className="vsl-cue" data-soundcue onClick={unmute}>
          <div className="vsl-ring"><svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.06A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"/></svg></div>
          <div className="vsl-cue-lbl">Your video has started</div>
          <div className="vsl-cue-sub">▶ Tap for sound</div>
        </div>
      )}
      {buffering && <div className="vsl-spinner" aria-hidden="true"><span /></div>}
      <div className="vsl-track" ref={trackRef} onPointerDown={onScrub}>
        <div className="vsl-bar" style={{ width: pct + '%' }}><i className="vsl-knob" /></div>
      </div>
    </>
  )
}

function YT({ id, who, rs }: { id: string; who: string; rs: string }) {
  const [p, sP] = useState(false)
  return (
    <div className="vc">
      <div className="vw" onClick={() => sP(true)}>
        {p ? (
          <iframe src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`} title={who} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen />
        ) : (
          <>
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt={`${who} — ${rs}`} loading="lazy" />
            <div className="vp"><svg width="56" height="56" viewBox="0 0 60 60"><circle cx="30" cy="30" r="30" fill="url(#pg)" /><polygon points="24,18 24,42 44,30" fill="#fff" /><defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8b53ec" /><stop offset="100%" stopColor="#23affe" /></linearGradient></defs></svg></div>
          </>
        )}
      </div>
      <div className="vi"><span className="vs">{rs}</span><b>{who}</b></div>
    </div>
  )
}

export default function BookedPage() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const name = (params.get('name') || '').trim().split(/\s+/)[0] || 'there'
  const email = params.get('email') || ''

  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
:root{--p:#8b53ec;--b:#23affe;--g:linear-gradient(135deg,#8b53ec,#23affe);--bg:#0a0a14;--dim:rgba(255,255,255,.7);--mut:rgba(255,255,255,.45);--card:rgba(255,255,255,.04);--bdr:rgba(139,83,236,.15)}
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;overflow-x:hidden}
body{background:var(--bg);color:#fff;font-family:'Inter',sans-serif;font-size:16px;line-height:1.6}
.P{font-family:'DM Sans',sans-serif}
.G{background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.mx{max-width:1000px;margin:0 auto;padding:0 clamp(20px,5vw,48px)}
.bk-hero{text-align:center;padding:clamp(40px,8vw,80px) 0 24px}
.bk-pill{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#22c55e;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);border-radius:999px;padding:8px 18px;margin-bottom:20px}
.bk-h1{font-size:clamp(28px,4.4vw,48px);font-weight:800;line-height:1.1;letter-spacing:-.025em;margin-bottom:14px}
.bk-sub{font-size:clamp(16px,2vw,19px);color:var(--dim);max-width:620px;margin:0 auto}
.bk-email{font-size:13px;color:var(--mut);margin-top:12px}
.bk-email strong{color:rgba(255,255,255,.85)}
.vsl{max-width:780px;margin:32px auto 0}
.vsl-frame{position:relative;padding-bottom:56.25%;border-radius:18px;overflow:hidden;border:1px solid var(--bdr);background:var(--card)}
.vsl-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
.vsl-ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--mut);text-align:center;padding:20px}
.vsl-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#000;display:block;cursor:pointer}
.vsl-cue{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;cursor:pointer;z-index:2;background:radial-gradient(circle at 50% 42%,rgba(0,0,0,.14),rgba(0,0,0,.42))}
.vsl-ring{width:72px;height:72px;border-radius:50%;background:var(--g);display:flex;align-items:center;justify-content:center;box-shadow:0 12px 40px -8px rgba(35,175,254,.6);animation:vslpulse 2.2s ease-in-out infinite}
@keyframes vslpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}
.vsl-cue-lbl{font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.55)}
.vsl-cue-sub{font-size:11px;color:rgba(255,255,255,.72);letter-spacing:.06em;text-transform:uppercase;font-weight:700;margin-top:-4px}
.vsl-track{position:absolute;left:0;right:0;bottom:0;height:16px;display:flex;align-items:flex-end;cursor:pointer;z-index:4}
.vsl-track::before{content:'';position:absolute;left:0;right:0;bottom:0;height:4px;background:rgba(255,255,255,.2)}
.vsl-bar{position:relative;height:4px;background:var(--g);transition:height .12s ease;pointer-events:none}
.vsl-track:hover .vsl-bar{height:6px}
.vsl-knob{position:absolute;right:-6px;bottom:-4px;width:12px;height:12px;border-radius:50%;background:#fff;box-shadow:0 1px 5px rgba(0,0,0,.5);opacity:0;transition:opacity .15s ease}
.vsl-track:hover .vsl-knob{opacity:1}
.vsl-spinner{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:3}
.vsl-spinner span{width:54px;height:54px;border-radius:50%;border:4px solid rgba(255,255,255,.22);border-top-color:#fff;animation:vslspin .8s linear infinite}
@keyframes vslspin{to{transform:rotate(360deg)}}
.sec{padding:clamp(40px,7vw,72px) 0}
.h2{font-size:clamp(24px,3.4vw,38px);font-weight:700;line-height:1.1;letter-spacing:-.02em;text-align:center;margin-bottom:32px}
.expect{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:860px;margin:0 auto}
.ex-card{background:var(--card);border:1px solid var(--bdr);border-radius:16px;padding:24px}
.ex-card .n{width:32px;height:32px;border-radius:50%;background:var(--g);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;margin-bottom:12px}
.ex-card h3{font-size:16px;margin-bottom:6px}
.ex-card p{font-size:14px;color:var(--dim);line-height:1.6}
.prep{max-width:680px;margin:28px auto 0;background:var(--card);border:1px solid var(--bdr);border-radius:16px;padding:24px}
.prep h3{font-size:14px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:14px}
.prep li{list-style:none;display:flex;gap:10px;align-items:flex-start;margin-bottom:10px;font-size:15px;color:var(--dim)}
.prep li svg{flex-shrink:0;margin-top:3px}
.confirm-shots{display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:880px;margin:0 auto}
.cshot{background:var(--card);border:1px solid var(--bdr);border-radius:16px;overflow:hidden;display:flex;flex-direction:column}
.cshot img{width:100%;height:auto;display:block}
.cshot figcaption{padding:14px 16px;font-size:14px;color:var(--dim);line-height:1.5}
.cshot figcaption b{color:#fff}
@media(max-width:760px){.confirm-shots{grid-template-columns:1fr}}
.vg{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.vc{border-radius:14px;overflow:hidden;background:var(--card);border:1px solid var(--bdr)}
.vw{position:relative;padding-bottom:56.25%;cursor:pointer;overflow:hidden}
.vw img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.vw iframe{position:absolute;inset:0;width:100%;height:100%;border:none}
.vp{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.3)}
.vi{padding:12px 14px}.vi b{display:block;font-size:13px;color:var(--mut)}.vs{display:block;font-size:14px;font-weight:700;margin-bottom:2px;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.reminder{text-align:center;font-size:14px;color:var(--mut);padding:0 0 64px}
.bk-footer{padding:24px 0;text-align:center;font-size:12px;color:var(--mut);border-top:1px solid rgba(255,255,255,.05)}
@media(max-width:760px){.expect{grid-template-columns:1fr}.vg{grid-template-columns:1fr 1fr}}
@media(max-width:480px){.vg{grid-template-columns:1fr}}
      `}</style>

      <div className="mx bk-hero">
        <div className="bk-pill"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> You're booked</div>
        <h1 className="P bk-h1">You're booked, {name}. <span className="G">Here's how to make it "The Call" that transforms your business.</span></h1>
        <p className="bk-sub">Check your inbox for the calendar invite and reminders. Watch the short video below before we talk.</p>
        {email && <p className="bk-email">Confirmation sent to <strong>{email}</strong>.</p>}

        <div className="vsl">
          <div className="vsl-frame">
            <VSLPlayer />
          </div>
        </div>
      </div>

      <section className="sec" style={{ paddingTop: 'clamp(28px,4vw,44px)', paddingBottom: 0 }}>
        <div className="mx">
          <h2 className="P h2" style={{ marginBottom: 12 }}>First, add the invite to your calendar</h2>
          <p style={{ textAlign: 'center', color: 'var(--dim)', maxWidth: 600, margin: '0 auto 28px', fontSize: 15, lineHeight: 1.6 }}>Open the calendar invite in your inbox and add it so your time is locked in. It can come from an unknown sender, so check your spam too.</p>
          <div className="confirm-shots">
            <figure className="cshot">
              <img src="/images/email-addcal.png" alt="Gmail calendar invite, click Add to calendar" loading="lazy" />
              <figcaption>If you see this, click <b>"Add to calendar."</b></figcaption>
            </figure>
            <figure className="cshot">
              <img src="/images/email-iknowsender.png" alt="Unknown sender prompt, click I know the sender" loading="lazy" />
              <figcaption>If it says <b>"I know the sender,"</b> click that. It adds the invite too.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="mx">
          <h2 className="P h2">What to expect</h2>
          <div className="expect">
            {[
              { t: "It's a working session, not a pitch", d: "We dig into your business, not a sales script. No pressure to join anything." },
              { t: "We find your #1 profit leak", d: "The biggest thing draining your margin, and exactly what to do about it." },
              { t: "You leave with a plan", d: "A clear next step you can action, whether or not you ever work with us." },
            ].map((e, i) => (
              <div className="ex-card" key={i}><div className="n">{i + 1}</div><h3>{e.t}</h3><p>{e.d}</p></div>
            ))}
          </div>

          <div className="prep">
            <h3 className="G">Do this before our call</h3>
            <ul>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b53ec" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> Have your rough numbers handy: revenue, team size, biggest headache.</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b53ec" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> Block 30 quiet minutes somewhere you can talk freely.</li>
              <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b53ec" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg> Watch the short video above so you show up ready.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="mx">
          <h2 className="P h2">While you wait, hear from <span className="G">other owners</span></h2>
          <div className="vg">{VIDEOS.map((v, i) => <YT key={i} {...v} />)}</div>
        </div>
      </section>

      <p className="reminder">You'll get an email reminder before your call.</p>
      <footer className="bk-footer"><div className="mx">Premier Business Academy · Bernard Powell · © 2026</div></footer>
    </>
  )
}
