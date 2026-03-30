import { useState, useEffect, useRef, FormEvent } from 'react'

/* ═══════════════════════════════════════════════════════
   LEAD MAGNET LP  - Comic Book + AI + Futuristic Blend
   Premier Business Academy | Bernard Powell
   Fonts: Bangers (display), Orbitron (stats), Inter (body)
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
  return(<div className="vc" onMouseEnter={e=>e.currentTarget.style.transform='rotate(0deg) scale(1.02)'} onMouseLeave={e=>e.currentTarget.style.transform=''}>
    <div className="vw" onClick={()=>sP(true)}>{p?<iframe src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`} title={name} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen/>:<><img src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`} alt={name} loading="lazy"/><div className="vp"><svg width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="30" fill="url(#pg)"/><polygon points="24,18 24,42 44,30" fill="#fff"/><defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#00f0ff"/><stop offset="100%" stopColor="#ff3366"/></linearGradient></defs></svg></div></>}</div>
    <div className="vi-bubble"><b>{name}</b><span className="vs">{stat}</span><div className="bubble-point"/></div>
  </div>)
}

export default function LeadMagnetPage(){
  const[sticky,setSticky]=useState(false)
  const[step,setStep]=useState(1)
  const[email,setEmail]=useState('')
  const[faq,setFaq]=useState<number|null>(null)
  const s1=useReveal(),s2=useReveal(),s3=useReveal(),s4=useReveal(),s5=useReveal(),s6=useReveal(),s7=useReveal()

  useEffect(()=>{const h=()=>setSticky(scrollY>innerHeight*.8);addEventListener('scroll',h,{passive:true});return()=>removeEventListener('scroll',h)},[])
  const go=()=>document.getElementById('form')?.scrollIntoView({behavior:'smooth'})


  return(<>
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Bangers&family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700;800&display=swap');
:root{--p:#8b53ec;--b:#23affe;--cyan:#00f0ff;--magenta:#ff3366;--yellow:#ffe600;--g:linear-gradient(135deg,#00f0ff,#ff3366);--bg:#0a0a14;--panel:#12121f;--lt:#f8f7ff;--dim:rgba(255,255,255,.65);--mut:rgba(255,255,255,.45);--card:rgba(255,255,255,.04);--bdr:rgba(0,240,255,.3);--border-comic:3px solid rgba(0,240,255,.3);--e:cubic-bezier(.16,1,.3,1)}
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased;overflow-x:hidden}
body{background:var(--bg);color:#f0f0f0;font-family:'Inter',sans-serif;font-size:16px;line-height:1.6}

/* === HALFTONE DOT PATTERN OVERLAY === */
body::before{content:'';position:fixed;inset:0;background-image:radial-gradient(circle, rgba(0,240,255,.06) 1px, transparent 1px);background-size:16px 16px;pointer-events:none;z-index:0}

/* === ANIMATED GRID LINES === */
body::after{content:'';position:fixed;inset:0;background-image:
  linear-gradient(rgba(0,240,255,.03) 1px, transparent 1px),
  linear-gradient(90deg, rgba(0,240,255,.03) 1px, transparent 1px);
background-size:60px 60px;pointer-events:none;z-index:0;animation:gridShift 20s linear infinite}
@keyframes gridShift{0%{background-position:0 0}100%{background-position:60px 60px}}

.mx{max-width:1120px;margin:0 auto;padding:0 clamp(20px,5vw,48px);position:relative;z-index:1}
.G{background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.comic-head{font-family:'Bangers',cursive;letter-spacing:.04em}
.stat-num{font-family:'Orbitron',sans-serif}
.rv{opacity:0;transform:translateY(28px);transition:opacity .7s var(--e),transform .7s var(--e)}.rv.show{opacity:1;transform:none}

/* === PILL / TAG === */
.pill{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--cyan);background:rgba(0,240,255,.08);border:1px solid rgba(0,240,255,.3);border-radius:999px;padding:6px 18px;text-shadow:0 0 8px rgba(0,240,255,.3)}

/* === BUTTONS === */
.btn{display:inline-flex;align-items:center;gap:6px;background:var(--g);color:#fff;font-weight:700;padding:15px 32px;border-radius:10px;border:2px solid rgba(0,240,255,.4);cursor:pointer;box-shadow:0 0 20px rgba(0,240,255,.25),0 0 40px rgba(255,51,102,.15);transition:transform .15s,box-shadow .15s;text-decoration:none;font-size:16px;font-family:'Inter',sans-serif;position:relative;overflow:hidden;clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px))}
.btn:hover{transform:translateY(-2px);box-shadow:0 0 30px rgba(0,240,255,.5),0 0 60px rgba(255,51,102,.3)}
.btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);transform:translateX(-100%);transition:transform .5s}.btn:hover::after{transform:translateX(100%)}
.btn-lg{font-size:16px;padding:14px 30px}
.btn-ghost{background:transparent;border:2px solid rgba(0,240,255,.35);box-shadow:none;backdrop-filter:blur(8px);color:var(--cyan)}.btn-ghost:hover{border-color:var(--cyan);transform:none;box-shadow:0 0 16px rgba(0,240,255,.3)}

/* === NAV - HUD STYLE === */
.nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:14px 0;background:rgba(10,10,20,.95);backdrop-filter:blur(20px);border-bottom:2px solid rgba(0,240,255,.2);clip-path:polygon(0 0,100% 0,100% calc(100% - 6px),calc(100% - 6px) 100%,6px 100%,0 calc(100% - 6px))}
.nav-in{display:flex;justify-content:space-between;align-items:center}
.nav .btn{font-size:14px;padding:10px 22px}

/* === HERO === */
.hero{min-height:100vh;display:flex;align-items:center;padding:120px 0 80px;position:relative;overflow:hidden}
.hero-g{display:grid;grid-template-columns:1fr 1fr;gap:clamp(40px,6vw,80px);align-items:center}
.hero h1{font-family:'Bangers',cursive;font-size:clamp(42px,5vw,72px);font-weight:400;line-height:1.08;letter-spacing:.04em;margin-bottom:20px;text-shadow:0 0 30px rgba(0,240,255,.2)}
.hero-desc{font-size:clamp(18px,2vw,22px);color:#f0f0f0;max-width:560px;margin-bottom:32px;line-height:1.6}
.hero-ctas{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:40px}

/* === HERO STATS - STARBURST === */
.hero-stats{display:flex;gap:28px;flex-wrap:wrap}
.hero-stat{position:relative;text-align:center;padding:16px 20px}
.hero-stat::before{content:'';position:absolute;inset:-4px;background:rgba(0,240,255,.06);border:2px solid rgba(0,240,255,.2);border-radius:12px;clip-path:polygon(50% 0%,61% 8%,98% 2%,88% 18%,100% 50%,88% 82%,98% 98%,61% 92%,50% 100%,39% 92%,2% 98%,12% 82%,0% 50%,12% 18%,2% 2%,39% 8%);animation:starPulse 3s ease-in-out infinite alternate}
@keyframes starPulse{0%{border-color:rgba(0,240,255,.2);box-shadow:none}100%{border-color:rgba(0,240,255,.5);box-shadow:0 0 16px rgba(0,240,255,.15)}}
.hero-sn{font-family:'Orbitron',sans-serif;font-size:clamp(24px,3vw,36px);font-weight:700;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-sl{font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--mut)}

/* === HERO PHOTO - COMIC PANEL === */
.hero-photo{position:relative;display:flex;justify-content:center}
.hero-frame{width:100%;max-width:420px;aspect-ratio:3/4;border-radius:12px;overflow:hidden;border:3px solid rgba(0,240,255,.4);transform:rotate(1.5deg);box-shadow:8px 8px 0 rgba(255,51,102,.2),-4px -4px 0 rgba(0,240,255,.15);position:relative}
.hero-frame::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 70%, rgba(0,240,255,.08) 0%, transparent 60%);pointer-events:none}
.hero-frame img{width:100%;height:100%;object-fit:cover;object-position:center top}

/* === SPEECH BUBBLE TRUST CHIPS === */
.hero-trust{position:absolute;right:-16px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:10px;z-index:2}
.hero-chip{display:flex;align-items:center;gap:6px;background:rgba(18,18,31,.92);backdrop-filter:blur(16px);border:2px solid rgba(0,240,255,.25);border-radius:12px 12px 12px 2px;padding:8px 14px;font-size:11px;font-weight:600;white-space:nowrap;color:rgba(255,255,255,.9);box-shadow:0 0 12px rgba(0,240,255,.1);position:relative}
.hero-chip-icon{font-size:13px;flex-shrink:0}
.hero-reviews{position:absolute;bottom:20px;left:-16px;z-index:3;background:rgba(18,18,31,.92);backdrop-filter:blur(16px);border:2px solid rgba(0,240,255,.3);border-radius:16px;padding:14px 20px;text-align:center;box-shadow:0 0 20px rgba(0,240,255,.15)}
.hero-reviews-num{font-family:'Orbitron',sans-serif;font-size:28px;font-weight:700;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.hero-reviews-stars{color:#ffe600;font-size:14px;letter-spacing:2px}
.hero-reviews-label{font-size:10px;color:var(--mut);margin-top:2px}
.hero-trust-mobile{display:none;flex-wrap:wrap;gap:8px;margin-top:24px;justify-content:center}

/* === SPEED LINES (HERO) === */
.speed-lines{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}
.speed-lines::before,.speed-lines::after{content:'';position:absolute;width:200%;height:2px;top:35%;left:-50%;background:linear-gradient(90deg,transparent,rgba(0,240,255,.08),transparent);transform:rotate(-8deg);animation:speedLine 4s ease-in-out infinite}
.speed-lines::after{top:65%;transform:rotate(5deg);animation-delay:2s;background:linear-gradient(90deg,transparent,rgba(255,51,102,.06),transparent)}
@keyframes speedLine{0%,100%{opacity:0;transform:rotate(-8deg) translateX(-10%)}50%{opacity:1;transform:rotate(-8deg) translateX(5%)}}

/* === POW BURST (behind gradient text) === */
.pow-burst{position:relative;display:inline}
.pow-burst::before{content:'POW!';position:absolute;top:-36px;right:-50px;font-family:'Bangers',cursive;font-size:28px;color:var(--yellow);transform:rotate(12deg);text-shadow:2px 2px 0 rgba(255,51,102,.6),0 0 10px rgba(255,230,0,.3);z-index:-1;opacity:.7;animation:powPulse 2s ease-in-out infinite alternate}
@keyframes powPulse{0%{transform:rotate(12deg) scale(1)}100%{transform:rotate(15deg) scale(1.1)}}

/* === ORBS === */
.orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}
.orb1{width:500px;height:500px;background:radial-gradient(circle,rgba(0,240,255,.2),transparent 70%);top:-100px;right:-150px;animation:oF 12s ease-in-out infinite alternate}
.orb2{width:400px;height:400px;background:radial-gradient(circle,rgba(255,51,102,.15),transparent 70%);top:300px;left:-200px;animation:oF 15s ease-in-out infinite alternate-reverse}
@keyframes oF{0%{transform:translate(0) scale(1)}50%{transform:translate(20px,-15px) scale(1.08)}100%{transform:translate(-15px,20px) scale(.95)}}

/* === SECTIONS === */
.sec{padding:clamp(60px,10vw,120px) 0;position:relative}
.sec-lt{background:var(--lt);color:#111}
.h2{font-family:'Bangers',cursive;font-size:clamp(32px,4.5vw,56px);font-weight:400;line-height:1.1;letter-spacing:.03em;text-shadow:0 0 20px rgba(0,240,255,.15)}
.h2 em{font-style:normal}
.sec-lt .h2{text-shadow:none}

/* === SECTION ACCENT LABELS === */
.zap-label{display:inline-block;font-family:'Bangers',cursive;font-size:18px;color:var(--yellow);background:rgba(255,230,0,.1);border:2px solid rgba(255,230,0,.3);padding:4px 16px;border-radius:8px;margin-bottom:16px;text-shadow:0 0 8px rgba(255,230,0,.3);letter-spacing:.06em;transform:rotate(-2deg)}

/* === VIDEO SECTION - COMIC PANELS === */
.vg{display:grid;grid-template-columns:repeat(2,1fr);gap:24px}
.vc{border-radius:10px;overflow:visible;background:var(--panel);border:3px solid rgba(0,240,255,.2);transition:transform .3s var(--e),box-shadow .3s;position:relative}
.vc:nth-child(odd){transform:rotate(-1deg)}.vc:nth-child(even){transform:rotate(1deg)}
.vc:hover{z-index:2;box-shadow:0 0 24px rgba(0,240,255,.3)}
.vw{position:relative;padding-bottom:56.25%;cursor:pointer;overflow:hidden;border-radius:8px 8px 0 0}
.vw img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .3s}.vw:hover img{transform:scale(1.03)}
.vw iframe{position:absolute;inset:0;width:100%;height:100%;border:none}
.vp{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.35);transition:background .3s}.vw:hover .vp{background:rgba(0,0,0,.15)}

/* === SPEECH BUBBLE under video === */
.vi-bubble{padding:14px 16px;position:relative;background:var(--panel);border-top:2px solid rgba(0,240,255,.15)}.vi-bubble b{display:block;font-size:15px;color:var(--cyan)}.vs{display:block;font-size:16px;font-weight:700;margin-top:4px;background:var(--g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.bubble-point{position:absolute;bottom:-8px;left:20px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid var(--panel)}

/* === TRANSFORM SECTION - COMIC STRIP PANELS === */
.tg{display:flex;flex-direction:column;gap:20px}
.tr{display:grid;grid-template-columns:1fr 56px 1fr;align-items:stretch;position:relative}
.to{background:rgba(220,38,38,.06);border:3px solid rgba(220,38,38,.3);border-radius:12px 0 0 12px;padding:22px;position:relative;overflow:hidden}
.to::before{content:'';position:absolute;inset:0;background:radial-gradient(circle, rgba(220,38,38,.08) 1px, transparent 1px);background-size:8px 8px;pointer-events:none}
.to-l{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#dc2626;margin-bottom:6px;font-family:'Bangers',cursive;font-size:14px;letter-spacing:.08em}.to-t{font-size:14px;line-height:1.5;color:#991b1b}

/* === COMIC ACTION ARROW === */
.tv{display:flex;align-items:center;justify-content:center;background:rgba(139,83,236,.06)}
.tv-b{width:40px;height:40px;border-radius:8px;background:var(--g);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:900;font-family:'Bangers',cursive;border:2px solid rgba(0,240,255,.4);box-shadow:0 0 12px rgba(0,240,255,.2);animation:arrowPulse 2s ease-in-out infinite alternate}
@keyframes arrowPulse{0%{box-shadow:0 0 8px rgba(0,240,255,.2)}100%{box-shadow:0 0 20px rgba(0,240,255,.4)}}

.tn{background:rgba(0,240,255,.04);border:3px solid rgba(0,240,255,.25);border-radius:0 12px 12px 0;padding:22px;position:relative;overflow:hidden}
.tn::before{content:'';position:absolute;inset:0;background:radial-gradient(circle, rgba(0,240,255,.06) 1px, transparent 1px);background-size:8px 8px;pointer-events:none}
.tn-l{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--cyan);margin-bottom:6px;font-family:'Bangers',cursive;font-size:14px;letter-spacing:.08em}.tn-t{font-size:14px;line-height:1.5;color:#0e7490;font-weight:600}

/* === FORM - TERMINAL/HUD === */
.fc{max-width:520px;margin:0 auto;background:rgba(18,18,31,.95);border:2px solid rgba(0,240,255,.25);border-radius:16px;padding:clamp(28px,4vw,48px);position:relative;backdrop-filter:blur(20px);box-shadow:0 0 40px rgba(0,240,255,.1),0 24px 80px rgba(0,0,0,.5);clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));overflow:hidden}
.fc::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--g)}
/* Scan line animation */
.fc::after{content:'';position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,240,255,.015) 2px,rgba(0,240,255,.015) 4px);pointer-events:none;animation:scanMove 8s linear infinite}
@keyframes scanMove{0%{background-position:0 0}100%{background-position:0 100px}}
.fi{width:100%;background:rgba(0,240,255,.03);border:none;border-bottom:2px solid rgba(0,240,255,.15);padding:14px 12px;font-size:15px;color:#f0f0f0;font-family:'Inter',sans-serif;outline:none;margin-bottom:18px;transition:border-color .3s,box-shadow .3s;border-radius:4px}.fi:focus{border-color:var(--cyan);box-shadow:0 2px 12px rgba(0,240,255,.15)}.fi::placeholder{color:var(--mut)}
.fs{width:100%;background:rgba(0,240,255,.03);border:none;border-bottom:2px solid rgba(0,240,255,.15);padding:14px 12px;font-size:15px;color:#f0f0f0;font-family:'Inter',sans-serif;outline:none;margin-bottom:18px;cursor:pointer;appearance:none;-webkit-appearance:none;border-radius:4px}
.fs option{background:var(--bg);color:#f0f0f0}
/* Progress dots as power indicators */
.form-dots{display:flex;gap:8px;justify-content:center;margin-top:16px}
.form-dot{width:10px;height:10px;border-radius:50%;border:2px solid rgba(0,240,255,.3);transition:all .3s}
.form-dot.active{background:var(--cyan);border-color:var(--cyan);box-shadow:0 0 8px rgba(0,240,255,.5)}

/* === FAQ === */
.fq{max-width:720px;margin:0 auto}
.fq-i{border-bottom:1px solid rgba(0,0,0,.08);overflow:hidden}
.fq-q{display:flex;justify-content:space-between;align-items:center;padding:18px 0;cursor:pointer;font-size:15px;font-weight:600;color:#111;background:none;border:none;width:100%;text-align:left}
.fq-c{transition:transform .3s;font-size:18px;color:#9ca3af}
.fq-a{max-height:0;overflow:hidden;transition:max-height .4s var(--e)}
.fq-a-in{padding:0 0 18px;font-size:14px;color:#4b5563;line-height:1.7}

/* === REVIEWS SLIDER - SPEECH BUBBLES (LIGHT BG) === */
.rev-track{display:flex;gap:20px;overflow:hidden;position:relative}
.rev-slide{display:flex;gap:20px;animation:revSlide 60s linear infinite}
.rev-slide:hover{animation-play-state:paused}
.rev-card{background:#fff;border-radius:16px 16px 16px 4px;padding:24px;border:2px solid rgba(0,0,0,.06);min-width:320px;max-width:320px;flex-shrink:0;position:relative;box-shadow:0 4px 16px rgba(0,0,0,.06)}
.rev-card::after{content:'';position:absolute;bottom:-10px;left:24px;width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:10px solid #fff}
.rev-top{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.rev-avatar{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px;flex-shrink:0;border:2px solid rgba(0,0,0,.1)}
.rev-name{font-weight:700;font-size:14px;color:#111}
.rev-stars{color:#f59e0b;font-size:13px;letter-spacing:1px}
.rev-text{font-size:14px;line-height:1.65;color:#374151}
.rev-g-logo{display:flex;align-items:center;gap:8px}
.rev-g-logo svg{flex-shrink:0}
.rev-rating{font-family:'Orbitron',sans-serif;font-size:32px;font-weight:800;color:#111}
.rev-count{font-size:14px;color:#6b7280}
@keyframes revSlide{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

/* === MARQUEE - COMIC STYLE === */
.mq{overflow:hidden;white-space:nowrap;padding:0}
.mq-c{display:inline-flex;animation:mqa 30s linear infinite}
.mq:hover .mq-c{animation-play-state:paused}
.mq-i{padding:0 2rem;font-family:'Bangers',cursive;font-size:clamp(22px,2.8vw,34px);display:inline-flex;align-items:center;gap:10px;letter-spacing:.04em}
@keyframes mqa{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}

/* === STICKY BAR - HUD PANEL === */
.sk{position:fixed;bottom:0;left:0;right:0;z-index:99;background:rgba(10,10,20,.96);backdrop-filter:blur(16px);border-top:2px solid rgba(0,240,255,.2);padding:12px 0;transform:translateY(100%);transition:transform .4s var(--e);clip-path:polygon(8px 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%,0 8px)}
.sk.show{transform:translateY(0)}
.sk-in{display:flex;justify-content:space-between;align-items:center}
.sk .btn{font-size:14px;padding:10px 24px;animation:cyanPulse 2s ease-in-out infinite alternate}
@keyframes cyanPulse{0%{box-shadow:0 0 12px rgba(0,240,255,.2)}100%{box-shadow:0 0 24px rgba(0,240,255,.5),0 0 48px rgba(0,240,255,.15)}}

/* === DIAGONAL SECTION DIVIDERS === */
.clip-top{clip-path:polygon(0 30px, 100% 0, 100% 100%, 0 100%)}
.clip-bottom{clip-path:polygon(0 0, 100% 0, 100% calc(100% - 30px), 0 100%)}

/* === RESPONSIVE === */
@media(max-width:900px){
  .hero-g{grid-template-columns:1fr!important;text-align:center}
  .hero-photo{display:none!important}
  .hero-trust-mobile{display:flex}
  .hero-ctas{justify-content:center}
  .hero-stats{justify-content:center}
  .hero-desc{margin:0 auto 32px}
  .bg2{grid-template-columns:1fr!important}
  .vg{grid-template-columns:1fr}
  .vc{border-radius:10px}
  .vc:nth-child(odd),.vc:nth-child(even){transform:none}
  .vw{padding-bottom:56.25%}
  .vi-bubble{padding:16px 18px}
  .vi-bubble b{font-size:17px}
  .vs{font-size:18px;margin-top:4px}
  .tr{grid-template-columns:1fr}
  .to{border-radius:12px 12px 0 0;border-width:2px}
  .tv{padding:6px 0}
  .tn{border-radius:0 0 12px 12px;border-width:2px}
  .sec{overflow-x:hidden}
  .vc{border-width:2px}
  .pow-burst::before{display:none}
}
@media(max-width:480px){
  .hero{padding:90px 0 40px}
  .sec{padding:clamp(36px,8vw,80px) 0}
  .hero-ctas{flex-direction:column;align-items:center}
  .hero-stats{gap:16px}
  .sk-brand{display:none}
  .vg{gap:16px}
  .vi-bubble{padding:14px 16px}
  .hero-stat::before{display:none}
}
@media(prefers-reduced-motion:reduce){.rv{opacity:1!important;transform:none!important;transition:none!important}.orb{animation:none!important}.mq-c{animation:none!important}.rev-slide{animation:none!important}body::after{animation:none!important}}
`}</style>

    {/* NAV - HUD STYLE */}
    <nav className="nav"><div className="mx nav-in">
      <img src="/images/pba-logo-full.webp" alt="Premier Business Academy" style={{height:30}} />
      <button className="btn" onClick={go}>Get Free Roadmap →</button>
    </div></nav>

    {/* HERO */}
    <section className="hero">
      <div className="speed-lines"/>
      <div className="orb orb1"/><div className="orb orb2"/>
      <div className="mx hero-g" style={{position:'relative',zIndex:1}}>
        <div>
          <div className="pill" style={{marginBottom:24}}>For Kiwi Manufacturers</div>
          <h1 className="comic-head">Get your free roadmap to add <em className="pow-burst"><span className="G">$50K+ more profit</span></em> without working more</h1>
          <p className="hero-desc">See exactly where your factory is leaking money and the one fix that recovers it fastest. Free. Takes 30 seconds.</p>
          <div className="hero-ctas">
            <button className="btn btn-lg" onClick={go}>Get My Free Profit Roadmap →</button>
            <button className="btn btn-ghost" onClick={()=>document.getElementById('proof')?.scrollIntoView({behavior:'smooth'})}>Watch results ↓</button>
          </div>
          <div className="hero-stats">
            {[{n:'500+',l:'Owners Helped'},{n:'55%',l:'Revenue Increase'},{n:'#1',l:'NZ Best Workplace'}].map((s,i)=><div key={i} className="hero-stat"><div className="hero-sn stat-num">{s.n}</div><div className="hero-sl">{s.l}</div></div>)}
          </div>
          {/* Mobile-only trust chips */}
          <div className="hero-trust-mobile">
            {[
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,text:'$150M+ Revenue'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffe600" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,text:'125 Five-Star Reviews'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,text:'NZ Only'},
            ].map((c,i)=>
              <div key={i} className="hero-chip"><span className="hero-chip-icon">{c.icon}</span>{c.text}</div>
            )}
          </div>
        </div>
        {/* Desktop-only: image with comic panel frame */}
        <div className="hero-photo">
          <div className="hero-frame"><img src="/images/1750066266064.jpeg" alt="Bernard Powell" /></div>
          <div className="hero-trust">
            {[
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,text:'500+ Owners Helped'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,text:'$150M+ Revenue'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,text:'10+ Years in NZ'},
              {icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffe600" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,text:'Westpac Award Winner'},
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

    {/* RESULTS - ZAP! style header */}
    <section className="sec" id="proof" style={{background:'var(--bg)'}} ref={s1.ref}>
      <div className="mx">
        <div className={`rv ${s1.v?'show':''}`} style={{marginBottom:48}}>
          <div className="zap-label">ZAP! Real Results</div>
          <h2 className="comic-head h2">NZ business owners who worked with Bernard.</h2>
        </div>
        <div className={`vg rv ${s1.v?'show':''}`} style={{transitionDelay:'.15s'}}>
          {VIDEOS.map((v,i)=><YT key={i} {...v}/>)}
        </div>
        <div style={{textAlign:'center',marginTop:48}}>
          <button className="btn btn-lg" onClick={go}>Get My Free Profit Roadmap →</button>
        </div>
      </div>
    </section>

    {/* TRANSFORMATION - COMIC STRIP PANELS */}
    <section className="sec sec-lt clip-top" ref={s2.ref}>
      <div className="mx">
        <div className={`rv ${s2.v?'show':''}`} style={{marginBottom:48}}>
          <h2 className="comic-head h2" style={{color:'#111'}}>What changes in <em className="G">90 days.</em></h2>
        </div>
        <div className={`tg rv ${s2.v?'show':''}`} style={{transitionDelay:'.1s'}}>
          {TRANSFORMS.map((t,i)=><div key={i} className="tr">
            <div className="to"><div className="to-l">NOW</div><div className="to-t">{t.old}</div></div>
            <div className="tv"><div className="tv-b">→</div></div>
            <div className="tn"><div className="tn-l">AFTER</div><div className="tn-t">{t.new_}</div></div>
          </div>)}
        </div>
        <div style={{textAlign:'center',marginTop:48}}>
          <button className="btn btn-lg" onClick={go}>Get My Free Profit Roadmap →</button>
        </div>
      </div>
    </section>

    {/* GOOGLE REVIEWS - Speech bubble cards on light bg */}
    <section className="sec sec-lt" ref={s3.ref}>
      <div className="mx">
        <div className={`rv ${s3.v?'show':''}`} style={{marginBottom:40}}>
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
          <h2 className="comic-head h2" style={{color:'#111'}}>What business owners say.</h2>
        </div>
        <div className={`rev-track rv ${s3.v?'show':''}`} style={{transitionDelay:'.1s'}}>
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

    {/* BERNARD - ORIGIN STORY */}
    <section className="sec clip-top" style={{background:'var(--bg)'}} ref={s4.ref}>
      <div className="mx">
        <div className={`bg2 rv ${s4.v?'show':''}`} style={{display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:'clamp(40px,6vw,80px)',alignItems:'center'}}>
          <div style={{position:'relative'}}>
            {/* Comic panel frames for photos */}
            <div style={{width:'75%',aspectRatio:'3/4',borderRadius:12,overflow:'hidden',border:'3px solid rgba(0,240,255,.3)',transform:'rotate(-2deg)',boxShadow:'6px 6px 0 rgba(255,51,102,.2)',position:'relative'}}>
              <img src="/images/warehouse-visit.jpeg" alt="Bernard at Premier Group factory" style={{width:'100%',height:'100%',objectFit:'cover'}} />
              {/* Halftone shadow overlay */}
              <div style={{position:'absolute',inset:0,background:'radial-gradient(circle, rgba(0,240,255,.05) 1px, transparent 1px)',backgroundSize:'6px 6px',pointerEvents:'none'}}/>
            </div>
            <div style={{position:'absolute',bottom:-16,right:0,width:'55%',aspectRatio:'4/3',borderRadius:12,overflow:'hidden',border:'3px solid rgba(255,51,102,.3)',zIndex:2,transform:'rotate(2deg)',boxShadow:'-4px 4px 0 rgba(0,240,255,.2)'}}>
              <img src="/images/1765583997480.jpeg" alt="Bernard with team" style={{width:'100%',height:'100%',objectFit:'cover'}} />
            </div>
          </div>
          <div>
            <div className="zap-label" style={{transform:'rotate(-1deg)'}}>ORIGIN STORY</div>
            <p className="comic-head" style={{fontSize:26,marginBottom:20,lineHeight:1.3,color:'var(--cyan)',textShadow:'0 0 20px rgba(0,240,255,.2)'}}>"New Zealand's only business coach who actually built a factory."</p>
            <p style={{fontSize:15,color:'var(--dim)',lineHeight:1.7,marginBottom:24}}>Built Premier Group NZ  - 200 tonnes/day, 62 staff. Won NZ's Best Workplace. In a factory. AME Global Lean recognition. 98% employee engagement. 500+ business owners helped.</p>
            {/* Comic-style callout boxes for credentials */}
            <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:24}}>
              {['AME Lean Tours','Best Workplace #1','98% Engagement','500+ Owners'].map((c,i)=><span key={i} style={{fontFamily:"'Bangers', cursive",fontSize:14,letterSpacing:'.03em',color:'var(--cyan)',background:'rgba(0,240,255,.06)',border:'2px solid rgba(0,240,255,.2)',borderRadius:8,padding:'6px 14px',display:'inline-block'}}>{c}</span>)}
            </div>
            <button className="btn btn-lg" onClick={go}>Get My Free Profit Roadmap →</button>
          </div>
        </div>
      </div>
    </section>

    {/* MARQUEE - COMIC STYLE: Yellow bg, black text */}
    <section style={{background:'var(--yellow)',padding:'20px 0',borderTop:'3px solid #111',borderBottom:'3px solid #111'}}>
      <div className="mq"><div className="mq-c">
        {[...Array(2)].map((_,r)=><span key={r}>
          {[
            {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,text:'500+ Kiwi Business Owners'},
            {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,text:'$150M+ Revenue Generated'},
            {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,text:'125 Five-Star Reviews'},
            {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>,text:'AME Global Lean'},
            {icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5"><path d="M6 9H4.5a2.5 2.5 0 010-5C7 4 6 2 12 2s5 2 7.5 2a2.5 2.5 0 010 5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2Z"/></svg>,text:'NZ Best Workplace #1'},
          ].map((item,i)=><span key={i} className="mq-i" style={{color:'#111'}}>{item.icon}{item.text} <span style={{color:'var(--magenta)',marginLeft:8,fontSize:'1.2em'}}>*</span></span>)}
        </span>)}
      </div></div>
    </section>

    {/* FORM - Terminal/HUD multi-step */}
    <section className="sec" id="form" style={{background:'var(--bg)'}} ref={s5.ref}>
      <div className="mx">
        <div className={`rv ${s5.v?'show':''}`} style={{textAlign:'center',marginBottom:48}}>
          <h2 className="comic-head h2">Get your <em className="G">free Profit Roadmap.</em></h2>
          <p style={{fontSize:16,color:'var(--dim)',marginTop:12}}>4 stages. 7 profit areas. One clear priority. Takes 30 seconds.</p>
        </div>
        <div className={`fc rv ${s5.v?'show':''}`} style={{transitionDelay:'.1s'}}>
          {step===1?(
            <form onSubmit={e=>{e.preventDefault();if(email)setStep(2)}}>
              <div className="comic-head" style={{fontSize:24,marginBottom:8,color:'var(--cyan)',textShadow:'0 0 12px rgba(0,240,255,.2)'}}>Where should we send your roadmap?</div>
              <div style={{fontSize:14,color:'var(--dim)',marginBottom:24}}>Get your personalised Profit Roadmap in under 30 seconds.</div>
              <input className="fi" type="email" placeholder="Business email address" value={email} onChange={e=>setEmail(e.target.value)} required />
              <button type="submit" className="btn" style={{width:'100%',justifyContent:'center'}}>Continue</button>
              <div className="form-dots">
                <div className="form-dot active"/><div className="form-dot"/>
              </div>
            </form>
          ):(
            <form onSubmit={e=>{e.preventDefault();alert('Roadmap submitted!')}}>
              {/* GHL: POST to https://services.leadconnectorhq.com/hooks/WEBHOOK_ID */}
              <div className="comic-head" style={{fontSize:24,marginBottom:8,color:'var(--cyan)',textShadow:'0 0 12px rgba(0,240,255,.2)'}}>Tell us about your factory.</div>
              <div style={{fontSize:14,color:'var(--dim)',marginBottom:24}}>So we send you the right roadmap for your stage.</div>
              {[{p:'Number of staff',o:['1–3','4–10','11–20','20+']},{p:'Annual revenue',o:['Under $500K','$500K–$1M','$1M–$1.5M','$1.5M+']},{p:'Biggest challenge',o:['Margins shrinking','Stuck on the floor','Cash flow','Staff retention','Growth']},{p:'Hours/week on floor',o:['Under 20','20–40','40–60','60+']}].map((f,i)=><select key={i} className="fs" required defaultValue=""><option value="" disabled>{f.p}</option>{f.o.map((o,j)=><option key={j}>{o}</option>)}</select>)}
              <button type="submit" className="btn btn-lg" style={{width:'100%',justifyContent:'center',marginTop:8}}>Get My Roadmap →</button>
              <div style={{fontSize:11,color:'var(--mut)',marginTop:14,textAlign:'center'}}>Free. No credit card. NZ Privacy Act 2020.</div>
              <div className="form-dots">
                <div className="form-dot active"/><div className="form-dot active"/>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>


    {/* FINAL CTA */}
    <section className="sec" style={{background:'var(--bg)',textAlign:'center',position:'relative',overflow:'hidden'}} ref={s7.ref}>
      <div className="orb" style={{width:400,height:400,background:'radial-gradient(circle,rgba(0,240,255,.12),transparent 70%)',top:-80,left:'40%',position:'absolute',filter:'blur(80px)'}}/>
      <div className="mx" style={{position:'relative',zIndex:1}}>
        <div className={`rv ${s7.v?'show':''}`}>
          <h2 className="comic-head" style={{fontSize:'clamp(36px,5.5vw,68px)',marginBottom:16}}>Your factory is <em className="G">leaking money.</em></h2>
          <p style={{fontSize:18,color:'var(--dim)',marginBottom:32}}>Find out where. 30 seconds. Free.</p>
          <button className="btn btn-lg" onClick={go}>Get My Free Profit Roadmap →</button>
          <p style={{marginTop:20,fontSize:12,color:'var(--mut)'}}>500+ NZ business owners · 125 five-star reviews · AME Lean Recognition</p>
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer style={{padding:'20px 0',textAlign:'center',fontSize:12,color:'var(--mut)',borderTop:'2px solid rgba(0,240,255,.1)'}}>
      <div className="mx">
        Premier Business Academy · Bernard Powell · © 2026
      </div>
    </footer>

    {/* STICKY BAR - HUD PANEL */}
    <div className={`sk ${sticky?'show':''}`}><div className="mx sk-in">
      <img src="/images/pba-logo-full.webp" alt="Premier Business Academy" style={{height:22}} className="sk-brand" />
      <button className="btn" onClick={go}>Get Free Roadmap →</button>
    </div></div>
  </>)
}
