import { useState, useEffect, useRef, FormEvent } from 'react'

/* ═══════════════════════════════════════════════════════
   DIRECT BOOKING LP  - "Book a 30-Minute Call"
   1:1 with Bernard Powell | One outcome: find your #1 profit leak
   Branding: #8b53ec → #23affe purple-blue gradient
   Hormozi Value Equation: Dream Outcome × Likelihood / Time × Effort
   ═══════════════════════════════════════════════════════ */

const VIDEOS = [
  { id: 'hqCtdyMNOgY', name: 'Chris', stat: 'Systems Replaced Chaos', desc: 'Growth became predictable in a real New Zealand business.' },
  { id: 'mHGpgEVoUFY', name: 'Josh', stat: '+36 to 40% Revenue · Weekends Back', desc: 'Clear ownership meant Josh finally got his weekends back.' },
  { id: 'gAfNzSxSWP4', name: 'Tim', stat: '3 Months Done in 3 Weeks', desc: 'The 4 Pillars changed how Tim\'s business operates day to day.' },
  { id: 'BbcoNuMfjmw', name: 'Mitchell', stat: '9 to 11 Hrs/Week Saved', desc: 'Better structure removed daily firefighting and constant interruptions.' },
  { id: 'VfQdGgEyjdQ', name: 'Abe', stat: '100+ Improvements Without Him', desc: 'Execution replaced guesswork, and progress stopped stalling.' },
  { id: 'rrMx4Z-ekG0', name: 'Trent', stat: '+50 to 55% Revenue · 22 to 25 Hrs/Week Back', desc: 'The 4 Pillars gave Trent the structure he didn\'t realise the business was missing.' },
]

const REVIEWS = [
  { name: 'Adrian Day', initials: 'AD', color: '#4285F4', text: "Bernard is all go. Full of insights and immediate action. We've been blown away by just how quickly PBA implements and starts bringing positive change. Sometimes the simple things, with the right approach, can be the most effective!" },
  { name: 'T N', initials: 'TN', color: '#EA4335', text: "The go-to academy for practical and grounded business advice, whether you're looking to grow the business or solve challenges. As a bonus, one gets to network with like-minded, growth-oriented business owners." },
  { name: 'Chris McGinley', initials: 'CM', color: '#34A853', text: "The level of professionalism at Premier Business Academy is unmatched. Bernard truly cares about your success and is always available to provide feedback or advice. The community of like-minded business owners is invaluable." },
  { name: 'Matthew Gulley', initials: 'MG', color: '#FBBC05', text: "I signed up the VIP package with PBA - Loved the short form video content in the business library, great content - not long and boring; super compact, bitesize and valuable content! The main thing for me was the accountability." },
  { name: 'Patrick Whiteman', initials: 'PW', color: '#4285F4', text: "We have had great help from Bernard at PBA shifting mindset and getting stuff done that we would have in all reality just never happened. Thoroughly recommend a strategy session with Bernard." },
  { name: 'Joshua Prestidge', initials: 'JP', color: '#EA4335', text: "Joining Premier Business Academy was one of the best things we have done in years. With the structure and the way that Bernard and his team are able to teach and train is outrageous." },
  { name: 'Ankit Choudhary', initials: 'AC', color: '#34A853', text: "I've learned a lot from Bernard's videos on LinkedIn through Premier Business Academy. His strategies are practical and easy to follow, and by applying his advice I've been able to think more strategically." },
  { name: 'Bernard Kingon', initials: 'BK', color: '#FBBC05', text: "Premier Business Academy has been an excellent experience so far. Bernard Powell brings next-level energy  - motivational, straight-talking, and always pushing you to rise above mediocrity." },
  { name: 'Tim Pearson', initials: 'TP', color: '#4285F4', text: "Bernard came and done a high level Mindset session with our Rotary club and everyone was fired up and inspired, one of the best speakers we have had all year." },
  { name: 'Tim Farland', initials: 'TF', color: '#EA4335', text: "Bernard is the real deal business coach! Genuine, inspiring and full of energy and ideas. He's walked the walk in business, and already in a short time has helped shift my mindset." },
  { name: 'Grant Walton', initials: 'GW', color: '#34A853', text: "PBA has been great for me, Bernard has been very supportive and always has great advice and tips to share, love being part of the Business Gym." },
  { name: 'Kurt Woodman', initials: 'KW', color: '#4285F4', text: "Loving the new Life Planner from PBA. It arrived this morning on the courier, and it was extremely refreshing to start filling in my day like it should have been." },
  { name: 'Rachael Simmonds', initials: 'RS', color: '#EA4335', text: "Bernard has been an absolute wealth of knowledge! If you are starting out on your Lean journey I highly recommend reaching out to Bernard." },
  { name: 'Sam Heath', initials: 'SH', color: '#34A853', text: "Bernard brings great energy to the team and is a huge support in driving performance and accountability. Loving the program so far." },
  { name: 'Joey Mayfield', initials: 'JM', color: '#FBBC05', text: "Bernard writes in a positive and encouraging way. He brings clarity to what processes and disciplines will lead to sales success." },
  { name: 'Darius Ward', initials: 'DW', color: '#4285F4', text: "Massive credit to Bernard! The progress, the wins, and the family vibe here are next-level  - something new every day pushing you forward in business and life!" },
  { name: 'Shaun Philpott', initials: 'SP', color: '#EA4335', text: "Great Read Bernard!! Why Sales = Survival.. am only half way through and can see what a game changer this could be, not just for the business owner but for all departments." },
  { name: 'Hugo Azman', initials: 'HA', color: '#34A853', text: "I just read the book 'Sales = Survival' and I am impressed. Bernard shared everything he learned about sales in creating his company. The book is very lean, structured like a workbook." },
  { name: 'Ryland', initials: 'R', color: '#FBBC05', text: "Incredible book written by Bernard - Why Sales = Survival. I don't think I've come across another sales resource that offers so many practical tips and tricks." },
  { name: 'Vern Evershed', initials: 'VE', color: '#4285F4', text: "Just 10 minutes a day could change your life... absolutely fantastic short training sessions that have changed my attitude, productivity and health." },
  { name: 'Trent Koehn', initials: 'TK', color: '#EA4335', text: "Bernard and his team are the best! In just a few minutes I received the answers I had been searching for for months! Truly a world class team." },
  { name: 'Flynn Baker', initials: 'FB', color: '#4285F4', text: "ABSOLUTE GAME CHANGER! I've been at Premier Business Gym for just ONE WEEK and I'm HOOKED! This gym isn't just about getting fit  - it's about levelling up your entire life!" },
  { name: 'Trevor Gottlieb', initials: 'TG', color: '#EA4335', text: "Sydney Food & Packaging has just started our lean journey and needed some pointers and guidance. Bernard graciously hosted my leadership team. His enthusiasm and positive attitude is amazing." },
]

function useReveal(t=0.12){const r=useRef<HTMLDivElement>(null);const[v,s]=useState(false);useEffect(()=>{const e=r.current;if(!e)return;const o=new IntersectionObserver(([x])=>{if(x.isIntersecting){s(true);o.disconnect()}},{threshold:t});o.observe(e);return()=>o.disconnect()},[t]);return{ref:r,v}}

function YT({id,name,stat,desc}:{id:string;name:string;stat:string;desc?:string}){
  const[p,sP]=useState(false)
  return(<div className="vc" onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>
    <div className="vw" onClick={()=>sP(true)}>{p?<iframe src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`} title={name} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen/>:<><img src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`} alt={name} loading="lazy"/><div className="vp"><svg width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="30" fill="url(#pg2)"/><polygon points="24,18 24,42 44,30" fill="#fff"/><defs><linearGradient id="pg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8b53ec"/><stop offset="100%" stopColor="#23affe"/></linearGradient></defs></svg></div></>}</div>
    <div className="vi"><b>{name}</b><span className="vs">{stat}</span>{}</div>
  </div>)
}

export default function DirectBookingPage(){
  const[sticky,setSticky]=useState(false)
  const[faq,setFaq]=useState<number|null>(null)
  const s1=useReveal(),s2=useReveal(),s3=useReveal(),s4=useReveal(),s5=useReveal(),s6=useReveal(),s7=useReveal()

  useEffect(()=>{const h=()=>setSticky(scrollY>innerHeight*.8);addEventListener('scroll',h,{passive:true});return()=>removeEventListener('scroll',h)},[])
const go=()=>document.getElementById('book-form')?.scrollIntoView({behavior:'smooth'})

  return(<>
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400&display=swap');
:root{--p:#8b53ec;--b:#23affe;--g:linear-gradient(135deg,#8b53ec,#23affe);--bg:#0a0a14;--lt:#f8f7ff;--dim:rgba(255,255,255,.7);--mut:rgba(255,255,255,.45);--card:rgba(255,255,255,.04);--bdr:rgba(139,83,236,.15);--e:cubic-bezier(.16,1,.3,1)}
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;overflow-x:hidden}
body{background:var(--bg);color:#fff;font-family:'Inter',sans-serif;font-size:16px;line-height:1.6}
body::after{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E");pointer-events:none;z-index:9999;opacity:.028}
.mx{max-width:1120px;margin:0 auto;padding:0 clamp(20px,5vw,48px)}
.G{background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.P{font-family:'Playfair Display',serif}
.rv{opacity:0;transform:translateY(28px);transition:opacity .7s var(--e),transform .7s var(--e)}.rv.vi{opacity:1;transform:none}
.pill{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.85);background:rgba(139,83,236,.12);border:1px solid rgba(139,83,236,.3);border-radius:999px;padding:6px 18px}
.btn{display:inline-flex;align-items:center;gap:6px;background:var(--g);color:#fff;font-weight:600;padding:15px 32px;border-radius:999px;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(139,83,236,.35);transition:transform .15s,box-shadow .15s;text-decoration:none;font-size:16px}.btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(139,83,236,.5)}
.btn-lg{font-size:18px;padding:18px 40px}
.btn-ghost{background:transparent;border:1.5px solid rgba(255,255,255,.3);box-shadow:none;backdrop-filter:blur(8px)}.btn-ghost:hover{border-color:rgba(255,255,255,.6);transform:none;box-shadow:none}
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:14px 0;background:rgba(10,10,20,.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.06)}
.nav-in{display:flex;justify-content:space-between;align-items:center}.nav .btn{font-size:14px;padding:10px 22px}
.hero{min-height:100vh;display:flex;align-items:center;padding:120px 0 80px;position:relative;overflow:hidden}
.hero h1{font-size:clamp(36px,4.5vw,62px);font-weight:800;line-height:1.08;letter-spacing:-.02em;margin-bottom:24px;max-width:720px}
.hero-desc{font-size:clamp(16px,1.6vw,19px);color:var(--dim);max-width:600px;margin-bottom:32px;line-height:1.7}
.hero-ctas{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:48px}
.hero-g{display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,6vw,80px);align-items:center}
.hero-photo{position:relative;display:flex;justify-content:center}
.hero-photo img{width:100%;max-width:420px;border-radius:20px;object-fit:cover;object-position:center top;aspect-ratio:3/4;box-shadow:0 24px 80px rgba(0,0,0,.5)}
.hero-review{position:absolute;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(10,10,20,.85);backdrop-filter:blur(16px);border:1px solid rgba(139,83,236,.3);border-radius:14px;padding:12px 20px;display:flex;align-items:center;gap:10px;white-space:nowrap}
.hero-review-stars{color:#f59e0b;font-size:16px;letter-spacing:2px}
.hero-review-text{font-size:14px;font-weight:600;color:rgba(255,255,255,.9)}
.orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}
.orb1{width:500px;height:500px;background:radial-gradient(circle,rgba(139,83,236,.22),transparent 70%);top:-100px;right:-150px;animation:oF 12s ease-in-out infinite alternate}
.orb2{width:400px;height:400px;background:radial-gradient(circle,rgba(35,175,254,.18),transparent 70%);top:300px;left:-200px;animation:oF 15s ease-in-out infinite alternate-reverse}
@keyframes oF{0%{transform:translate(0) scale(1)}50%{transform:translate(20px,-15px) scale(1.08)}100%{transform:translate(-15px,20px) scale(.95)}}
.sec{padding:clamp(60px,10vw,120px) 0;overflow-x:hidden}.sec-lt{background:var(--lt);color:#111}
.h2{font-size:clamp(28px,4vw,48px);font-weight:700;line-height:1.1;letter-spacing:-.02em}.h2 em{font-style:normal}
.vg{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.vc{border-radius:16px;overflow:hidden;background:var(--card);border:1px solid var(--bdr);transition:transform .3s var(--e),box-shadow .3s}
.vw{position:relative;padding-bottom:56.25%;cursor:pointer;overflow:hidden}.vw img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .3s}.vw:hover img{transform:scale(1.03)}.vw iframe{position:absolute;inset:0;width:100%;height:100%;border:none}.vp{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.3)}.vi{padding:14px 16px}.vi b{display:block;font-size:15px;color:#fff}.vs{display:block;font-size:17px;font-weight:700;margin-top:2px;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.fc{max-width:560px;margin:0 auto;background:var(--card);border:1px solid rgba(139,83,236,.25);border-radius:24px;padding:clamp(28px,4vw,48px);position:relative;backdrop-filter:blur(20px);box-shadow:0 24px 80px rgba(0,0,0,.4)}.fc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:24px 24px 0 0}
.fi{width:100%;background:transparent;border:none;border-bottom:1.5px solid rgba(255,255,255,.15);padding:14px 0;font-size:15px;color:#fff;font-family:inherit;outline:none;margin-bottom:18px;transition:border-color .3s}.fi:focus{border-color:var(--p)}.fi::placeholder{color:var(--mut)}
.fs{width:100%;background:transparent;border:none;border-bottom:1.5px solid rgba(255,255,255,.15);padding:14px 0;font-size:15px;color:#fff;font-family:inherit;outline:none;margin-bottom:18px;cursor:pointer;appearance:none;-webkit-appearance:none}.fs option{background:var(--bg);color:#fff}
.fq{max-width:720px;margin:0 auto}.fq-i{border-bottom:1px solid rgba(0,0,0,.08);overflow:hidden}.fq-q{display:flex;justify-content:space-between;align-items:center;padding:18px 0;cursor:pointer;font-size:15px;font-weight:600;color:#111;background:none;border:none;width:100%;text-align:left}.fq-c{transition:transform .3s;font-size:18px;color:#9ca3af}.fq-a{max-height:0;overflow:hidden;transition:max-height .4s var(--e)}.fq-a-in{padding:0 0 18px;font-size:14px;color:#4b5563;line-height:1.7}
.sk{position:fixed;bottom:0;left:0;right:0;z-index:99;background:rgba(10,10,20,.95);backdrop-filter:blur(16px);border-top:1px solid rgba(255,255,255,.06);padding:12px 0;transform:translateY(100%);transition:transform .4s var(--e)}.sk.show{transform:translateY(0)}.sk-in{display:flex;justify-content:space-between;align-items:center}.sk .btn{font-size:14px;padding:10px 24px}
.pain-card{background:var(--card);border:1px solid rgba(139,83,236,.25);border-radius:16px;padding:clamp(24px,3vw,36px);position:relative}.pain-card::before{content:'';position:absolute;left:0;top:16px;bottom:16px;width:3px;background:var(--g);border-radius:2px}
.outcome-row{display:grid;grid-template-columns:80px 1fr;gap:20px;align-items:start;padding:24px 0;border-bottom:1px solid rgba(0,0,0,.06)}
.outcome-num{font-size:48px;font-weight:800;line-height:1}
.rev-track{display:flex;gap:20px;overflow:hidden;position:relative}
.rev-slide{display:flex;gap:20px;animation:revSlide 60s linear infinite}
.rev-slide:hover{animation-play-state:paused}
.rev-card{background:#fff;border-radius:16px;padding:24px;border:1px solid rgba(0,0,0,.06);min-width:320px;max-width:320px;flex-shrink:0}
.rev-top{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.rev-avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0}
.rev-name{font-weight:700;font-size:14px;color:#111}
.rev-stars{color:#f59e0b;font-size:13px;letter-spacing:1px}
.rev-text{font-size:14px;line-height:1.65;color:#374151}
.rev-g-logo{display:flex;align-items:center;gap:8px}
.rev-g-logo svg{flex-shrink:0}
.rev-rating{font-size:32px;font-weight:800;color:#111}
.rev-count{font-size:14px;color:#6b7280}
@keyframes revSlide{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.hero-trust{position:absolute;top:16px;right:-12px;display:flex;flex-direction:column;gap:8px;z-index:2}
.hero-chip{display:flex;align-items:center;gap:8px;background:rgba(10,10,20,.85);backdrop-filter:blur(16px);border:1px solid rgba(139,83,236,.25);border-radius:999px;padding:8px 16px;font-size:13px;font-weight:600;color:rgba(255,255,255,.9);white-space:nowrap}
.hero-chip-icon{display:flex;align-items:center;flex-shrink:0;opacity:.85}
.hero-badges{display:grid;grid-template-columns:repeat(3,auto);gap:8px;justify-content:start;margin-top:4px}
@media(max-width:900px){.hero-badges{grid-template-columns:repeat(2,1fr)}.hero-trust{display:none}}
@media(max-width:900px){.hero-g{grid-template-columns:1fr!important}.hero-photo{display:none!important}.vg{grid-template-columns:1fr}.vc{border-radius:16px}.vi{padding:16px 18px}.vi b{font-size:17px}.vs{font-size:19px;margin-top:4px}.pain-grid,.bg2,.proc-grid{grid-template-columns:1fr!important}.sec{overflow-x:hidden}}
@media(max-width:480px){.hero{padding:90px 0 40px}.sec{padding:clamp(36px,8vw,80px) 0}.hero-ctas{flex-direction:column;align-items:stretch;text-align:center}.sk-brand{display:none}.vg{gap:16px}.nav .btn{font-size:12px;padding:8px 14px}}
@media(prefers-reduced-motion:reduce){.rv{opacity:1!important;transform:none!important;transition:none!important}.orb{animation:none!important}}
`}</style>

    {/* NAV */}
    <nav className="nav"><div className="mx nav-in">
      <img src="/images/pba-logo-full.webp" alt="PBA" style={{height:30}} />
      <button className="btn" onClick={go}>Book a 30-Minute Call →</button>
    </div></nav>

    {/* HERO  - One clear outcome */}
    <section className="hero">
      <div className="orb orb1"/><div className="orb orb2"/>
      <div className="mx hero-g" style={{position:'relative',zIndex:1}}>
        <div>
          <div className="pill" style={{marginBottom:24}}>For NZ Manufacturers Doing $500K to $1.5M</div>
          <h1 className="P">In 30 minutes, I will find the <em className="G">#1 thing costing your factory money.</em></h1>
          <p className="hero-desc">One call. One problem identified. One clear fix. I built a 200-tonne/day factory with 62 staff  - I know where the money hides. Book 30 minutes and I will show you.</p>
          <div className="hero-ctas">
            <button className="btn btn-lg" onClick={go}>Book My 30-Minute Call →</button>
            <button className="btn btn-ghost" onClick={()=>document.getElementById('proof')?.scrollIntoView({behavior:'smooth'})}>See who has done this ↓</button>
          </div>
          <div className="hero-badges">
            {[
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,text:'55% Avg Revenue Lift'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,text:'22 Hrs/Week Saved'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,text:'500+ Owners'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,text:'$150M+ Generated'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,text:'Westpac Award'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,text:'NZ Only'},
            ].map((c,i)=>
              <div key={i} className="hero-chip"><span className="hero-chip-icon">{c.icon}</span>{c.text}</div>
            )}
          </div>
        </div>
        <div className="hero-photo">
          <img alt="Bernard Powell" src="/images/1750066266064.jpeg" />
          <div className="hero-trust">
            {[
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,text:'500+ Owners Helped'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,text:'$150M+ Revenue'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,text:'10+ Years in NZ'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,text:'Westpac Award Winner'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,text:'AME Global Rep'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,text:'NZ Only'},
            ].map((c,i)=>
              <div key={i} className="hero-chip"><span className="hero-chip-icon">{c.icon}</span>{c.text}</div>
            )}
          </div>
          <div className="hero-review">
            <span className="hero-review-stars">★★★★★</span>
            <span className="hero-review-text">5.0 from 122 Google Reviews</span>
          </div>
        </div>
      </div>
    </section>

    {/* PAIN  - Real problems, factory owner language */}
    <section className="sec" style={{background:'var(--bg)'}} ref={s1.ref}>
      <div className="mx">
        <div className={`rv ${s1.v?'vi':''}`} style={{marginBottom:48}}>
          <div className="pill" style={{marginBottom:16}}>This Is Your Life Right Now</div>
          <h2 className="P h2">You already know <em className="G">something is wrong.</em></h2>
          <p style={{fontSize:16,color:'var(--dim)',marginTop:16,maxWidth:640}}>Revenue is up. Hours are up. But your bank account does not show it. Here is what I hear from every factory owner who books this call:</p>
        </div>
        <div className={`pain-grid rv ${s1.v?'vi':''}`} style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,transitionDelay:'.1s'}}>
          {[
            {title:'You work 60+ hours and still cannot get ahead.',desc:'Every quote, every crisis, every quality check  - it all comes back to you. Your factory cannot run a single week without you on the floor.',stat:'330 NZ workers leave for Australia every week.'},
            {title:'Revenue keeps climbing. Profit does not.',desc:'Electricity doubled. Raw materials up 40%. Your prices have not changed in three years. You are turning over more than ever and keeping less.',stat:'37% more NZ manufacturers went bust last year.'},
            {title:'Cash is always tight  - even when busy.',desc:'$200K tied up in materials. $180K in unpaid invoices. Four months of the year you are cash-flow negative.',stat:'Average NZ manufacturer is cash-negative 4 months/year.'},
            {title:'You have no idea where the money actually goes.',desc:'No dashboard. No weekly P&L. No visibility. You find out you had a bad month after it is already over.',stat:'Most factory owners have not reviewed margins in 6+ months.'},
          ].map((p,i)=><div key={i} className="pain-card">
            <div style={{paddingLeft:16}}>
              <div style={{fontSize:17,fontWeight:700,marginBottom:10}}>{p.title}</div>
              <div style={{fontSize:14,color:'var(--dim)',lineHeight:1.65,marginBottom:14}}>{p.desc}</div>
              <div style={{fontSize:12,fontWeight:600,color:'rgba(139,83,236,.8)',letterSpacing:'.02em'}}>{p.stat}</div>
            </div>
          </div>)}
        </div>
        <div style={{textAlign:'center',marginTop:48}}>
          <p style={{fontSize:18,fontWeight:600,marginBottom:20}}>If any of that hit home  - that is exactly what the call is for.</p>
          <button className="btn btn-lg" onClick={go}>Book My 30-Minute Call →</button>
        </div>
      </div>
    </section>

    {/* THE ONE OUTCOME  - What you walk away with */}
    <section className="sec sec-lt" ref={s2.ref}>
      <div className="mx">
        <div className={`rv ${s2.v?'vi':''}`} style={{textAlign:'center',marginBottom:56}}>
          <div className="pill" style={{marginBottom:16,background:'rgba(139,83,236,.08)',color:'#8b53ec'}}>What Happens in 30 Minutes</div>
          <h2 className="P h2">You walk away knowing the <em className="G">one thing to fix first.</em></h2>
          <p style={{fontSize:17,color:'#4b5563',marginTop:16,maxWidth:560,margin:'16px auto 0'}}>Not a to-do list. Not a framework. One specific, high-leverage fix for the next 90 days  - based on your actual numbers.</p>
        </div>
        <div className={`rv ${s2.v?'vi':''}`} style={{maxWidth:680,margin:'0 auto',transitionDelay:'.1s'}}>
          {[
            {num:'01',title:'I look at your real numbers.',desc:'Revenue, margins, cash flow, staff costs. Not a generic audit  - your actual business, right now. Most factory owners have never had someone look at this with them.'},
            {num:'02',title:'I find the biggest leak.',desc:'There are 7 places a factory loses money. I have seen them all  - because I had them all in my own 200-tonne/day operation. I will tell you which one is costing you the most.'},
            {num:'03',title:'You leave with a clear next step.',desc:'One priority. Specific enough to act on Monday morning. Trent did this and added 55% revenue. Mitchell got 11 hours back per week. One call. One fix.'},
          ].map((s,i)=><div key={i} className="outcome-row">
            <div className="outcome-num P G">{s.num}</div>
            <div><div style={{fontSize:18,fontWeight:700,color:'#111',marginBottom:6}}>{s.title}</div><div style={{fontSize:15,color:'#4b5563',lineHeight:1.65}}>{s.desc}</div></div>
          </div>)}
        </div>
        <div style={{textAlign:'center',marginTop:48}}>
          <button className="btn btn-lg" onClick={go}>Book My 30-Minute Call →</button>
        </div>
      </div>
    </section>

    {/* PROOF  - Results from real owners */}
    <section className="sec" id="proof" style={{background:'var(--bg)'}} ref={s3.ref}>
      <div className="mx">
        <div className={`rv ${s3.v?'vi':''}`} style={{marginBottom:48}}>
          <div className="pill" style={{marginBottom:16}}>Proof</div>
          <h2 className="P h2">They booked the call. <em className="G">Here is what happened.</em></h2>
        </div>
        <div className={`vg rv ${s3.v?'vi':''}`} style={{transitionDelay:'.15s'}}>
          {VIDEOS.map((v,i)=><YT key={i} {...v}/>)}
        </div>
        <div style={{textAlign:'center',marginTop:48}}>
          <button className="btn btn-lg" onClick={go}>Book My 30-Minute Call →</button>
        </div>
      </div>
    </section>

    {/* GOOGLE REVIEWS  - Hardcoded slider */}
    <section className="sec sec-lt" ref={s4.ref}>
      <div className="mx">
        <div className={`rv ${s4.v?'vi':''}`} style={{marginBottom:40}}>
          <div style={{display:'flex',alignItems:'center',gap:20,flexWrap:'wrap',marginBottom:8}}>
            <div className="rev-g-logo">
              <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span style={{fontSize:14,fontWeight:600,color:'#5f6368'}}>Google Reviews</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span className="rev-rating">4.9</span>
              <span style={{color:'#f59e0b',fontSize:20}}>★★★★★</span>
              <span className="rev-count">(125)</span>
            </div>
          </div>
          <h2 className="P h2">What business owners say.</h2>
        </div>
        <div className={`rev-track rv ${s4.v?'vi':''}`} style={{transitionDelay:'.1s'}}>
          <div className="rev-slide">
            {[...REVIEWS,...REVIEWS].map((r,i)=><div key={i} className="rev-card">
              <div className="rev-top">
                <div className="rev-avatar" style={{background:r.color}}>{r.initials}</div>
                <div>
                  <div className="rev-name">{r.name}</div>
                  <div className="rev-stars">★★★★★</div>
                </div>
              </div>
              <div className="rev-text">{r.text}</div>
            </div>)}
          </div>
        </div>
        <div style={{textAlign:'center',marginTop:48}}>
          <button className="btn btn-lg" onClick={go}>Book My 30-Minute Call →</button>
        </div>
      </div>
    </section>

    {/* WHO IS BERNARD */}
    <section className="sec" style={{background:'var(--bg)'}} ref={s5.ref}>
      <div className="mx">
        <div className={`bg2 rv ${s5.v?'vi':''}`} style={{display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:'clamp(40px,6vw,80px)',alignItems:'center'}}>
          <div style={{position:'relative'}}>
            <div style={{width:'75%',aspectRatio:'3/4',borderRadius:24,overflow:'hidden',border:'2px solid rgba(139,83,236,.25)'}}>
              <img src="/images/warehouse-visit.jpeg" alt="Bernard at Premier Group" style={{width:'100%',height:'100%',objectFit:'cover'}} />
            </div>
            <div style={{position:'absolute',bottom:-16,right:0,width:'55%',aspectRatio:'4/3',borderRadius:16,overflow:'hidden',border:'4px solid var(--bg)',zIndex:2}}>
              <img src="/images/1765583997480.jpeg" alt="Bernard with team" style={{width:'100%',height:'100%',objectFit:'cover'}} />
            </div>
          </div>
          <div>
            <div className="G" style={{fontSize:11,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',marginBottom:16}}>Who You Are Talking To</div>
            <p className="P" style={{fontSize:24,fontWeight:700,marginBottom:20,lineHeight:1.3}}>I built a factory. 200 tonnes a day. 62 staff. I had every problem you have right now.</p>
            <p style={{fontSize:15,color:'var(--dim)',lineHeight:1.7,marginBottom:12}}>Won NZ Best Workplace  - in a factory, not an office. AME Global Lean recognition. 98% employee engagement.</p>
            <p style={{fontSize:15,color:'var(--dim)',lineHeight:1.7,marginBottom:24}}>I am not a franchise coach running someone else's playbook. I have stood on the factory floor at 6 AM dealing with the same problems you deal with. That is why this call works  - I have already solved what you are trying to solve.</p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              {['200 Tonnes/Day','62 Staff','Best Workplace #1','AME Lean','500+ Owners Helped'].map((c,i)=><span key={i} style={{fontSize:12,fontWeight:600,color:'var(--dim)',background:'var(--card)',border:'1px solid rgba(139,83,236,.25)',borderRadius:999,padding:'6px 14px'}}>{c}</span>)}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* HOW IT WORKS */}
    <section className="sec sec-lt" ref={s6.ref}>
      <div className="mx">
        <div className={`rv ${s6.v?'vi':''}`} style={{marginBottom:48,textAlign:'center'}}>
          <h2 className="P h2">It takes <em className="G">3 steps.</em></h2>
        </div>
        <div className={`proc-grid rv ${s6.v?'vi':''}`} style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24,transitionDelay:'.1s'}}>
          {[
            {n:'1',t:'Book a time.',d:'Pick a 30-minute slot. Mornings or afternoons. Tuesday through Thursday.'},
            {n:'2',t:'Show up with your numbers.',d:'Revenue, staff count, biggest headache. That is all I need. If you do not have exact figures, your best guess works.'},
            {n:'3',t:'Leave knowing what to fix.',d:'I tell you the #1 thing costing your factory money and exactly how to fix it. Yours to keep whether we work together or not.'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#fff',border:'1px solid rgba(0,0,0,.06)',borderRadius:16,padding:28,textAlign:'center'}}>
              <div className="P G" style={{fontSize:36,fontWeight:700,marginBottom:12}}>{s.n}</div>
              <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:8}}>{s.t}</div>
              <div style={{fontSize:14,color:'#4b5563',lineHeight:1.6}}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* FORM */}
    <section className="sec" id="book-form" style={{background:'var(--bg)'}} ref={s7.ref}>
      <div className="mx">
        <div className={`rv ${s7.v?'vi':''}`} style={{textAlign:'center',marginBottom:48}}>
          <h2 className="P h2">Book your <em className="G">30-minute call.</em></h2>
          <p style={{fontSize:16,color:'var(--dim)',marginTop:12}}>One call. One problem found. One fix you can use Monday.</p>
        </div>
        <div className={`fc rv ${s7.v?'vi':''}`} style={{maxWidth:520,transitionDelay:'.1s'}}>
          <form onSubmit={(e:FormEvent)=>{e.preventDefault();alert('Call booked! Check your email for confirmation.')}}>
            {/* GHL: POST to https://services.leadconnectorhq.com/hooks/WEBHOOK_ID */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 16px'}}>
              <input className="fi" type="text" placeholder="First name" required />
              <input className="fi" type="text" placeholder="Last name" required />
            </div>
            <input className="fi" type="email" placeholder="Email address" required />
            <input className="fi" type="tel" placeholder="Phone number" required />
            <select className="fs" required defaultValue=""><option value="" disabled>What type of manufacturing?</option><option>Food & Beverage</option><option>Metal Fabrication</option><option>Wood & Paper</option><option>Machinery & Equipment</option><option>Plastics & Rubber</option><option>Other Manufacturing</option></select>
            <select className="fs" required defaultValue=""><option value="" disabled>Annual revenue</option><option>Under $500K</option><option>$500K to $1M</option><option>$1M to $1.5M</option><option>$1.5M+</option></select>
            <button type="submit" className="btn btn-lg" style={{width:'100%',justifyContent:'center',marginTop:8}}>Book My 30-Minute Call →</button>
            <div style={{fontSize:11,color:'var(--mut)',marginTop:14,textAlign:'center'}}>1:1 with Bernard. No obligation. NZ Privacy Act 2020.</div>
          </form>
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="sec sec-lt">
      <div className="mx">
        <div style={{textAlign:'center',marginBottom:40}}>
          <h2 className="P h2">Questions.</h2>
        </div>
        <div className="fq">
          {[
            {q:'Is this a sales call?',a:'No. It is a diagnostic. I look at your numbers and tell you the one thing to fix. If there is a fit for deeper work, I will mention it  - but you walk away with value either way.'},
            {q:'What do I need to bring?',a:'Just your revenue, rough margins, and staff count. If you have your P&L, bring it. If not, your best guesses are fine. I have done 500+ of these  - I work with what you know.'},
            {q:'How is this different from a generic business coach?',a:'I built a 200-tonne/day factory. 62 staff. Won NZ Best Workplace. I am not running a franchise playbook designed for plumbers. I know manufacturing because I lived it.'},
            {q:'Why only 30 minutes?',a:'Because that is all I need. Factory problems are predictable  - there are 7 places you are losing money and I have seen them all. Thirty minutes is enough to find yours.'},
            {q:'What happens after the call?',a:'You get a clear next step you can act on immediately. I will follow up with a few resources. If you want to keep working together, we can talk about that. No pressure.'},
          ].map((f,i)=><div key={i} className={`fq-i ${faq===i?'open':''}`}>
            <button className="fq-q" onClick={()=>setFaq(faq===i?null:i)}>{f.q}<span className="fq-c" style={{transform:faq===i?'rotate(180deg)':'none'}}>▼</span></button>
            <div className="fq-a" style={{maxHeight:faq===i?200:0}}><div className="fq-a-in">{f.a}</div></div>
          </div>)}
        </div>
      </div>
    </section>

    {/* FINAL CTA */}
    <section className="sec" style={{background:'var(--bg)',textAlign:'center',position:'relative',overflow:'hidden'}}>
      <div className="orb" style={{width:400,height:400,background:'radial-gradient(circle,rgba(139,83,236,.15),transparent 70%)',top:-80,left:'40%',position:'absolute',filter:'blur(80px)'}}/>
      <div className="mx" style={{position:'relative',zIndex:1}}>
        <h2 className="P" style={{fontSize:'clamp(32px,5vw,64px)',fontWeight:700,marginBottom:16}}>Your factory is <em className="G">leaking money.</em></h2>
        <p style={{fontSize:20,color:'var(--dim)',marginBottom:12}}>I will tell you exactly where. 30 minutes.</p>
        <p style={{fontSize:15,color:'var(--mut)',marginBottom:32}}>500+ factory owners have done this call. Every one of them found something they did not know they were losing.</p>
        <button className="btn btn-lg" onClick={go}>Book My 30-Minute Call →</button>
      </div>
    </section>

    {/* FOOTER */}
    <footer style={{padding:'20px 0',textAlign:'center',fontSize:12,color:'var(--mut)',borderTop:'1px solid rgba(255,255,255,.04)'}}>
      <div className="mx">
        Bernard Powell · © 2026
      </div>
    </footer>

    {/* STICKY */}
    <div className={`sk ${sticky?'show':''}`}><div className="mx sk-in">
      <span className="sk-brand" style={{fontSize:14,fontWeight:600}}>Find your #1 profit leak</span>
      <button className="btn" onClick={go}>Book 30-Min Call →</button>
    </div></div>
  </>)
}
