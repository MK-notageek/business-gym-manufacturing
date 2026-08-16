import { useLocation, Link } from 'react-router-dom'
import VSLPlayer from '../components/VSLPlayer'
import { useEffect, useRef, useState } from 'react'

// GHL passes rev=high or rev=low

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    clarity?: (...args: unknown[]) => void
    __pbaScheduleFired?: boolean
  }
}

// Bernard's roadmap VSL: what they watch before picking a slot. Same 540p web cut
// and the same player treatment as the post-booking page.
const VSL_SRC = '/media/roadmap-vsl.mp4'
const VSL_POSTER = '/media/roadmap-vsl-poster.jpg'

// The full Client Success Stories wall, newest first. Every id is a live video on
// PBA's "Client Success Stories" playlist; the stat under each is taken from what
// the client actually says on camera, not invented.
// Tim's story (gAfNzSxSWP4) is deliberately absent: it is a good testimonial but it
// is about a one-off Rotary club talk, not the program, so it does not belong here.
const VIDEOS = [
  { id: 'Xycxlyff3Dw', name: 'Business Owner', stat: 'Stress From 95% to 15% in 3 Weeks' },
  { id: 'EVGF7D0GYac', name: 'Business Owner', stat: 'Joined at the Brink, Saved the Business' },
  { id: 'qGMpmYG0eCY', name: 'Monica', stat: 'Never Sold Before, Selling in 2 Weeks' },
  { id: 'S20xSB2N7KE', name: 'Manufacturer · Germany', stat: '15 Years Stuck, Turned Around in 12 Months' },
  { id: 'UVMoBY-6XEA', name: 'Carl', stat: 'First Holiday in 16 Years' },
  { id: 'A7JWgXM1rHY', name: 'Scott · Taranaki', stat: 'Too Time-Poor? Start Here' },
  { id: 'bvVbHzzYh8k', name: 'Haymo', stat: 'Broke Through Our Ceiling' },
  { id: 'HqMUp3MwUFE', name: 'Josh · Live Event', stat: "You Don't Know What You Don't Know" },
  { id: 'GjBrkJliHpg', name: 'Peter', stat: 'Was Ready to Give Up' },
  { id: '3HXDcI0NPQk', name: 'James', stat: 'More in 8 Weeks Than 6 Months Elsewhere' },
  { id: 'QzcCOnWlcuo', name: 'Joey', stat: 'Triple the Workload, Same Hours' },
  { id: '1d4Ag8VEtd0', name: 'Willie', stat: 'From Workaholic to Family First' },
  { id: 'Qwy7hKm_i48', name: 'Business Owner', stat: 'Saved Us Money, Time and Pain' },
  { id: 'Y-WWSRAyAeo', name: 'Amos · USA', stat: 'From 80-Hour Weeks to Home by 3pm' },
  { id: 'wM7CsYvKyqM', name: 'Landie', stat: 'Record Results in Just 2 Months' },
  { id: 'HPIkiCDgzOw', name: 'Business Owner', stat: 'The Golden Hour Fixed Follow-Up' },
  { id: 'Q5qPUpESams', name: 'Business Owner', stat: 'Broke Every Sales Record' },
  { id: 'WHmiy9B5nB0', name: 'Business Owner', stat: 'Grew Cash Flow 480% in 6 Months' },
  { id: '_pJmMLgn9LE', name: 'Leigh · Quin Global · UK', stat: 'Broke Through a $20M Ceiling' },
  { id: 'SRP0p5GJYwY', name: 'Jonathan · USA', stat: 'Booked Out Through November' },
  { id: 'mwVXz5kA3FM', name: 'Carlie · Canada', stat: 'A Decade of Wrong Systems, Fixed' },
  { id: 'jguYImcbWyM', name: 'Nur · NZ', stat: 'Clarity in a Single Session' },
  { id: 'xvsNBrj9ivU', name: 'Andy · NZ', stat: 'Grew Fast, Cut Ad Spend to Zero' },
  { id: 'teJexLx8i8A', name: 'James · AU', stat: 'Serious About Growth, And It Works' },
  { id: 'mt0UTryP6lk', name: 'Nathan · AU', stat: 'Stopped Leaving Money on the Table' },
  { id: '9nEAuLyWeJQ', name: 'Vern · UK', stat: 'From Operator to Owner' },
  { id: 'u2ZU8BPgGKQ', name: 'Matthew · UK', stat: 'The Accountability to Execute' },
  { id: 'XL29a8JTKq8', name: 'Trent · USA', stat: 'Got His Numbers & Systems Sorted' },
  { id: 'COGbYSoGss4', name: 'Sebastien · NZ', stat: 'A Simple Structure & More Clarity' },
  { id: 'BbcoNuMfjmw', name: 'Mitchell', stat: '9 to 11 Hours Saved Every Week' },
  { id: 'mHGpgEVoUFY', name: 'Josh', stat: '+36 to 40% Revenue · Weekends Back' },
  { id: 'hqCtdyMNOgY', name: 'Chris', stat: 'Systems Replaced Chaos' },
  { id: 'VfQdGgEyjdQ', name: 'Abe', stat: '100+ Improvements Without Him' },
  { id: 'rrMx4Z-ekG0', name: 'Trent', stat: '+50 to 55% Revenue · 22 to 25 Hours Back' },
  { id: '1go1aT89mLc', name: 'Business Owner · DE', stat: 'Lean Transformed the Floor' },
  { id: 'G_U7acj7U3o', name: 'Matthew · Allquip', stat: '2 a Month to 50 Units in 6 Weeks' },
  { id: 'evtQQodkANk', name: 'Abe · Edusafe', stat: 'Sustaining a Lean Culture' },
]

// Twenty of PBA's strongest five-star Google reviews, pulled from the live listing
// on 2026-08-16. Selected for the ones that talk about the program, the system and
// the results rather than only about Bernard; book and planner reviews are excluded
// because they are not proof of the coaching. Text is verbatim, trimmed only.
const REVIEWS = [
  { name: 'Cameron Russell', initials: 'CR', color: '#4285F4', text: "Tripled my revenue since March. Filled my sales pipeline for the next 12 months. Went from a 1 man army to a 5-person business. Home by 4pm to play with my daughter, and I've got my weekends back. Three months of working smarter, not harder." },
  { name: 'Dean Stuart', initials: 'DS', color: '#EA4335', text: "He's put us back on the fast track to growth and reignited the excitement we had when we first started. We were doing more than OK before — now we're on steroids. If you're a business owner ready to stop coasting and start accelerating, Premier Business Academy is the catalyst you didn't know you needed." },
  { name: 'Monika Warszawska', initials: 'MW', color: '#34A853', text: "We have only been part of the programme for a week, yet we are already seeing positive results in both sales approach and business. Daily coaching sessions that are practical, engaging and focused on helping us continually improve our sales skills, mindset and confidence." },
  { name: 'Samantha Mauricette', initials: 'SM', color: '#FBBC05', text: "I've only had 2 sessions with PBA so far and feel compelled to write a review right away. I've been struggling to be consistent with daily sales routines and I have seen a difference in the very first week. 100% recommended to any growing sales spaces." },
  { name: 'Monica Churstain', initials: 'MC', color: '#4285F4', text: "With PBA we are building a strong team who are part of the decision making and are now feeling empowered to do more for the business. Bernard is straight talking and to the point; compressing the learning and cutting the BS so we can all achieve our team goals faster." },
  { name: 'Joshua Prestidge', initials: 'JP', color: '#EA4335', text: "Joining Premier Business Academy was one of the best things we have done in years. We needed more structure and discipline and to make tiny daily improvements. The business gym is where you can get instant support, normally followed up by a specific training video. The leadership and relentless follow up to keep us accountable is world-class." },
  { name: 'Matthew Gulley', initials: 'MG', color: '#34A853', text: "The main thing for me was the accountability and building a habit of continuous learning. Getting 1% better every day was super powerful and made the difference in order to grow and scale our business fast. If you're looking for accountability, PBA's the way." },
  { name: 'James Brownlee', initials: 'JB', color: '#FBBC05', text: "PBA is the real deal. If you are wanting to take things to the next level and get around a community of people who are passionate about moving the needle then this is for you. From my first contact I got fast action with no BS. Wish I was a part of this years ago." },
  { name: 'Leigh Mckenzie', initials: 'LM', color: '#4285F4', text: "His ability to connect with sales teams of all experience levels, instill accountability and make the consistent practice of the core fundamentals and key sales processes engaging and fun massively sets him apart. Other sales training programmes do not come close." },
  { name: 'Leon Willy', initials: 'LW', color: '#EA4335', text: "Bernard is a brilliant presenter — he makes business strategies easy to use and they work in everyday life too. Since applying his ideas, we've smashed our sales KPIs, boosting results by over 30% and climbing." },
  { name: 'Yolandie Piso', initials: 'YP', color: '#34A853', text: "Bernard and the team have been fantastic at assisting me with my growing business by offering a platform where I can constantly learn, grow and be held accountable to reach my goals. If you are after a no frills get down to business with great ROI on investment, this is for you." },
  { name: 'Patrick Whiteman', initials: 'PW', color: '#FBBC05', text: "We have had great help from Bernard at PBA shifting mindset and getting stuff done that we would have in all reality just never happened. Nothing ventured, nothing gained is how we initially looked at it, but the value we received was amazing." },
  { name: 'Maria Taylor', initials: 'MT', color: '#4285F4', text: "My business had been struggling and I was feeling overwhelmed. Bernard not only listened to my challenges but actively worked alongside me to develop actionable solutions that made an immediate impact. I am now more focused and empowered, and my business is on a clear path toward growth." },
  { name: 'Your Local Tyre Centre', initials: 'YL', color: '#EA4335', text: "He has been a game changer for our business with his business coaching brain and mindset. No fluff, no BS, just the things we need to hear. He has given us multiple strategies for our roadblocks. I can definitely see ROI in a short space of time." },
  { name: 'Kathryn Evans', initials: 'KE', color: '#34A853', text: "His coaching ability, natural leadership and business development skills have been exceptional. I appreciate the no B/S conversations and commitment to helping individuals not only succeed but excel in what they do. Bring your pen and prepare to be drilled in a good way." },
  { name: 'Hilton Calder', initials: 'HC', color: '#FBBC05', text: "He has transformed my mindset and momentum. His strategies are next-level, his support is constant, and his approach is sharp, practical and powerful. He has helped me go from zero to hero in 4 days. If you're on the fence — don't be." },
  { name: 'Bernard Kingon', initials: 'BK', color: '#4285F4', text: "Premier Business Academy has been an excellent experience. Next-level energy — motivational, straight-talking, and always pushing you to rise above 'just okay'. If you want a boost of clarity, confidence and momentum, this is the place." },
  { name: 'Abe Godsell-Slade', initials: 'AG', color: '#EA4335', text: "30 minutes with Bernard and the team at PBA will change your business. I left with a wealth of insights and simple, key actionable steps that we could go away and implement that same day. The result? Better culture, better people, better business." },
  { name: 'Peter Fry Landscapes', initials: 'PF', color: '#34A853', text: "His programs are not only taught and learnt but bring real life understanding to give business owners confidence and the tools for improving any business of any size. He genuinely cares and has a good understanding of human nature and human value." },
  { name: 'Trent Koehn', initials: 'TK', color: '#FBBC05', text: "Bernard and his team are the best. In just a few minutes I received the answers I had been searching for for months. Truly a world class team." },
]

function TestimonialVideo({ id, name, stat }: { id: string; name: string; stat: string }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="vc">
      <button className="vw" type="button" onClick={() => setPlaying(true)} aria-label={`Play ${name} testimonial`}>
        {playing
          ? <iframe src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`} title={`${name} testimonial`} allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowFullScreen />
          : <>
              {/* Not every upload has a maxres thumbnail (mwVXz5kA3FM does not). YouTube
                  answers those with a 120x90 grey placeholder at HTTP 200, so onError
                  never fires — the tile just renders blank. Detect the placeholder by
                  its width on load and fall back to hqdefault, which always exists. */}
              <img
                src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`}
                alt={`${name} testimonial`}
                loading="lazy"
                onLoad={e => {
                  const img = e.currentTarget
                  if (img.dataset.fallback || img.naturalWidth >= 200) return
                  img.dataset.fallback = '1'
                  img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`
                }}
                onError={e => {
                  const img = e.currentTarget
                  if (img.dataset.fallback) return
                  img.dataset.fallback = '1'
                  img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`
                }}
              />
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
      // iframe-resizer intermittently reports 0 before the widget paints. Applying
      // that collapses the iframe and leaves the white `.cal-card` min-height box
      // with no calendar in it, so ignore anything below a sane widget height.
      if (info?.height && info.height >= 200 && iframe) iframe.style.height = `${info.height}px`
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
      //
      // GHL emits two different shapes and we must accept both:
      //   ["highlevel.setHeight",{"height":560,"id":"msgsndr-calendar"}]
      //   [iFrameSizer]<slug>:<height>:<width>:<trigger>
      // The old matcher only looked for `set-iframe-height`, which this widget
      // never sends, so the iframe stayed collapsed and the calendar rendered as
      // an empty white box.
      if (/set[-_ ]?iframe[-_ ]?height|set[-_ ]?height|iframe[-_ ]?(loaded|ready)|iFrameSizer/i.test(raw)) {
        const json = raw.match(/"height"\s*:\s*(\d+)/i)
        const sizer = raw.match(/\[iFrameSizer\][^:]*:(\d+):/i)
        const h = parseInt((json?.[1] ?? sizer?.[1]) || '0', 10)
        if (h >= 200 && iframeRef.current) iframeRef.current.style.height = `${h}px`
      }

      if (window.__pbaScheduleFired) return

      // Broad detection. GHL's booking widget appears to fire one of several event
      // shapes when an appointment is created, different account configs / widget
      // versions emit different keys, so we match any of the common signatures
      // *except* clearly non-booking lifecycle events like load / init / sticky-fill.
      const isInitNoise = /set-sticky-contacts|fetch-(query-params|sticky-contacts)|iframeLoaded|iframe-ready|set-iframe-height|set[-_ ]?height|iFrameSizer|scrollTo|inPageLink/i.test(raw)
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
  const calendarSrc = `https://link.premierbusinessacademy.co.nz/widget/bookings/growth-assessment-session${qs ? `?${qs}` : ''}`

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
        .ty-email{font-size:15px;margin-bottom:14px;font-weight:500;letter-spacing:.01em}
        .ty-cta-line{font-size:clamp(16px,1.9vw,19px);font-weight:700;line-height:1.35;letter-spacing:-.01em;color:#fff;max-width:560px;margin:0 auto}
        /* VSL above the calendar — identical treatment to the post-booking page */
        .vsl{max-width:720px;margin:0 auto 18px}
        .vsl-frame{position:relative;padding-bottom:56.25%;border-radius:18px;overflow:hidden;border:1px solid var(--bdr);background:var(--card)}
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
          .ty-email{font-size:14px;margin-bottom:10px}
          .ty-cta-line{font-size:16px;line-height:1.35;padding:0 2px}
          .vsl{margin-bottom:14px}
          .cal-card{margin-top:12px}
          .vg,.review-grid{grid-template-columns:1fr}
        }
      `}</style>

      <div className="orb" style={{width:500,height:500,background:'radial-gradient(circle,rgba(139,83,236,.18),transparent 70%)',top:-100,right:-150}} />
      <div className="orb" style={{width:400,height:400,background:'radial-gradient(circle,rgba(35,175,254,.14),transparent 70%)',bottom:-100,left:-100}} />

      <div className="mx ty-page" style={{position:'relative',zIndex:1,textAlign:'center'}}>
        <div className="vsl">
          <div className="vsl-frame">
            <VSLPlayer src={VSL_SRC} poster={VSL_POSTER} />
          </div>
        </div>

        <p className="ty-email">
          We’ve emailed your Profit Roadmap{email ? <> to <strong style={{color:'rgba(255,255,255,.85)'}}>{email}</strong></> : ''}. It should arrive within 60 seconds.
        </p>
        <p className="P ty-cta-line">
          Book your free <span className="G">Growth Assessment Session</span> below.
        </p>

        <div className="cal-card">
          <div className="cal-clip">
            <iframe
              ref={iframeRef}
              src={calendarSrc}
              id="growth-assessment-session"
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
            <span className="review-meta"><strong style={{ color: '#fff' }}>5.0</strong> · 146 Google reviews</span>
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
