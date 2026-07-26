#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const workspace = process.env.ADVLAUNCH_ASSISTANT_ROOT
  || '/Users/ayaanarifaziz/Desktop/AdvLaunch Assistant'
const factoryRepo = process.env.FACTORY_ROADMAP_REPO
  || '/Users/ayaanarifaziz/Projects/business-gym-manufacturing'
const tradeRepo = process.env.TRADE_ROADMAP_REPO
  || path.join(workspace, 'external/bernard/live-projects/trades-roadmap/code/pba-profit-roadmap-gh')

const W = 1080
const H = 1350
const purple = '#8b53ec'
const blue = '#23affe'
const ink = '#0a0a14'
const white = '#ffffff'
const muted = '#667085'

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function mimeFor(file) {
  const ext = path.extname(file).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.svg') return 'image/svg+xml'
  return 'image/jpeg'
}

function dataUri(file) {
  return `data:${mimeFor(file)};base64,${fs.readFileSync(file).toString('base64')}`
}

function lines({
  values,
  x,
  y,
  size,
  lineHeight = 1.15,
  fill = ink,
  weight = 700,
  family = 'Arial',
  anchor = 'start',
  letterSpacing = 0,
  italic = false,
}) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${letterSpacing}"${italic ? ' font-style="italic"' : ''}>${
    values.map((value, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : size * lineHeight}">${esc(value)}</tspan>`).join('')
  }</text>`
}

function image(href, x, y, width, height, extra = '') {
  return `<image href="${href}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" ${extra}/>`
}

function base(content, defs = '') {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="brandGradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${purple}"/>
      <stop offset="100%" stop-color="${blue}"/>
    </linearGradient>
    <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="20" stdDeviation="24" flood-color="#000000" flood-opacity=".32"/>
    </filter>
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#000000" flood-opacity=".18"/>
    </filter>
    ${defs}
  </defs>
  ${content}
</svg>`
}

function brandFooter(label, dark = false) {
  const bg = dark ? 'rgba(10,10,20,.92)' : '#ffffff'
  const fg = dark ? white : ink
  return `
    <rect x="0" y="1250" width="1080" height="100" fill="${bg}"/>
    <circle cx="76" cy="1300" r="21" fill="url(#brandGradient)"/>
    <text x="76" y="1308" fill="#fff" font-family="Arial Black" font-size="24" text-anchor="middle">P</text>
    <text x="114" y="1294" fill="${fg}" font-family="Arial" font-size="18" font-weight="700">PREMIER BUSINESS ACADEMY</text>
    <text x="114" y="1321" fill="${dark ? '#cbd5e1' : muted}" font-family="Arial" font-size="16">${esc(label)}</text>
  `
}

function ctaPill(text, x, y, width) {
  return `
    <rect x="${x}" y="${y}" width="${width}" height="68" rx="34" fill="url(#brandGradient)"/>
    <text x="${x + width / 2}" y="${y + 44}" fill="#fff" font-family="Arial" font-size="22" font-weight="700" text-anchor="middle">${esc(text)}</text>
  `
}

function fakeTweet({ avatar, audience, post, payoff, footer }) {
  const avatarUri = dataUri(avatar)
  const defs = '<clipPath id="avatarClip"><circle cx="128" cy="177" r="54"/></clipPath>'
  return base(`
    <rect width="${W}" height="${H}" fill="#f4f7fb"/>
    <rect x="70" y="90" width="940" height="1090" rx="34" fill="#fff" filter="url(#softShadow)"/>
    <circle cx="128" cy="177" r="58" fill="#e5e7eb"/>
    ${image(avatarUri, 74, 123, 108, 108, 'clip-path="url(#avatarClip)"')}
    <text x="212" y="163" fill="${ink}" font-family="Arial" font-size="29" font-weight="700">Bernard Powell</text>
    <text x="212" y="200" fill="${muted}" font-family="Arial" font-size="22">@premierbusinessacademy · 2h</text>
    <circle cx="927" cy="164" r="5" fill="${muted}"/><circle cx="947" cy="164" r="5" fill="${muted}"/><circle cx="967" cy="164" r="5" fill="${muted}"/>
    <text x="112" y="294" fill="${purple}" font-family="Arial" font-size="24" font-weight="700">${esc(audience)}</text>
    ${lines({ values: post, x: 112, y: 370, size: 47, lineHeight: 1.22, fill: ink, weight: 700 })}
    <line x1="112" y1="865" x2="968" y2="865" stroke="#e5e7eb" stroke-width="2"/>
    ${lines({ values: payoff, x: 112, y: 930, size: 27, lineHeight: 1.35, fill: '#344054', weight: 400 })}
    <text x="112" y="1101" fill="${muted}" font-family="Arial" font-size="21">9:41 AM · Jul 27, 2026</text>
    <text x="836" y="1101" fill="${muted}" font-family="Arial" font-size="27">♡   ↻   ⤴</text>
    ${brandFooter(footer)}
  `, defs)
}

function gridDump({ generated, photos, headline, subhead, footer }) {
  let backdrop = ''
  if (generated) {
    backdrop = image(dataUri(generated), 0, 0, W, 1250)
  } else {
    const uris = photos.map(dataUri)
    backdrop = `
      ${image(uris[0], 0, 0, 538, 620)}
      ${image(uris[1], 542, 0, 538, 620)}
      ${image(uris[2], 0, 624, 538, 626)}
      ${image(uris[3], 542, 624, 538, 626)}
    `
  }
  return base(`
    <rect width="${W}" height="${H}" fill="${ink}"/>
    ${backdrop}
    <rect x="86" y="500" width="908" height="250" rx="28" fill="rgba(255,255,255,.94)" filter="url(#softShadow)"/>
    ${lines({ values: headline, x: 540, y: 580, size: 42, lineHeight: 1.13, fill: ink, weight: 800, anchor: 'middle' })}
    <text x="540" y="708" fill="${purple}" font-family="Arial" font-size="24" font-weight="700" text-anchor="middle">${esc(subhead)}</text>
    ${brandFooter(footer, true)}
  `)
}

function apology({ headline, body, offer, footer }) {
  return base(`
    <rect width="${W}" height="${H}" fill="#f7f2e8"/>
    <rect x="0" y="0" width="20" height="1250" fill="url(#brandGradient)"/>
    <text x="78" y="120" fill="${purple}" font-family="Arial" font-size="21" font-weight="700" letter-spacing="3">A NOTE FROM PBA</text>
    ${lines({ values: headline, x: 78, y: 300, size: 108, lineHeight: .9, fill: ink, weight: 900, family: 'Arial Black' })}
    <line x1="78" y1="535" x2="430" y2="535" stroke="${blue}" stroke-width="14" stroke-linecap="round"/>
    ${lines({ values: body, x: 78, y: 650, size: 34, lineHeight: 1.35, fill: '#344054', weight: 400 })}
    <rect x="78" y="985" width="924" height="175" rx="24" fill="#fff" stroke="#e5e7eb" stroke-width="2"/>
    <text x="120" y="1048" fill="${muted}" font-family="Arial" font-size="20" font-weight="700" letter-spacing="2">OUR CONFESSION</text>
    ${lines({ values: offer, x: 120, y: 1102, size: 28, lineHeight: 1.2, fill: ink, weight: 700 })}
    ${brandFooter(footer)}
  `)
}

function forwardedEmail({ subject, body, cta, footer }) {
  return base(`
    <rect width="${W}" height="${H}" fill="#f3f4f6"/>
    <rect x="54" y="64" width="972" height="1116" rx="26" fill="#fff" filter="url(#softShadow)"/>
    <rect x="54" y="64" width="972" height="92" rx="26" fill="#fbfbfc"/>
    <circle cx="99" cy="110" r="10" fill="#ff5f57"/><circle cx="132" cy="110" r="10" fill="#ffbd2e"/><circle cx="165" cy="110" r="10" fill="#28c840"/>
    <text x="540" y="119" fill="${muted}" font-family="Arial" font-size="19" text-anchor="middle">Inbox</text>
    <text x="100" y="235" fill="${ink}" font-family="Arial" font-size="38" font-weight="700">${esc(subject)}</text>
    <circle cx="135" cy="323" r="40" fill="url(#brandGradient)"/>
    <text x="135" y="334" fill="#fff" font-family="Arial Black" font-size="30" text-anchor="middle">B</text>
    <text x="198" y="312" fill="${ink}" font-family="Arial" font-size="24" font-weight="700">Bernard Powell — PBA</text>
    <text x="198" y="347" fill="${muted}" font-family="Arial" font-size="19">to New Zealand business owners</text>
    <text x="935" y="312" fill="${muted}" font-family="Arial" font-size="18" text-anchor="end">9:14 AM</text>
    <line x1="100" y1="400" x2="980" y2="400" stroke="#e5e7eb" stroke-width="2"/>
    ${lines({ values: body, x: 100, y: 480, size: 31, lineHeight: 1.42, fill: '#1f2937', weight: 400 })}
    <text x="100" y="1025" fill="${ink}" font-family="Arial" font-size="27" font-weight="700">Bernard</text>
    <text x="100" y="1062" fill="${muted}" font-family="Arial" font-size="20">Life rewards action.</text>
    ${ctaPill(cta, 100, 1095, 430)}
    ${brandFooter(footer)}
  `)
}

function wouldYouRather({ kicker, leftTitle, leftSub, rightTitle, rightSub, cta, footer }) {
  return base(`
    <rect width="${W}" height="${H}" fill="#fff"/>
    <text x="540" y="110" fill="${purple}" font-family="Arial" font-size="22" font-weight="700" text-anchor="middle" letter-spacing="3">${esc(kicker)}</text>
    <text x="540" y="205" fill="${ink}" font-family="Arial Black" font-size="64" text-anchor="middle">WOULD YOU RATHER?</text>
    <rect x="58" y="286" width="454" height="720" rx="30" fill="#f4f5f7" stroke="#e4e7ec" stroke-width="3"/>
    <rect x="568" y="286" width="454" height="720" rx="30" fill="url(#brandGradient)"/>
    <circle cx="285" cy="402" r="58" fill="#d0d5dd"/>
    <text x="285" y="423" fill="#475467" font-family="Arial Black" font-size="56" text-anchor="middle">A</text>
    <circle cx="795" cy="402" r="58" fill="rgba(255,255,255,.22)"/>
    <text x="795" y="423" fill="#fff" font-family="Arial Black" font-size="56" text-anchor="middle">B</text>
    ${lines({ values: leftTitle, x: 285, y: 550, size: 47, lineHeight: 1.05, fill: ink, weight: 900, family: 'Arial Black', anchor: 'middle' })}
    ${lines({ values: leftSub, x: 285, y: 760, size: 26, lineHeight: 1.3, fill: '#475467', weight: 400, anchor: 'middle' })}
    ${lines({ values: rightTitle, x: 795, y: 550, size: 47, lineHeight: 1.05, fill: white, weight: 900, family: 'Arial Black', anchor: 'middle' })}
    ${lines({ values: rightSub, x: 795, y: 760, size: 26, lineHeight: 1.3, fill: '#eef2ff', weight: 400, anchor: 'middle' })}
    ${ctaPill(cta, 315, 1090, 450)}
    ${brandFooter(footer)}
  `)
}

function newsStunt({ photo, tag, headline, subhead, cta, footer, photoPosition = 'xMidYMid slice' }) {
  const photoUri = dataUri(photo)
  return base(`
    <rect width="${W}" height="${H}" fill="${ink}"/>
    <image href="${photoUri}" x="0" y="0" width="1080" height="820" preserveAspectRatio="${photoPosition}"/>
    <rect x="0" y="0" width="1080" height="94" fill="rgba(10,10,20,.9)"/>
    <text x="54" y="59" fill="#fff" font-family="Arial Black" font-size="31">PBA BUSINESS DESK</text>
    <rect x="814" y="22" width="212" height="50" rx="8" fill="#ef4444"/>
    <text x="920" y="56" fill="#fff" font-family="Arial Black" font-size="22" text-anchor="middle">${esc(tag)}</text>
    <rect x="0" y="760" width="1080" height="490" fill="rgba(10,10,20,.96)"/>
    <rect x="0" y="760" width="20" height="490" fill="url(#brandGradient)"/>
    ${lines({ values: headline, x: 58, y: 845, size: 55, lineHeight: 1.03, fill: white, weight: 900, family: 'Arial Black' })}
    ${lines({ values: subhead, x: 58, y: 1055, size: 25, lineHeight: 1.3, fill: '#d0d5dd', weight: 400 })}
    <text x="58" y="1195" fill="${blue}" font-family="Arial" font-size="22" font-weight="700">${esc(cta)}</text>
    ${brandFooter(footer, true)}
  `)
}

function pickCards({ title, subtitle, cards, cta, footer }) {
  const cardWidth = 286
  const cardHeight = 238
  const startX = 75
  const startY = 354
  const gapX = 36
  const gapY = 38
  const cardMarkup = cards.map((card, index) => {
    const col = index % 3
    const row = Math.floor(index / 3)
    const x = startX + col * (cardWidth + gapX)
    const y = startY + row * (cardHeight + gapY)
    const selected = index === 1
    return `
      <rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="24" fill="${selected ? 'url(#brandGradient)' : '#fff'}" stroke="${selected ? purple : '#e4e7ec'}" stroke-width="3" filter="url(#softShadow)"/>
      <circle cx="${x + 52}" cy="${y + 54}" r="28" fill="${selected ? 'rgba(255,255,255,.22)' : '#f2f4f7'}"/>
      <text x="${x + 52}" y="${y + 64}" fill="${selected ? '#fff' : purple}" font-family="Arial Black" font-size="27" text-anchor="middle">${esc(card.code)}</text>
      <text x="${x + 28}" y="${y + 142}" fill="${selected ? '#fff' : ink}" font-family="Arial" font-size="27" font-weight="700">${esc(card.label)}</text>
      <text x="${x + 28}" y="${y + 182}" fill="${selected ? '#eef2ff' : muted}" font-family="Arial" font-size="18">${esc(card.note || 'Tap to choose')}</text>
    `
  }).join('')
  return base(`
    <rect width="${W}" height="${H}" fill="#f8fafc"/>
    <text x="540" y="100" fill="${purple}" font-family="Arial" font-size="20" font-weight="700" text-anchor="middle" letter-spacing="3">PICK ONE</text>
    ${lines({ values: title, x: 540, y: 190, size: 57, lineHeight: 1, fill: ink, weight: 900, family: 'Arial Black', anchor: 'middle' })}
    <text x="540" y="295" fill="${muted}" font-family="Arial" font-size="24" text-anchor="middle">${esc(subtitle)}</text>
    ${cardMarkup}
    ${ctaPill(cta, 286, 1008, 508)}
    ${brandFooter(footer)}
  `)
}

function giantProduct({ background, cover, headline, subhead, footer }) {
  const bg = dataUri(background)
  const book = dataUri(cover)
  return base(`
    <rect width="${W}" height="${H}" fill="${ink}"/>
    ${image(bg, 0, 0, W, 1250)}
    <rect x="0" y="0" width="1080" height="1250" fill="rgba(10,10,20,.14)"/>
    <rect x="42" y="42" width="996" height="190" rx="26" fill="rgba(255,255,255,.94)" filter="url(#softShadow)"/>
    ${lines({ values: headline, x: 540, y: 112, size: 43, lineHeight: 1.02, fill: ink, weight: 900, family: 'Arial Black', anchor: 'middle' })}
    <g filter="url(#shadow)">
      <rect x="245" y="280" width="590" height="820" rx="18" fill="#111827"/>
      <image href="${book}" x="245" y="280" width="590" height="820" preserveAspectRatio="xMidYMid meet"/>
    </g>
    <rect x="184" y="1122" width="712" height="86" rx="43" fill="rgba(10,10,20,.9)"/>
    <text x="540" y="1178" fill="#fff" font-family="Arial" font-size="26" font-weight="700" text-anchor="middle">${esc(subhead)}</text>
    ${brandFooter(footer, true)}
  `)
}

function renderAd(repo, name, svg) {
  const folder = path.join(repo, 'creative', 'ads', name)
  fs.mkdirSync(folder, { recursive: true })
  const svgPath = path.join(folder, `${name}.svg`)
  const pngPath = path.join(folder, `${name}.png`)
  fs.writeFileSync(svgPath, svg.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n'))
  execFileSync('rsvg-convert', [
    '-w', String(W),
    '-h', String(H),
    '-o', pngPath,
    svgPath,
  ], { stdio: 'inherit' })
  return pngPath
}

const factoryImages = path.join(factoryRepo, 'public', 'images')
const tradeSource = path.join(tradeRepo, 'creative', 'platform-native-static-ads', 'source')
const factorySource = path.join(factoryRepo, 'creative', 'platform-native-static-ads', 'source')
const bernard = path.join(factoryImages, '1750066266064.webp')
const bernardWhiteboard = path.join(factoryImages, '1765583997480.webp')

const tradeAds = [
  ['trademap-img01-margin-proof', fakeTweet({
    avatar: bernard,
    audience: 'NZ TRADE BUSINESS OWNERS',
    post: [
      'You probably don’t need more leads.',
      'You need to find the margin leaks',
      'inside the jobs you’ve already won.',
    ],
    payoff: ['I mapped the 5 places to check.', 'Free. Takes 30 seconds.'],
    footer: 'Free Trade Profit Roadmap',
  })],
  ['trademap-img02-camera-roll', gridDump({
    generated: path.join(tradeSource, 'generated', 'trade-grid-dump.png'),
    headline: ['THE JOB WAS WON.', 'THE MARGIN STILL LEAKED.'],
    subhead: '5 places to check →',
    footer: 'Free Trade Profit Roadmap',
  })],
  ['trademap-img03-sorry-profit-leaks', apology({
    headline: ['WE’RE', 'SO SORRY.'],
    body: [
      'We made the five silent profit leaks',
      'inside NZ trade businesses painfully',
      'easy to find.',
    ],
    offer: ['Then we put every check in one free', '30-second Profit Roadmap. Go get it.'],
    footer: 'Free Trade Profit Roadmap',
  })],
  ['trademap-img04-forwarded-job-margin', forwardedEmail({
    subject: 'Fwd: the job you already won',
    body: [
      'Quick one —',
      '',
      'If the jobs are already there, more leads',
      'won’t fix a margin leak.',
      '',
      'The problem shows up after the quote.',
      'I mapped the 5 places to check.',
      '',
      'Free. Takes 30 seconds.',
    ],
    cta: 'GET THE TRADE MAP →',
    footer: 'Free Trade Profit Roadmap',
  })],
  ['trademap-img05-fix-or-sell-more', wouldYouRather({
    kicker: 'NZ TRADE BUSINESS OWNERS',
    leftTitle: ['CHASE', 'MORE JOBS'],
    leftSub: ['and keep losing', 'margin after the quote'],
    rightTitle: ['FIND THE', '5 LEAKS'],
    rightSub: ['inside jobs', 'you already won'],
    cta: 'GET THE FREE TRADE MAP',
    footer: 'Free Trade Profit Roadmap',
  })],
  ['trademap-img06-margin-news', newsStunt({
    photo: bernardWhiteboard,
    tag: 'MARGIN ALERT',
    headline: ['TRADE BUSINESSES', 'ARE BUSY.', 'PROFITS STILL VANISH.'],
    subhead: ['Bernard Powell breaks down the 5 silent', 'leaks hiding inside jobs already won.'],
    cta: 'FREE ROADMAP • TAKES 30 SECONDS',
    footer: 'PBA-owned editorial format — not third-party news',
    photoPosition: 'xMidYMid slice',
  })],
  ['trademap-img07-pick-your-trade', pickCards({
    title: ['WHICH CREW', 'ARE YOU RUNNING?'],
    subtitle: 'Your Profit Roadmap changes by trade.',
    cards: [
      { code: 'E', label: 'Electrician' },
      { code: 'P', label: 'Plumber' },
      { code: 'H', label: 'HVAC' },
      { code: 'B', label: 'Builder' },
      { code: 'R', label: 'Roofer' },
      { code: 'L', label: 'Landscaping' },
    ],
    cta: 'PICK YOUR TRADE →',
    footer: 'Free Trade Profit Roadmap',
  })],
  ['trademap-img08-giant-trade-map', giantProduct({
    background: path.join(tradeSource, 'generated', 'trade-giant-product-background.png'),
    cover: path.join(tradeSource, 'trade-roadmap-cover.png'),
    headline: ['THE BIGGEST PROFIT LEAK', 'ON THIS SITE ISN’T IN THE TOOLS.'],
    subhead: 'Find it in 30 seconds. Free.',
    footer: 'Free Trade Profit Roadmap',
  })],
]

const factoryAds = [
  ['factorymap-img01-revenue-profit-flat', fakeTweet({
    avatar: bernard,
    audience: 'NZ FACTORY OWNERS',
    post: [
      'If revenue is up but profit is flat,',
      'the factory is leaking somewhere.',
      'Fix the #1 leak before another shift.',
    ],
    payoff: ['I mapped the checks and the one fix', 'that recovers profit fastest. Free.'],
    footer: 'Free Manufacturers Profit Roadmap',
  })],
  ['factorymap-img02-factory-camera-roll', gridDump({
    photos: [
      path.join(factoryImages, '1750066266064.webp'),
      path.join(factoryImages, 'warehouse-visit.webp'),
      path.join(factoryImages, 'training-room.webp'),
      path.join(factoryImages, 'blue-jackets-group.webp'),
    ],
    headline: ['BUILT IN A FACTORY.', 'NOT READ IN A BOOK.'],
    subhead: 'The free roadmap for NZ manufacturers →',
    footer: 'Free Manufacturers Profit Roadmap',
  })],
  ['factorymap-img03-sorry-factory-leaks', apology({
    headline: ['WE’RE', 'SO SORRY.'],
    body: [
      'We turned the leaks keeping factory',
      'owners trapped on the floor into a',
      'free 30-second roadmap.',
    ],
    offer: ['The one fix that recovers profit fastest', 'is inside. Life rewards action.'],
    footer: 'Free Manufacturers Profit Roadmap',
  })],
  ['factorymap-img04-forwarded-profit-flat', forwardedEmail({
    subject: 'Fwd: revenue up, profit flat',
    body: [
      'Quick one —',
      '',
      'A busy factory can still be a leaking',
      'factory.',
      '',
      'Before you add another shift, find the',
      '#1 leak and the fix that recovers profit',
      'fastest.',
      '',
      'I mapped the checks. Takes 30 seconds.',
    ],
    cta: 'GET THE ROADMAP →',
    footer: 'Free Manufacturers Profit Roadmap',
  })],
  ['factorymap-img05-fix-leak-first', wouldYouRather({
    kicker: 'NZ FACTORY OWNERS',
    leftTitle: ['ADD', 'ANOTHER', 'SHIFT'],
    leftSub: ['to a factory', 'that still leaks profit'],
    rightTitle: ['FIX THE', '#1 LEAK', 'FIRST'],
    rightSub: ['then scale', 'what actually works'],
    cta: 'GET THE FREE ROADMAP',
    footer: 'Free Manufacturers Profit Roadmap',
  })],
  ['factorymap-img06-factory-prison-news', newsStunt({
    photo: path.join(factoryImages, 'warehouse-visit.webp'),
    tag: 'OWNER ALERT',
    headline: ['FACTORIES BUSIER.', 'OWNERS STILL', 'TRAPPED ON THE FLOOR.'],
    subhead: ['Find the leak before adding another shift.', 'One free roadmap. 30 seconds.'],
    cta: 'BUILT BY BERNARD POWELL — A FACTORY OWNER',
    footer: 'PBA-owned editorial format — not third-party news',
  })],
  ['factorymap-img07-pick-your-leak', pickCards({
    title: ['WHICH LEAK', 'LOOKS FAMILIAR?'],
    subtitle: 'Your answer tells you where to start.',
    cards: [
      { code: 'R', label: 'Rework' },
      { code: 'OT', label: 'Overtime' },
      { code: 'W', label: 'Too much WIP' },
      { code: 'D', label: 'Discounting' },
      { code: 'F', label: 'Firefighting' },
      { code: 'O', label: 'Owner bottleneck' },
    ],
    cta: 'FIND YOUR #1 LEAK →',
    footer: 'Free Manufacturers Profit Roadmap',
  })],
  ['factorymap-img08-giant-roadmap', giantProduct({
    background: path.join(factorySource, 'generated', 'factory-giant-product-background.png'),
    cover: path.join(factorySource, 'manufacturer-roadmap-cover.png'),
    headline: ['YOUR FACTORY’S BIGGEST LEAK', 'IS PROBABLY INVISIBLE.'],
    subhead: 'Make it obvious. Free 30-second Roadmap.',
    footer: 'Free Manufacturers Profit Roadmap',
  })],
]

const outputs = [
  ...tradeAds.map(([name, svg]) => renderAd(tradeRepo, name, svg)),
  ...factoryAds.map(([name, svg]) => renderAd(factoryRepo, name, svg)),
]

console.log(outputs.join('\n'))
