import LeadMagnetForm from '../components/LeadMagnetForm'

function GuideMockup({ className = '' }: { className?: string }) {
  return (
    <div className={`guide-wrap ${className}`} role="img" aria-label="The Manufacturer’s Profit Roadmap free guide">
      <div className="guide">
        <div className="book">
          <div className="book-face">
            <div className="book-top"><span className="book-eyebrow">Free Guide</span><img className="book-logo-img" src="/images/pba-logo-full.png" alt="Premier Business Academy" /></div>
            <div className="book-mid">
              <div className="book-kicker">The Manufacturer’s</div>
              <div className="book-title">PROFIT<br />ROADMAP</div>
              <div className="book-rule" />
              <div className="book-sub">Find the profit leaks inside your factory and the first one to fix.</div>
            </div>
            <div className="book-foot"><span>Premier Business Academy</span><span className="book-foot-b">Bernard Powell</span></div>
            <div className="book-badge"><b>7</b><small>STEPS</small></div>
          </div>
        </div>
        <div className="guide-glow" />
      </div>
      <div className="book-pill book-pill-tr"><span className="bp-stars">★★★★★</span><span className="bp-text">141 reviews</span></div>
      <div className="book-pill book-pill-bl"><span className="bp-num">300+</span><span className="bp-text">factory owners</span></div>
    </div>
  )
}

export default function LeadMagnetPage({ headlineVariant = 'headline-30pct' }: { headlineVariant?: 'headline-30pct' | 'headline-10hrs' }) {
  const headline = headlineVariant === 'headline-10hrs'
    ? <>Add <em className="G">$50K+ more profit</em> while working 10 fewer hours every week.</>
    : <>Find the hidden leaks stopping your factory from making <em className="G">30% more profit.</em></>

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        :root{--p:#8b53ec;--b:#23affe;--g:linear-gradient(135deg,#8b53ec,#23affe);--bg:#0a0a14;--dim:rgba(255,255,255,.7);--mut:rgba(255,255,255,.45);--e:cubic-bezier(.16,1,.3,1)}
        *{margin:0;padding:0;box-sizing:border-box}
        html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;overflow-x:hidden}
        body{background:var(--bg);color:#fff;font-family:'Inter',sans-serif;font-size:16px;line-height:1.6;font-feature-settings:'ss01','cv11','cv02';font-variant-numeric:tabular-nums;text-rendering:optimizeLegibility}
        .mx{max-width:1120px;margin:0 auto;padding:0 clamp(20px,5vw,48px)}
        .G{background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .P{font-family:'DM Sans',sans-serif}
        .hero{min-height:100dvh;display:flex;align-items:center;padding:72px 0;position:relative;overflow:hidden}
        .hero-g{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(40px,6vw,80px);align-items:center}
        .hero-copy{min-width:0}
        .hero h1{font-size:clamp(36px,4.2vw,62px);font-weight:800;line-height:1.06;letter-spacing:-.025em;margin-bottom:20px;text-wrap:balance}
        .hero-desc{font-size:clamp(18px,2vw,22px);color:#fff;max-width:560px;line-height:1.6}
        .proof{display:flex;flex-wrap:wrap;align-items:center;gap:8px 10px;margin-top:24px}
        .proof span{display:inline-flex;align-items:center;font-size:12px;font-weight:500;color:var(--dim);white-space:nowrap}
        .proof span:not(:first-child)::before{content:'';flex:none;width:4px;height:4px;border-radius:50%;background:var(--p);opacity:.6;margin-right:10px}
        .hero-orb{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none}
        .hero-orb-1{width:520px;height:520px;background:radial-gradient(circle,rgba(139,83,236,.2),transparent 70%);top:-160px;right:-120px}
        .hero-orb-2{width:420px;height:420px;background:radial-gradient(circle,rgba(35,175,254,.14),transparent 70%);bottom:-140px;left:-140px}
        .eyebrow{display:inline-flex;align-items:center;gap:9px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.82);margin-bottom:20px}
        .eyebrow-dot{width:7px;height:7px;border-radius:50%;background:var(--g);box-shadow:0 0 0 4px rgba(139,83,236,.18)}
        .hero-side{display:flex;flex-direction:column;align-items:stretch;gap:34px;min-width:0}
        .hero-form-wrap{min-width:0}
        .guide-wrap{position:relative;display:flex;align-items:center;justify-content:center;width:fit-content;margin:0 auto}
        .guide-wrap-mobile{display:none}
        .guide{position:relative;perspective:1700px;display:flex;align-items:center;justify-content:center}
        .guide-glow{position:absolute;width:72%;height:72%;border-radius:50%;background:radial-gradient(circle,rgba(139,83,236,.4),transparent 70%);filter:blur(64px)}
        .book{position:relative;z-index:1;width:300px;height:402px;transform:rotateY(-24deg) rotateX(6deg);transform-style:preserve-3d;transition:transform .7s var(--e);filter:drop-shadow(0 40px 60px rgba(0,0,0,.6))}
        .guide-wrap:hover .book{transform:rotateY(-14deg) rotateX(3deg)}
        .book::before{content:'';position:absolute;left:0;top:0;width:26px;height:100%;background:linear-gradient(90deg,#0a0814,#15102a);transform:translateZ(-13px) translateX(-13px) rotateY(90deg);transform-origin:left;border-radius:2px}
        .book::after{content:'';position:absolute;right:-1px;top:7px;width:22px;height:calc(100% - 14px);background:repeating-linear-gradient(90deg,#e8e6f0,#e8e6f0 1px,#cfcce0 2px,#e8e6f0 3px);transform:translateZ(-11px) translateX(11px) rotateY(90deg);transform-origin:right;border-radius:2px}
        .book-face{position:absolute;inset:0;border-radius:3px 9px 9px 3px;background:linear-gradient(155deg,#1c1536 0%,#0d0a1c 62%,#0a0818 100%);border:1px solid rgba(139,83,236,.4);box-shadow:inset 0 0 0 1px rgba(255,255,255,.05),inset 0 1px 0 rgba(255,255,255,.09);overflow:hidden;display:flex;flex-direction:column;padding:26px 24px;color:#fff}
        .book-face::before{content:'';position:absolute;left:0;top:0;width:5px;height:100%;background:var(--g)}
        .book-face::after{content:'';position:absolute;top:-38%;right:-32%;width:82%;height:82%;border-radius:50%;background:radial-gradient(circle,rgba(35,175,254,.2),transparent 70%)}
        .book-top{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1}
        .book-eyebrow{font-size:9px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.6)}
        .book-logo-img{height:13px;width:auto;display:block;opacity:.92}
        .book-mid{margin:auto 0;position:relative;z-index:1}
        .book-kicker{font-family:'DM Sans',sans-serif;font-size:14px;font-weight:600;color:rgba(255,255,255,.72);margin-bottom:6px}
        .book-title{font-family:'DM Sans',sans-serif;font-size:39px;font-weight:800;line-height:.96;letter-spacing:-.02em;background:linear-gradient(135deg,#fff,#c9b6ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .book-rule{width:46px;height:4px;border-radius:2px;background:var(--g);margin:16px 0}
        .book-sub{font-size:12.5px;line-height:1.5;color:rgba(255,255,255,.62);max-width:205px}
        .book-foot{display:flex;flex-direction:column;gap:2px;font-size:10px;color:rgba(255,255,255,.5);position:relative;z-index:1}
        .book-foot-b{color:rgba(255,255,255,.8);font-weight:600}
        .book-badge{position:absolute;top:-14px;right:-14px;width:62px;height:62px;border-radius:50%;background:var(--g);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;box-shadow:0 8px 24px rgba(139,83,236,.55);z-index:3;border:3px solid var(--bg)}
        .book-badge b{font-size:23px;font-weight:800;line-height:1}
        .book-badge small{font-size:7px;font-weight:700;letter-spacing:.1em;margin-top:1px}
        .book-pill{position:absolute;z-index:4;display:flex;align-items:center;gap:8px;background:rgba(10,10,20,.9);backdrop-filter:blur(16px);border:1px solid rgba(139,83,236,.3);border-radius:16px;padding:12px 18px;box-shadow:0 14px 36px rgba(0,0,0,.45);white-space:nowrap;font-family:'DM Sans',sans-serif}
        .book-pill-tr{top:56px;right:-30px}
        .book-pill-bl{bottom:34px;left:-36px}
        .bp-stars{color:#f59e0b;font-size:15px;letter-spacing:1.5px}
        .bp-num{font-size:19px;font-weight:800;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .bp-text{font-size:14px;font-weight:600}
        @media(max-width:900px){.hero{min-height:auto;padding:44px 0 32px;align-items:flex-start}.hero-g{grid-template-columns:1fr;text-align:center}.hero h1{font-size:clamp(32px,8.4vw,46px);margin-bottom:0}.guide-wrap-desktop{display:none}.guide-wrap-mobile{display:flex;width:100%;height:330px;margin:12px auto 20px}.guide-wrap-mobile .guide{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.76)}.guide-wrap-mobile .book-pill{display:none}.hero-side{gap:0;margin-top:8px}.hero-desc{font-size:16px;margin:0 auto}.proof{justify-content:center}}
        @media(max-width:480px){.hero{padding:36px 0 28px}}
      `}</style>

      <main className="hero">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="mx hero-g" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" />Free Guide · For NZ Manufacturers</div>
            <h1 className="P">{headline}</h1>
            <GuideMockup className="guide-wrap-mobile" />
            <p className="hero-desc">Get <strong>The Manufacturer’s Profit Roadmap</strong> free. See where your factory is leaking money and the first fix that will recover it fastest.</p>
            <div className="proof">
              {['300+ factory owners', '141 ★ five-star reviews', 'NZ’s #1 Best Workplace'].map(item => <span key={item}>{item}</span>)}
            </div>
          </div>

          <div className="hero-side">
            <GuideMockup className="guide-wrap-desktop" />
            <div className="hero-form-wrap"><LeadMagnetForm variant={headlineVariant} /></div>
          </div>
        </div>
      </main>
    </>
  )
}
