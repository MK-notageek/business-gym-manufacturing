import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sourceDir = join(root, 'roadmap-src', 'content-source')
const generatedDir = join(root, 'roadmap-src', 'generated')
const outputDir = join(root, 'public', 'roadmaps')
const logoPath = join(root, 'public', 'images', 'pba-logo-full.webp')
const logoData = `data:image/webp;base64,${readFileSync(logoPath).toString('base64')}`

const roadmaps = [
  {
    file: 'profit-roadmap-under-1m.pdf',
    eyebrow: 'Stage 1 · Under $1M',
    title: 'Stuck on the Tools',
    summary: "You are the factory. This is your plan to get the business off your back without everything falling apart.",
    next: '$1M–$2M',
  },
  {
    file: 'profit-roadmap-1m-2m.pdf',
    eyebrow: 'Stage 2 · $1M–$2M',
    title: 'Getting Off the Floor',
    summary: "The team is stepping up. Now make the systems stick so the factory runs whether you are there or not.",
    next: '$2M–$5M',
  },
  {
    file: 'profit-roadmap-2m-5m.pdf',
    eyebrow: 'Stage 3 · $2M–$5M',
    title: 'Running It, Not In It',
    summary: "The business runs without you most days. Now turn what you built into something genuinely valuable.",
    next: '$5M–$10M',
  },
  {
    file: 'profit-roadmap-5m-10m.pdf',
    eyebrow: 'Stage 4 · $5M–$10M',
    title: 'Scaling the Machine',
    summary: "Leaders lead and sales runs. Now scale without losing the systems and culture that made the factory work.",
    next: '$10M+',
  },
  {
    file: 'profit-roadmap-10m-plus.pdf',
    eyebrow: 'Stage 5 · $10M+',
    title: 'Building What Outlasts You',
    summary: "You built something rare. Now protect its value and decide deliberately what it should become after you.",
    next: 'Legacy',
  },
]

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function tightenSpacedCaps(value) {
  return value.replace(/(?:\b[A-Z0-9]\s+){2,}\b[A-Z0-9]\b/g, match => match.replace(/\s+/g, ''))
}

function extractPage(source, pageNumber) {
  let text = execFileSync('pdftotext', ['-f', String(pageNumber), '-l', String(pageNumber), '-layout', source, '-'], { encoding: 'utf8' })
  text = text
    .replace(/^The NZ Manufacturer's Profit Roadmap\s+\d{2}\s*/m, '')
    .replace(/Confidential - The Business Gym\s+premierbusinessacademy\.co\.nz/g, '')
    .replace(/\f/g, '')
  return text
    .split(/\n\s*\n/)
    .map(block => tightenSpacedCaps(block.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim()))
    .filter(Boolean)
}

function blockClass(text, index) {
  if (index === 0) return 'page-kicker'
  if (index === 1) return 'page-title'
  if (/^(The Fix|Do This|Do this|WEEK|MONTH|QUARTER)/i.test(text)) return 'fix-card'
  if (/^(Bernard's note|WHAT THIS FEELS LIKE|12 MONTHS FROM NOW|THE STANDARD|THE SHIFT)/i.test(text)) return 'note-card'
  if (/^\d+[\).]|^\$|^Top \d|^\d+%|^\d+–\d+|^#\d/.test(text)) return 'metric-card'
  if (/^["“]/.test(text)) return 'quote-card'
  if (/WHY BERNARD|WHAT OWNERS SAY|YOUR NEXT STEP|YOUR 90-DAY PLAN|HOW YOU GRADUATE/i.test(text)) return 'section-label'
  return 'body-copy'
}

function renderContentPage(blocks, pageNumber, totalPages, dense) {
  let prepared = [...blocks]
  if (pageNumber === 12) {
    prepared = [
      'WHY BERNARD / PBA',
      "You've Read the Roadmap. Now Don't Do It Alone.",
      "Reading a roadmap is easy. Actually changing a factory is not. The owners who break through rarely do it alone: they borrow someone else's 30 years of pattern recognition, their own honest mirror, and their refusal to slip back into the comfort of being busy.",
      'Bernard Powell built Premier Group NZ from scratch into a 200 tonne-per-day manufacturer, #1 NZ Best Workplace and AME Global Lean recognised. He lived every stage of your journey before coaching a single person.',
      '500+ owners coached · 200 tonnes/day factory · #1 NZ Best Workplace · AME Global Lean · 141 five-star reviews',
      'What actually changes when you work with Bernard',
      '1. You stop guessing your numbers. The first session maps true cost per unit and your biggest profit leak. Fixing under-pricing alone often pays for the engagement.',
      '2. You build the leverage you have been missing: systems, SOPs and delegated ownership. The boring work most coaches skip is what turns a factory from a trap into a business.',
      "3. You get someone who has made the mistakes. Bernard has seen the ways NZ manufacturers break and the patterns that get them past $5M+.",
      "4. You do not get a generic playbook. Every session is grounded in your factory, your staff, your market and what you are dealing with this week.",
      'Best fit: owners who want blunt feedback and fast implementation—not vague encouragement while keeping the same bottlenecks.',
    ]
  }
  if (pageNumber === 13) {
    prepared = [
      'WHAT OWNERS SAY',
      'Real NZ Owners. Real Results.',
      '"Bernard is all go. Full of insights and immediate action. We have been blown away by just how quickly PBA implements and starts bringing positive change." — Adrian Day · NZ Manufacturer',
      '"We have had great help from Bernard at PBA shifting mindset and getting stuff done that would otherwise never have happened." — Patrick Whiteman · NZ Business Owner',
      '"Joining Premier Business Academy was one of the best things we have done in years. We joined because we wanted to improve the life our business gives us." — Joshua Prestidge · NZ Business Owner',
      '"Bernard is the real deal business coach. Genuine, inspiring and full of energy and ideas. I am seeing a real upward trend in my sales results." — Tim Farland · NZ Business Owner',
      'YOUR NEXT STEP',
      'Stop guessing. Get a Growth Assessment Session. In 45 minutes, a top PBA advisor will help identify where your factory is, what is holding it back and the single most important thing to fix first.',
      'Book Your Free Growth Assessment',
      '500+ NZ manufacturers coached · 141 five-star reviews · Free, no obligation',
    ]
  }

  const body = prepared.map((block, index) => {
    const className = blockClass(block, index)
    const updated = block
      .replace(/\b125\b/g, '141')
      .replace(/Book Your Free Straight Talk Session/g, 'Book Your Free Growth Assessment')
      .replace(/Straight Talk Session/g, 'Growth Assessment Session')
    const formatted = escapeHtml(updated)
      .replace(/(^|\s)(\d+)\.\s/g, '$1<br><b>$2.</b> ')
      .replace(/\s+- Bernard Powell$/, '<br><span class="attribution">— Bernard Powell</span>')
      .replace(/Book Your Free Growth Assessment/g, '<a class="inline-link" href="https://book.premierbusinessacademy.co.nz/">Book Your Free Growth Assessment →</a>')
    return `<div class="${className}">${formatted}</div>`
  }).join('')

  return `<section class="page content-page ${dense ? 'dense' : ''}">
    <div class="ambient a${pageNumber % 3}"></div>
    <header><img src="${logoData}" alt="Premier Business Academy"><span>The Manufacturer's Profit Roadmap</span><b>${String(pageNumber).padStart(2, '0')}</b></header>
    <main>${body}</main>
    <footer><span>Premier Business Academy · Hamilton, NZ</span><span>Confidential</span></footer>
  </section>`
}

function renderHtml(meta, source) {
  const pages = []
  for (let page = 2; page <= 13; page += 1) pages.push(extractPage(source, page))

  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
@page{size:A4;margin:0}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
:root{--p:#8b53ec;--b:#23affe;--g:linear-gradient(135deg,#8b53ec,#23affe);--ink:#151326;--ink2:#4d4962;--mut:#858198;--line:#e8e4f2;--soft:#f6f4fb;--dark:#0a0a14}
html,body{margin:0;font-family:Arial,sans-serif;color:var(--ink)}.page{width:210mm;height:297mm;position:relative;overflow:hidden;page-break-after:always}.page:last-child{page-break-after:auto}
.cover{background:radial-gradient(95% 60% at 76% 17%,#2a2054 0%,#101020 48%,#080811 100%);color:#fff;padding:22mm;display:flex;flex-direction:column}.cover:before{content:"";position:absolute;width:105mm;height:105mm;border-radius:50%;background:radial-gradient(circle,rgba(35,175,254,.22),transparent 68%);left:-35mm;bottom:13mm}.cover>*{position:relative}.cover-logo{width:42mm;height:auto}.cover-mid{margin:auto 0}.eyebrow{font-size:10pt;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#ad92ff;margin-bottom:10mm}.eyebrow:before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--g);margin-right:9px}.cover h1{font-size:48pt;line-height:.94;letter-spacing:-.045em;margin:0;max-width:155mm}.cover h1 span{display:block;background:linear-gradient(135deg,#fff 15%,#a88af7 58%,#2aaeff);-webkit-background-clip:text;color:transparent}.rule{width:48mm;height:2px;background:var(--g);margin:9mm 0}.cover-summary{font-size:14pt;line-height:1.5;color:rgba(255,255,255,.7);max-width:145mm}.cover-foot{display:flex;justify-content:space-between;align-items:flex-end;font-size:10pt;color:rgba(255,255,255,.55)}.cover-foot b{color:#fff}.badge{width:28mm;height:28mm;border-radius:50%;background:var(--g);display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 8mm 18mm rgba(139,83,236,.35)}.badge b{font-size:24pt;line-height:1}.badge span{font-size:7pt;font-weight:800;letter-spacing:.16em}
.content-page{background:#fff;padding:17mm 20mm 15mm;display:flex;flex-direction:column}.ambient{position:absolute;border-radius:50%;filter:blur(25mm);opacity:.12;pointer-events:none}.ambient.a0{width:80mm;height:80mm;background:#8b53ec;right:-30mm;top:-30mm}.ambient.a1{width:70mm;height:70mm;background:#23affe;left:-28mm;bottom:-22mm}.ambient.a2{width:70mm;height:70mm;background:#8b53ec;right:-25mm;bottom:-18mm}
header{height:13mm;display:flex;align-items:center;gap:5mm;border-bottom:1px solid var(--line);position:relative}header img{width:31mm;filter:brightness(0);opacity:.9}header span{font-size:8pt;font-weight:700;color:var(--mut);letter-spacing:.04em}header b{margin-left:auto;font-size:9pt;color:var(--p)}
main{position:relative;padding-top:9mm;flex:1;display:flex;flex-direction:column;gap:3.4mm}.page-kicker,.section-label{font-size:8pt;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--p)}.page-title{font-size:27pt;font-weight:800;line-height:1.05;letter-spacing:-.035em;max-width:165mm;margin-bottom:1mm}.body-copy{font-size:10.2pt;line-height:1.5;color:var(--ink2)}.metric-card{background:linear-gradient(135deg,#17142b,#0d0b18);color:#fff;border-radius:5mm;padding:5mm 6mm;font-size:11pt;line-height:1.45;box-shadow:0 3mm 10mm rgba(20,14,45,.12)}.metric-card b{color:#bba7ff}.fix-card{background:var(--soft);border:1px solid var(--line);border-left:3px solid var(--p);border-radius:4mm;padding:4.5mm 5.5mm;font-size:9.7pt;line-height:1.48;color:var(--ink2)}.note-card{background:linear-gradient(135deg,rgba(139,83,236,.08),rgba(35,175,254,.06));border-radius:4mm;padding:4mm 5mm;font-size:9.4pt;line-height:1.45;color:var(--ink2)}.quote-card{font-size:11pt;line-height:1.45;font-weight:600;font-style:italic;color:#29243c;border-left:2px solid #23affe;padding-left:5mm}.attribution{display:inline-block;margin-top:2mm;font-size:8.5pt;color:var(--mut);font-style:normal}.growth-cta,.inline-link{display:inline-block;background:var(--g);color:#fff;text-decoration:none;font-size:10.5pt;font-weight:800;border-radius:99px;padding:4mm 7mm}.growth-cta{margin-top:auto;align-self:flex-start}.growth-cta span{margin-left:3mm}.inline-link{margin:3mm 0}.dense main{gap:2.2mm}.dense .body-copy{font-size:8.7pt;line-height:1.36}.dense .fix-card,.dense .note-card{font-size:8.4pt;line-height:1.35}.dense .page-title{font-size:22pt}.dense .metric-card{font-size:9pt;padding:3.5mm 4.5mm}.dense .quote-card{font-size:9.2pt}
footer{display:flex;justify-content:space-between;border-top:1px solid var(--line);padding-top:3mm;font-size:7.5pt;color:var(--mut);position:relative}
</style></head><body>
<section class="page cover">
  <img class="cover-logo" src="${logoData}" alt="Premier Business Academy">
  <div class="cover-mid"><div class="eyebrow">Personalised roadmap · ${escapeHtml(meta.eyebrow)}</div><h1>The Manufacturer's <span>PROFIT ROADMAP</span></h1><div class="rule"></div><p class="cover-summary">${escapeHtml(meta.summary)}</p></div>
  <div class="cover-foot"><div>By <b>Bernard Powell</b><br>Premier Business Academy · Hamilton, NZ</div><div class="badge"><b>7</b><span>AREAS</span></div></div>
</section>
${pages.map((blocks, index) => renderContentPage(blocks, index + 2, 13, blocks.join(' ').length > 1700 || index + 2 >= 12)).join('')}
</body></html>`
}

mkdirSync(generatedDir, { recursive: true })
mkdirSync(outputDir, { recursive: true })

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
for (const roadmap of roadmaps) {
  const source = join(sourceDir, roadmap.file)
  const htmlPath = join(generatedDir, roadmap.file.replace(/\.pdf$/, '.html'))
  const output = join(outputDir, roadmap.file)
  writeFileSync(htmlPath, renderHtml(roadmap, source))
  rmSync(output, { force: true })

  const chromeProfile = join(generatedDir, `.chrome-${roadmap.file.replace(/\.pdf$/, '')}`)
  rmSync(chromeProfile, { recursive: true, force: true })
  try {
    execFileSync(chrome, [
      '--headless=new',
      '--disable-gpu',
      '--disable-background-mode',
      '--disable-background-networking',
      '--disable-component-update',
      '--disable-extensions',
      '--disable-sync',
      '--no-first-run',
      '--no-default-browser-check',
      '--no-pdf-header-footer',
      '--run-all-compositor-stages-before-draw',
      `--user-data-dir=${chromeProfile}`,
      `--print-to-pdf=${output}`,
      `file://${htmlPath}`,
    ], { stdio: 'ignore', timeout: 20_000 })
  } catch (error) {
    // Some macOS Chrome builds keep the headless process alive after the PDF is
    // fully written. The timeout terminates that idle process; the file itself
    // is accepted only when it exists and has meaningful content.
    if (!existsSync(output) || statSync(output).size < 100_000) throw error
  }
  rmSync(chromeProfile, { recursive: true, force: true })
  console.log(`Rendered ${basename(output)}`)
}
