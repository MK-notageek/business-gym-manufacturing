import { useState, useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════
   LEAD MAGNET LP  - Lean, Outcome-Focused
   Premier Business Academy | Bernard Powell
   Branding: #8b53ec → #23affe purple-blue gradient
   ═══════════════════════════════════════════════════════ */

const VIDEOS = [
  { id: 'hqCtdyMNOgY', name: 'Chris', stat: 'Systems Replaced Chaos' },
  { id: 'mHGpgEVoUFY', name: 'Josh', stat: '+36 to 40% Revenue · Weekends Back' },
  { id: 'gAfNzSxSWP4', name: 'Tim', stat: '3 Months Done in 3 Weeks' },
  { id: 'BbcoNuMfjmw', name: 'Mitchell', stat: '9 to 11 Hrs/Week Saved' },
  { id: 'VfQdGgEyjdQ', name: 'Abe', stat: '100+ Improvements Without Him' },
  { id: 'rrMx4Z-ekG0', name: 'Trent', stat: '+50 to 55% Revenue · 22 to 25 Hrs/Week Back' },
]

const TRANSFORMS = [
  { old: '60-hour weeks. You ARE the factory.', new_: 'Home for dinner. Factory runs 2+ weeks without you.' },
  { old: 'Revenue up, profit flat.', new_: '$50K+ added annual profit.' },
  { old: '4 months cash-flow negative.', new_: 'Cash flow visible every Friday.' },
  { old: 'Best staff leaving for Australia.', new_: 'Team that stays because they want to.' },
]

const REVIEWS = [
  { name: 'Adrian Day', initials: 'AD', color: '#4285F4', text: "Bernard is all go. Full of insights and immediate action. We've been blown away by just how quickly PBA implements and starts bringing positive change. Sometimes the simple things, with the right approach, can be the most effective!" },
  { name: 'T N', initials: 'TN', color: '#EA4335', text: "The go-to academy for practical and grounded business advice, whether you're looking to grow the business or solve challenges. As a bonus, one gets to network with like-minded, growth-oriented business owners. Bernard has a magnetic personality and uplifting influence." },
  { name: 'Chris McGinley', initials: 'CM', color: '#34A853', text: "The level of professionalism at Premier Business Academy is unmatched. Bernard truly cares about your success and is always available to provide feedback or advice. Beyond the tools and learning resources available, the community of like-minded business owners is invaluable." },
  { name: 'Matthew Gulley', initials: 'MG', color: '#FBBC05', text: "I signed up the VIP package with PBA - Loved the short form video content in the business library, great content - not long and boring; super compact, bitesize and valuable content! The main thing for me was the accountability and building structure around my goals." },
  { name: 'Patrick Whiteman', initials: 'PW', color: '#4285F4', text: "We have had great help from Bernard at PBA shifting mindset and getting stuff done that we would have in all reality just never happened. Thoroughly recommend a strategy session with Bernard to help you see through the clutter, noise and focus on what matters." },
  { name: 'Joshua Prestidge', initials: 'JP', color: '#EA4335', text: "Joining Premier Business Academy was one of the best things we have done in years. With the structure and the way that Bernard and his team are able to teach and train is outrageous. We joined PBA as we wanted to improve the life our business gives us." },
  { name: 'Ankit Choudhary', initials: 'AC', color: '#34A853', text: "I've learned a lot from Bernard's videos on LinkedIn through Premier Business Academy in Hamilton, NZ. His strategies are practical and easy to follow, and by applying his advice I've been able to think more strategically and approach my business with a clearer mindset." },
  { name: 'Bernard Kingon', initials: 'BK', color: '#FBBC05', text: "Premier Business Academy has been an excellent experience so far. Bernard Powell brings next-level energy  - motivational, straight-talking, and always pushing you to rise above \"just okay.\" His message of refusing mediocrity really sticks." },
  { name: 'Tim Pearson', initials: 'TP', color: '#4285F4', text: "Bernard came and done a high level Mindset session with our Rotary club and everyone was fired up and inspired, one of the best speakers we have had all year, people in the club has taken action already from what was learnt in the session." },
  { name: 'Tim Farland', initials: 'TF', color: '#EA4335', text: "Bernard is the real deal business coach!. Genuine, inspiring and full of energy and ideas. He's walked the walk in business, and already in a short time has helped shift my mindset - I'm seeing a real upward trend in my sales results." },
  { name: 'Grant Walton', initials: 'GW', color: '#34A853', text: "PBA has been great for me, Bernard has been very supportive and always has great advice and tips to share, love being part of the Business Gym, the Golden Hour (GH) is great and makes me set aside at least one hour a day to join other like minded people doing Gold calling. Love it." },
  { name: 'Kurt Woodman', initials: 'KW', color: '#4285F4', text: "Loving the new Life Planner from PBA. It arrived this morning on the courier, and it was extremely refreshing to start filling in my day like it should have been. Annoyed about all the time I have lost already, but here's to a new me!" },
  { name: 'Rachael Simmonds', initials: 'RS', color: '#EA4335', text: "Bernard has been an absolute wealth of knowledge! If you are starting out on your Lean journey I highly recommend reaching out to Bernard. Lean is hard work that makes everything easy is one of my favourite sayings and having a great coach makes all the difference." },
  { name: 'Sam Heath', initials: 'SH', color: '#34A853', text: "Bernard brings great energy to the team and is a huge support in driving performance and accountability. Loving the program so far." },
  { name: 'Joey Mayfield', initials: 'JM', color: '#FBBC05', text: "Bernard writes in a positive and encouraging way. He brings clarity to what processes and disciplines will lead to sales success. I found the book enjoyable and easy to read." },
  { name: 'Darius Ward', initials: 'DW', color: '#4285F4', text: "Massive credit to Bernard! The progress, the wins, and the family vibe here are next-level  - something new every day pushing you forward in business and life, along with the business gym always something in there for a daily improvement!" },
  { name: 'Shaun Philpott', initials: 'SP', color: '#EA4335', text: "Great Read Bernard!! Why Sales = Survival.. am only half way through and can see what a game changer this could be, not just for the business owner but for all departments." },
  { name: 'Hugo Azman', initials: 'HA', color: '#34A853', text: "I just read the book 'Sales = Survival' and I am impressed. Bernard shared everything he learned about sales in creating his company in this book. The book is very lean, structured like a workbook, with short chapters explaining detail." },
  { name: 'Ryland', initials: 'R', color: '#FBBC05', text: "Incredible book written by Bernard - Why Sales = Survival. I don't think I've come across another sales resource that offers so many practical tips and tricks. What's more you can know these tips and tricks are based on real life experience." },
  { name: 'Vern Evershed', initials: 'VE', color: '#4285F4', text: "Just 10 minutes a day could change your life... absolutely fantastic short training sessions that have changed my attitude, productivity and health. Want to get pumped up for the day, just listen to one of the short sessions... results guaranteed." },
  { name: 'colchat', initials: 'C', color: '#EA4335', text: "Bernard is an excellent coach and guide who cuts through the fluff to get you onto the important stuff straight away. Attend the Premier Business gym and calls if you want the most valuable 20 minutes of your week to your business bottom line." },
  { name: 'Darci', initials: 'D', color: '#34A853', text: "Bernard's book \"Why Sales = Survival\" is the ultimate book for all things sales. Sales is the lifeblood of any successful organization. Bernard breaks the entire process down into its individual parts. The book is equal parts educational and practical." },
  { name: 'Julian Whitehouse', initials: 'JW', color: '#FBBC05', text: "An inspiring introduction to the Premier Business Academy in the first class session for our team this week - thanks Bernard. Real life experiences that everyone can relate to shared with frankness, of life and business downs, ups and lessons learned." },
  { name: 'Henrique Zaparoli Marques', initials: 'HZ', color: '#4285F4', text: "Reading Why Sales = Survival was a truly eye-opening experience. It's a fast, easy-to-digest book, yet packed with powerful insights that made me rethink how our entire team  - not just sales  - connects with our customers." },
  { name: 'Trent Koehn', initials: 'TK', color: '#EA4335', text: "Bernard and his team are the best! In just a few minutes I received the answers I had been searching for for months! Truly a world class team." },
  { name: 'Eric Imel', initials: 'EI', color: '#34A853', text: "When I first picked up \"Why Sales = Survival\" I was expecting a book about some new sales tactics... What I got was so much more." },
  { name: 'Adam Thomas', initials: 'AT', color: '#FBBC05', text: "Received a pre-release edition of \"Why Sales = Survival\". Currently on my second read-through. There is so much to take in. So many useful insights. Started reassessing my approach already." },
  { name: 'Flynn Baker', initials: 'FB', color: '#4285F4', text: "ABSOLUTE GAME CHANGER! I've been at Premier Business Gym for just ONE WEEK and I'm HOOKED! This gym isn't just about getting fit  - it's about levelling up your entire life! The energy is ELECTRIC, the community is AMAZING." },
  { name: 'Trevor Gottlieb', initials: 'TG', color: '#EA4335', text: "Sydney Food & Packaging has just started our lean journey and needed some pointers and guidance. Bernard graciously hosted my leadership team for a tour of his facility. Bernard's enthusiasm and positive attitude is amazing." },
  { name: 'Vanessa Crafts', initials: 'VC', color: '#34A853', text: "Shoutout to Bernard Powell from Premier Group and Business Academy for sending me this Life Planner to kick off 2025!" },
  { name: 'Luke Griffiths', initials: 'LG', color: '#FBBC05', text: "Just finished The 20-Minute Transformation webinar with Bernard  - some great advice and solid, straight-up content around how to slash hidden costs, shift your sales approach to unlock consistent profit and growth." },
  { name: 'EduSafe', initials: 'ES', color: '#4285F4', text: "I had the pleasure of reading Bernard's new book \"Why Sales = Survival\". If I had to summarise it in one word, it would be actionable. This book is a refreshing read, free of vague cliches  - it's grounded in true, result driven facts." },
  { name: 'Your Local Tyre Centre', initials: 'YL', color: '#EA4335', text: "I've been working with Bernard over the past few months. He has been a game changer for our business with his business coaching brain and mindset. No fluff, no BS, just the things we need to hear. He has given us multiple strategies." },
  { name: "Matt O'Connor", initials: 'MO', color: '#34A853', text: "Used Premier Business Academy to unlock sales opportunities through their training program. It was great - high energy, motivational and best of all clear action that we can take to create more sales and get out of our comfort zone!" },
]

function useReveal(t=0.12){const r=useRef<HTMLDivElement>(null);const[v,s]=useState(false);useEffect(()=>{const e=r.current;if(!e)return;const o=new IntersectionObserver(([x])=>{if(x.isIntersecting){s(true);o.disconnect()}},{threshold:t});o.observe(e);return()=>o.disconnect()},[t]);return{ref:r,v}}

function YT({id,name,stat}:{id:string;name:string;stat:string}){
  const[p,sP]=useState(false)
  return(<div className="vc" onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>
    <div className="vw" onClick={()=>sP(true)}>{p?<iframe src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`} title={name} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen/>:<><img src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`} alt={name} loading="lazy"/><div className="vp"><svg width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="30" fill="url(#pg)"/><polygon points="24,18 24,42 44,30" fill="#fff"/><defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8b53ec"/><stop offset="100%" stopColor="#23affe"/></linearGradient></defs></svg></div></>}</div>
    <div className="vi"><b>{name}</b><span className="vs">{stat}</span></div>
  </div>)
}

export default function LeadMagnetPage(){
  const[sticky,setSticky]=useState(false)
  const[faq,setFaq]=useState<number|null>(null)
  const s1=useReveal(),s2=useReveal(),s3=useReveal(),s4=useReveal(),s5=useReveal(),s6=useReveal(),s7=useReveal()

  useEffect(()=>{const h=()=>setSticky(scrollY>innerHeight*.8);addEventListener('scroll',h,{passive:true});return()=>removeEventListener('scroll',h)},[])
  useEffect(()=>{const s=document.createElement('script');s.src='https://link.msgsndr.com/js/form_embed.js';s.async=true;document.body.appendChild(s);return()=>{document.body.removeChild(s)}},[])
  const go=()=>document.getElementById('form')?.scrollIntoView({behavior:'smooth'})


  return(<>
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
:root{--p:#8b53ec;--b:#23affe;--g:linear-gradient(135deg,#8b53ec,#23affe);--bg:#0a0a14;--lt:#f8f7ff;--dim:rgba(255,255,255,.7);--mut:rgba(255,255,255,.45);--card:rgba(255,255,255,.04);--bdr:rgba(139,83,236,.15);--e:cubic-bezier(.16,1,.3,1)}
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;overflow-x:hidden}
body{background:var(--bg);color:#fff;font-family:'Inter',sans-serif;font-size:16px;line-height:1.6}
body::after{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E");pointer-events:none;z-index:9999;opacity:.028}
.mx{max-width:1120px;margin:0 auto;padding:0 clamp(20px,5vw,48px)}
.G{background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.P{font-family:'DM Sans',sans-serif}
.rv{opacity:0;transform:translateY(28px);transition:opacity .7s var(--e),transform .7s var(--e)}.rv.vi{opacity:1;transform:none}
.pill{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.85);background:rgba(139,83,236,.12);border:1px solid rgba(139,83,236,.3);border-radius:999px;padding:6px 18px}
.btn{display:inline-flex;align-items:center;gap:6px;background:var(--g);color:#fff;font-weight:600;padding:15px 32px;border-radius:999px;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(139,83,236,.35);transition:transform .15s,box-shadow .15s;text-decoration:none;font-size:16px}.btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(139,83,236,.5)}
.btn-lg{font-size:16px;padding:14px 30px}
.btn-ghost{background:transparent;border:1.5px solid rgba(255,255,255,.3);box-shadow:none;backdrop-filter:blur(8px)}.btn-ghost:hover{border-color:rgba(255,255,255,.6);transform:none;box-shadow:none}
/* Nav */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:14px 0;background:rgba(10,10,20,.92);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.06)}
.nav-in{display:flex;justify-content:space-between;align-items:center}
.nav .btn{font-size:14px;padding:10px 22px}
/* Hero */
.hero{min-height:100vh;display:flex;align-items:center;padding:120px 0 80px;position:relative;overflow:hidden}
.hero-g{display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,6vw,80px);align-items:center}
.hero h1{font-size:clamp(36px,4.2vw,62px);font-weight:800;line-height:1.08;letter-spacing:-.02em;margin-bottom:20px}
.hero-desc{font-size:clamp(18px,2vw,22px);color:#fff;max-width:560px;margin-bottom:32px;line-height:1.6}
.hero-ctas{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:40px}
.hero-stats{display:flex;gap:32px;flex-wrap:wrap}
.hero-sn{font-size:clamp(26px,3vw,38px);font-weight:700}
.hero-sl{font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}
/* Photo wrapper */
.hero-photo{position:relative;display:flex;justify-content:center}
.hero-frame{width:100%;max-width:420px;aspect-ratio:3/4;border-radius:24px;overflow:hidden;border:2px solid rgba(139,83,236,.3)}
.hero-frame img{width:100%;height:100%;object-fit:cover;object-position:center top}
/* Trust chips  - absolutely positioned, floating on right edge of image */
.hero-trust{position:absolute;right:-12px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:8px;z-index:2}
.hero-chip{display:flex;align-items:center;gap:6px;background:rgba(10,10,20,.82);backdrop-filter:blur(16px);border:1px solid rgba(139,83,236,.2);border-radius:999px;padding:7px 14px;font-size:11px;font-weight:600;white-space:nowrap;color:rgba(255,255,255,.9);box-shadow:0 4px 16px rgba(0,0,0,.3)}
.hero-chip-icon{font-size:13px;flex-shrink:0}
/* Reviews badge  - bottom-left overlapping image */
.hero-reviews{position:absolute;bottom:20px;left:-12px;z-index:3;background:rgba(10,10,20,.88);backdrop-filter:blur(16px);border:1px solid rgba(139,83,236,.25);border-radius:16px;padding:12px 18px;text-align:center;box-shadow:0 4px 16px rgba(0,0,0,.3)}
.hero-reviews-num{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-reviews-stars{color:#f59e0b;font-size:13px;letter-spacing:2px}
.hero-reviews-label{font-size:10px;color:var(--mut);margin-top:2px}
/* Mobile trust  - hidden on desktop, shown on mobile */
.hero-trust-mobile{display:none;flex-wrap:wrap;gap:8px;margin-top:24px;justify-content:center}
/* Orbs */
.orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}
.orb1{width:500px;height:500px;background:radial-gradient(circle,rgba(139,83,236,.22),transparent 70%);top:-100px;right:-150px;animation:oF 12s ease-in-out infinite alternate}
.orb2{width:400px;height:400px;background:radial-gradient(circle,rgba(35,175,254,.18),transparent 70%);top:300px;left:-200px;animation:oF 15s ease-in-out infinite alternate-reverse}
@keyframes oF{0%{transform:translate(0) scale(1)}50%{transform:translate(20px,-15px) scale(1.08)}100%{transform:translate(-15px,20px) scale(.95)}}
/* Rings */
.ring{position:absolute;border-radius:50%;border:1px solid rgba(139,83,236,.1);top:50%;left:50%;transform:translate(-50%,-50%);animation:rP 6s ease-in-out infinite}
@keyframes rP{0%,100%{opacity:1;transform:translate(-50%,-50%) scale(1)}50%{opacity:.3;transform:translate(-50%,-50%) scale(1.03)}}
/* Sections */
.sec{padding:clamp(60px,10vw,120px) 0}
.sec-lt{background:var(--lt);color:#111}
.h2{font-size:clamp(28px,4vw,48px);font-weight:700;line-height:1.1;letter-spacing:-.02em}
.h2 em{font-style:normal}
/* Videos */
.vg{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.vc{border-radius:16px;overflow:hidden;background:var(--card);border:1px solid var(--bdr);transition:transform .3s var(--e),box-shadow .3s}
.vw{position:relative;padding-bottom:56.25%;cursor:pointer;overflow:hidden}
.vw img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .3s}.vw:hover img{transform:scale(1.03)}
.vw iframe{position:absolute;inset:0;width:100%;height:100%;border:none}
.vp{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.3);transition:background .3s}.vw:hover .vp{background:rgba(0,0,0,.15)}
.vi{padding:14px 16px}.vi b{display:block;font-size:15px;color:#fff}.vs{display:block;font-size:17px;font-weight:700;margin-top:2px;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
/* Transform */
.tg{display:flex;flex-direction:column;gap:16px}
.tr{display:grid;grid-template-columns:1fr 48px 1fr;align-items:stretch}
.to{background:#fff5f5;border:1px solid #fecaca;border-radius:14px 0 0 14px;padding:20px}.to-l{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#dc2626;margin-bottom:6px}.to-t{font-size:14px;line-height:1.5;color:#991b1b}
.tv{display:flex;align-items:center;justify-content:center;background:#f3f0ff}.tv-b{width:32px;height:32px;border-radius:50%;background:var(--g);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700}
.tn{background:#f3f0ff;border:1px solid rgba(139,83,236,.2);border-radius:0 14px 14px 0;padding:20px}.tn-l{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--p);margin-bottom:6px}.tn-t{font-size:14px;line-height:1.5;color:#4c1d95;font-weight:600}
/* Form */
.fc{max-width:520px;margin:0 auto;background:var(--card);border:1px solid rgba(139,83,236,.25);border-radius:24px;padding:clamp(28px,4vw,48px);position:relative;backdrop-filter:blur(20px);box-shadow:0 24px 80px rgba(0,0,0,.4)}
.fc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g);border-radius:24px 24px 0 0}
.fi{width:100%;background:transparent;border:none;border-bottom:1.5px solid rgba(255,255,255,.15);padding:14px 0;font-size:15px;color:#fff;font-family:inherit;outline:none;margin-bottom:18px;transition:border-color .3s}.fi:focus{border-color:var(--p)}.fi::placeholder{color:var(--mut)}
.fs{width:100%;background:transparent;border:none;border-bottom:1.5px solid rgba(255,255,255,.15);padding:14px 0;font-size:15px;color:#fff;font-family:inherit;outline:none;margin-bottom:18px;cursor:pointer;appearance:none;-webkit-appearance:none}
.fs option{background:var(--bg);color:#fff}
/* FAQ */
.fq{max-width:720px;margin:0 auto}
.fq-i{border-bottom:1px solid rgba(0,0,0,.08);overflow:hidden}
.fq-q{display:flex;justify-content:space-between;align-items:center;padding:18px 0;cursor:pointer;font-size:15px;font-weight:600;color:#111;background:none;border:none;width:100%;text-align:left}
.fq-c{transition:transform .3s;font-size:18px;color:#9ca3af}
.fq-a{max-height:0;overflow:hidden;transition:max-height .4s var(--e)}
.fq-a-in{padding:0 0 18px;font-size:14px;color:#4b5563;line-height:1.7}
/* Reviews slider */
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
/* Marquee */
.mq{overflow:hidden;white-space:nowrap;padding:24px 0}
.mq-c{display:inline-flex;animation:mqa 30s linear infinite}
.mq:hover .mq-c{animation-play-state:paused}
.mq-i{padding:0 2rem;font-size:clamp(20px,2.5vw,30px);font-weight:800;opacity:1;display:inline-flex;align-items:center;gap:10px}
@keyframes mqa{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
/* Sticky */
.sk{position:fixed;bottom:0;left:0;right:0;z-index:99;background:rgba(10,10,20,.95);backdrop-filter:blur(16px);border-top:1px solid rgba(255,255,255,.06);padding:12px 0;transform:translateY(100%);transition:transform .4s var(--e)}
.sk.show{transform:translateY(0)}
.sk-in{display:flex;justify-content:space-between;align-items:center}
.sk .btn{font-size:14px;padding:10px 24px}
/* Responsive */
@media(max-width:900px){.hero-g{grid-template-columns:1fr!important;text-align:center}.hero-photo{display:none!important}.hero-trust-mobile{display:flex}.hero-ctas{justify-content:center}.hero-stats{justify-content:center}.hero-desc{margin:0 auto 32px}.bg2{grid-template-columns:1fr!important}.vg{grid-template-columns:1fr}.vc{border-radius:16px}.vw{padding-bottom:56.25%}.vi{padding:16px 18px}.vi b{font-size:17px}.vs{font-size:19px;margin-top:4px}.tr{grid-template-columns:1fr}.to{border-radius:14px 14px 0 0}.tv{padding:6px 0}.tn{border-radius:0 0 14px 14px}.sec{overflow-x:hidden}}
@media(max-width:480px){.hero{padding:90px 0 40px}.sec{padding:clamp(36px,8vw,80px) 0}.hero-ctas{flex-direction:column;align-items:center}.hero-stats{gap:16px}.sk-brand{display:none}.vg{gap:16px}.vi{padding:14px 16px}}
@media(prefers-reduced-motion:reduce){.rv{opacity:1!important;transform:none!important;transition:none!important}.orb,.ring{animation:none!important}.mq-c{animation:none!important}}
`}</style>

    {/* NAV */}
    <nav className="nav"><div className="mx nav-in">
      <img src="/images/pba-logo-full.webp" alt="Premier Business Academy" style={{height:30}} />
      <button className="btn" onClick={go}>Get Free Roadmap →</button>
    </div></nav>

    {/* HERO */}
    <section className="hero">
      <div className="orb orb1"/><div className="orb orb2"/>
      <div className="mx hero-g" style={{position:'relative',zIndex:1}}>
        <div>
          <div className="pill" style={{marginBottom:24}}>For Kiwi Manufacturers</div>
          <h1 className="P">Get your free roadmap to add <em className="G">$50K+ more profit</em> without working more</h1>
          <p className="hero-desc">See exactly where your factory is leaking money and the one fix that recovers it fastest. Free. Takes 30 seconds.</p>
          <div className="hero-ctas">
            <button className="btn btn-lg" onClick={go}>Get My Free Profit Roadmap →</button>
            <button className="btn btn-ghost" onClick={()=>document.getElementById('proof')?.scrollIntoView({behavior:'smooth'})}>Watch results ↓</button>
          </div>
          <div className="hero-stats">
            {[{n:'500+',l:'Owners Helped'},{n:'55%',l:'Revenue Increase'},{n:'#1',l:'NZ Best Workplace'}].map((s,i)=><div key={i}><div className="P G hero-sn">{s.n}</div><div className="hero-sl">{s.l}</div></div>)}
          </div>
          {/* Mobile-only trust chips (no image) */}
          <div className="hero-trust-mobile">
            {[
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,text:'$150M+ Revenue'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,text:'125 Five-Star Reviews'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,text:'NZ Only'},
            ].map((c,i)=>
              <div key={i} className="hero-chip"><span className="hero-chip-icon">{c.icon}</span>{c.text}</div>
            )}
          </div>
        </div>
        {/* Desktop-only: image with overlays */}
        <div className="hero-photo">
          <div className="hero-frame"><img src="/images/1750066266064.jpeg" alt="Bernard Powell" /></div>
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
          <div className="hero-reviews">
            <div className="hero-reviews-num">125</div>
            <div className="hero-reviews-stars">★★★★★</div>
            <div className="hero-reviews-label">Google Reviews</div>
          </div>
        </div>
      </div>
    </section>

    {/* RESULTS  - Show outcomes immediately */}
    <section className="sec" id="proof" style={{background:'var(--bg)'}} ref={s1.ref}>
      <div className="mx">
        <div className={`rv ${s1.v?'vi':''}`} style={{marginBottom:48}}>
          <h2 className="P h2" style={{textAlign:'center'}}>Listen to what these <em style={{fontStyle:'normal',background:'var(--g)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>NZ business owners</em> have to say about working with Bernard.</h2>
        </div>
        <div className={`vg rv ${s1.v?'vi':''}`} style={{transitionDelay:'.15s'}}>
          {VIDEOS.map((v,i)=><YT key={i} {...v}/>)}
        </div>
        <p style={{textAlign:'center',marginTop:24,fontSize:20,fontWeight:700,background:'var(--g)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',letterSpacing:'.02em'}}>500+ more success stories like these.</p>
        <div style={{textAlign:'center',marginTop:48}}>
          <button className="btn btn-lg" onClick={go}>Get My Free Profit Roadmap →</button>
        </div>
      </div>
    </section>

    {/* TRANSFORMATION  - Quick visual of before/after */}
    <section className="sec sec-lt" ref={s2.ref}>
      <div className="mx">
        <div className={`rv ${s2.v?'vi':''}`} style={{marginBottom:48}}>
          <h2 className="P h2">What changes in <em className="G">90 days.</em></h2>
        </div>
        <div className={`tg rv ${s2.v?'vi':''}`} style={{transitionDelay:'.1s'}}>
          {TRANSFORMS.map((t,i)=><div key={i} className="tr">
            <div className="to"><div className="to-l">Now</div><div className="to-t">{t.old}</div></div>
            <div className="tv"><div className="tv-b">→</div></div>
            <div className="tn"><div className="tn-l">After</div><div className="tn-t">{t.new_}</div></div>
          </div>)}
        </div>
        <div style={{textAlign:'center',marginTop:48}}>
          <button className="btn btn-lg" onClick={go}>Get My Free Profit Roadmap →</button>
        </div>
      </div>
    </section>

    {/* GOOGLE REVIEWS  - Hardcoded */}
    <section className="sec sec-lt" ref={s3.ref}>
      <div className="mx">
        <div className={`rv ${s3.v?'vi':''}`} style={{marginBottom:40}}>
          <div style={{display:'flex',alignItems:'center',gap:20,flexWrap:'wrap',marginBottom:8}}>
            <div className="rev-g-logo">
              <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span style={{fontSize:14,fontWeight:600,color:'#5f6368'}}>Google Reviews</span>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span className="rev-rating">5.0</span>
              <span style={{color:'#f59e0b',fontSize:20}}>★★★★★</span>
              <span className="rev-count">(125)</span>
            </div>
          </div>
          <h2 className="P h2">What business owners say.</h2>
        </div>
        <div className={`rev-track rv ${s3.v?'vi':''}`} style={{transitionDelay:'.1s'}}>
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
          <button className="btn btn-lg" onClick={go}>Get My Free Profit Roadmap →</button>
        </div>
      </div>
    </section>

    {/* BERNARD  - Quick authority */}
    <section className="sec" style={{background:'var(--bg)'}} ref={s4.ref}>
      <div className="mx">
        <div className={`bg2 rv ${s4.v?'vi':''}`} style={{display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:'clamp(40px,6vw,80px)',alignItems:'center'}}>
          <div style={{position:'relative'}}>
            <div style={{width:'75%',aspectRatio:'3/4',borderRadius:24,overflow:'hidden',border:'2px solid rgba(139,83,236,.25)'}}>
              <img src="/images/warehouse-visit.jpeg" alt="Bernard at Premier Group factory" style={{width:'100%',height:'100%',objectFit:'cover'}} />
            </div>
            <div style={{position:'absolute',bottom:-16,right:0,width:'55%',aspectRatio:'4/3',borderRadius:16,overflow:'hidden',border:'4px solid var(--bg)',zIndex:2}}>
              <img src="/images/1765583997480.jpeg" alt="Bernard with team" style={{width:'100%',height:'100%',objectFit:'cover'}} />
            </div>
          </div>
          <div>
            <div className="G" style={{fontSize:11,fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',marginBottom:16}}>About Bernard Powell</div>
            <p className="P" style={{fontSize:22,fontStyle:'italic',marginBottom:20,lineHeight:1.4}}>"New Zealand's only business coach who actually built a factory."</p>
            <p style={{fontSize:15,color:'var(--dim)',lineHeight:1.7,marginBottom:24}}>Built Premier Group NZ  - 200 tonnes/day, 62 staff. Won NZ's Best Workplace. In a factory. AME Global Lean recognition. 98% employee engagement. 500+ business owners helped.</p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:24}}>
              {['AME Lean Tours','Best Workplace #1','98% Engagement','500+ Owners'].map((c,i)=><span key={i} style={{fontSize:12,fontWeight:600,color:'var(--dim)',background:'var(--card)',border:'1px solid rgba(139,83,236,.25)',borderRadius:999,padding:'6px 14px'}}>{c}</span>)}
            </div>
            <button className="btn btn-lg" onClick={go}>Get My Free Profit Roadmap →</button>
          </div>
        </div>
      </div>
    </section>

    {/* MARQUEE */}
    <section style={{background:'var(--lt)',padding:'32px 0'}}>
      <div className="mq"><div className="mq-c">
        {[...Array(2)].map((_,r)=><span key={r}>
          {[
            {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b53ec" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,text:'500+ Kiwi Business Owners'},
            {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b53ec" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,text:'$150M+ Revenue Generated'},
            {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,text:'125 Five-Star Reviews'},
            {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b53ec" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,text:'AME Global Lean'},
            {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b53ec" strokeWidth="2.5"><path d="M6 9H4.5a2.5 2.5 0 010-5C7 4 6 2 12 2s5 2 7.5 2a2.5 2.5 0 010 5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2Z"/></svg>,text:'NZ Best Workplace #1'},
          ].map((item,i)=><span key={i} className="mq-i" style={{color:'#4c1d95'}}>{item.icon}{item.text} <span style={{color:'#23affe',marginLeft:8}}>·</span></span>)}
        </span>)}
      </div></div>
    </section>

    {/* FORM — GHL Survey */}
    <section className="sec" id="form" style={{background:'var(--bg)'}} ref={s5.ref}>
      <div className="mx">
        <div className={`rv ${s5.v?'vi':''}`} style={{textAlign:'center',marginBottom:48}}>
          <h2 className="P h2">Get your <em className="G">free Profit Roadmap.</em></h2>
          <p style={{fontSize:16,color:'var(--dim)',marginTop:12}}>Takes 30 seconds. Completely free.</p>
        </div>
        <div className={`rv ${s5.v?'vi':''}`} style={{transitionDelay:'.1s',maxWidth:720,margin:'0 auto',borderRadius:18,overflow:'hidden'}}>
          <iframe src="https://api.leadconnectorhq.com/widget/survey/Ncu4ns5ogTyXrhcIdY9H" style={{border:'none',width:'100%',display:'block'}} scrolling="no" id="Ncu4ns5ogTyXrhcIdY9H" title="survey"/>
        </div>
      </div>
    </section>


    {/* FINAL CTA */}
    <section className="sec" style={{background:'var(--bg)',textAlign:'center',position:'relative',overflow:'hidden'}} ref={s7.ref}>
      <div className="orb" style={{width:400,height:400,background:'radial-gradient(circle,rgba(139,83,236,.15),transparent 70%)',top:-80,left:'40%',position:'absolute',filter:'blur(80px)'}}/>
      <div className="mx" style={{position:'relative',zIndex:1}}>
        <div className={`rv ${s7.v?'vi':''}`}>
          <h2 className="P" style={{fontSize:'clamp(32px,5vw,64px)',fontWeight:700,marginBottom:16}}>Your factory is <em className="G">leaking money.</em></h2>
          <p style={{fontSize:18,color:'var(--dim)',marginBottom:32}}>Find out where. 30 seconds. Free.</p>
          <button className="btn btn-lg" onClick={go}>Get My Free Profit Roadmap →</button>
          <p style={{marginTop:20,fontSize:12,color:'var(--mut)'}}>500+ NZ business owners · 125 five-star reviews · AME Lean Recognition</p>
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer style={{padding:'20px 0',textAlign:'center',fontSize:12,color:'var(--mut)',borderTop:'1px solid rgba(255,255,255,.04)'}}>
      <div className="mx">
        Premier Business Academy · Bernard Powell · © 2026
      </div>
    </footer>

    {/* STICKY */}
    <div className={`sk ${sticky?'show':''}`}><div className="mx sk-in">
      <img src="/images/pba-logo-full.webp" alt="Premier Business Academy" style={{height:22}} className="sk-brand" />
      <button className="btn" onClick={go}>Get Free Roadmap →</button>
    </div></div>
  </>)
}
