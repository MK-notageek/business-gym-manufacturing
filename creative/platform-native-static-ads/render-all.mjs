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
const ink = '#0b0b0c'
const white = '#ffffff'
const tweetBlack = '#000000'
const tweetMuted = '#71767b'
const apologyGreen = '#42bf77'
const newsRed = '#e63227'

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

function textLines({
  values,
  x,
  y,
  size,
  lineHeight = 1.15,
  fill = ink,
  weight = 700,
  family = 'Arial, Helvetica, sans-serif',
  anchor = 'start',
  letterSpacing = 0,
}) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${letterSpacing}">${
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
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="13" stdDeviation="18" flood-color="#000000" flood-opacity=".28"/>
    </filter>
    <filter id="lightShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="5" stdDeviation="9" flood-color="#000000" flood-opacity=".18"/>
    </filter>
    ${defs}
  </defs>
  ${content}
</svg>`
}

function fakeTweet({ background, avatar, post, note }) {
  const backgroundUri = dataUri(background)
  const avatarUri = dataUri(avatar)
  const defs = `
    <clipPath id="tweetAvatar"><circle cx="112" cy="804" r="34"/></clipPath>
    <linearGradient id="tweetShade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity=".35"/>
    </linearGradient>`
  return base(`
    ${image(backgroundUri, 0, 0, W, H)}
    <rect width="${W}" height="${H}" fill="url(#tweetShade)"/>
    <rect x="44" y="742" width="992" height="548" rx="8" fill="${tweetBlack}" filter="url(#shadow)"/>
    <circle cx="112" cy="804" r="35" fill="#222"/>
    ${image(avatarUri, 78, 770, 68, 68, 'clip-path="url(#tweetAvatar)"')}
    <text x="166" y="797" fill="${white}" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="700">Bernard Powell</text>
    <text x="166" y="832" fill="${tweetMuted}" font-family="Arial, Helvetica, sans-serif" font-size="22">@bernardpowell</text>
    <text x="977" y="815" fill="#e7e9ea" font-family="Arial, Helvetica, sans-serif" font-size="32">•••</text>
    ${textLines({ values: post, x: 80, y: 922, size: 39, lineHeight: 1.18, fill: white, weight: 400 })}
    <text x="80" y="1167" fill="${tweetMuted}" font-family="Arial, Helvetica, sans-serif" font-size="21">${esc(note)}</text>
    <line x1="80" y1="1202" x2="1000" y2="1202" stroke="#2f3336" stroke-width="2"/>
    <text x="90" y="1254" fill="${tweetMuted}" font-family="Arial, Helvetica, sans-serif" font-size="29">○</text>
    <text x="300" y="1254" fill="${tweetMuted}" font-family="Arial, Helvetica, sans-serif" font-size="29">↻</text>
    <text x="520" y="1254" fill="${tweetMuted}" font-family="Arial, Helvetica, sans-serif" font-size="29">♡</text>
    <text x="748" y="1254" fill="${tweetMuted}" font-family="Arial, Helvetica, sans-serif" font-size="29">▱</text>
    <text x="960" y="1254" fill="${tweetMuted}" font-family="Arial, Helvetica, sans-serif" font-size="29">⌑</text>
  `, defs)
}

function tradeGrid({ photos, headline, subhead }) {
  const uris = photos.map(dataUri)
  return base(`
    <rect width="${W}" height="${H}" fill="#ddd"/>
    ${image(uris[0], 0, 0, 356, H)}
    ${image(uris[1], 362, 0, 356, H)}
    ${image(uris[2], 724, 0, 356, H)}
    <rect x="88" y="520" width="904" height="186" rx="12" fill="rgba(255,255,255,.96)" filter="url(#lightShadow)"/>
    ${textLines({ values: headline, x: 540, y: 590, size: 47, lineHeight: 1.04, weight: 900, anchor: 'middle' })}
    <rect x="212" y="744" width="656" height="70" rx="8" fill="rgba(255,255,255,.96)"/>
    <text x="540" y="790" fill="${ink}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" text-anchor="middle">${esc(subhead)}</text>
  `)
}

function photoGrid({ photos, headline, subhead }) {
  const uris = photos.map(dataUri)
  return base(`
    <rect width="${W}" height="${H}" fill="#ddd"/>
    ${image(uris[0], 0, 0, 356, H)}
    ${image(uris[1], 362, 0, 356, H)}
    ${image(uris[2], 724, 0, 356, H)}
    <rect x="88" y="520" width="904" height="186" rx="12" fill="rgba(255,255,255,.96)" filter="url(#lightShadow)"/>
    ${textLines({ values: headline, x: 540, y: 590, size: 47, lineHeight: 1.04, weight: 900, anchor: 'middle' })}
    <rect x="184" y="744" width="712" height="70" rx="8" fill="rgba(255,255,255,.96)"/>
    <text x="540" y="790" fill="${ink}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" text-anchor="middle">${esc(subhead)}</text>
  `)
}

function apology({ body, makeRight, cover }) {
  const coverUri = dataUri(cover)
  return base(`
    <rect width="${W}" height="${H}" fill="#f6f0e2"/>
    ${textLines({
      values: ['WE’RE SO', 'SORRY!'],
      x: 56,
      y: 222,
      size: 118,
      lineHeight: .82,
      fill: apologyGreen,
      weight: 900,
      family: 'Arial Black, Arial, sans-serif',
    })}
    ${textLines({ values: body, x: 60, y: 470, size: 28, lineHeight: 1.22, fill: '#262626', weight: 400 })}
    ${textLines({ values: makeRight, x: 60, y: 730, size: 30, lineHeight: 1.22, fill: '#262626', weight: 700 })}
    <g transform="rotate(2 825 1040)" filter="url(#lightShadow)">
      <rect x="650" y="802" width="350" height="495" rx="5" fill="#fff"/>
      <image href="${coverUri}" x="650" y="802" width="350" height="495" preserveAspectRatio="xMidYMid meet"/>
    </g>
  `)
}

function forwardedEmail({ subject, body }) {
  return base(`
    <rect width="${W}" height="${H}" fill="#ffffff"/>
    <rect x="0" y="0" width="1080" height="94" fill="#fafafa"/>
    <text x="42" y="59" fill="#5f6368" font-family="Arial, Helvetica, sans-serif" font-size="31">☰</text>
    <text x="104" y="61" fill="#ea4335" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="700">M</text>
    <text x="142" y="61" fill="#5f6368" font-family="Arial, Helvetica, sans-serif" font-size="28">Gmail</text>
    <rect x="735" y="21" width="292" height="54" rx="27" fill="#edf3ff"/>
    <text x="770" y="56" fill="#5f6368" font-family="Arial, Helvetica, sans-serif" font-size="22">Search mail</text>
    <text x="54" y="174" fill="#202124" font-family="Arial, Helvetica, sans-serif" font-size="47">${esc(subject)}</text>
    <rect x="54" y="202" width="90" height="38" rx="7" fill="#e6e6e6"/>
    <text x="99" y="228" fill="#5f6368" font-family="Arial, Helvetica, sans-serif" font-size="20" text-anchor="middle">Inbox ×</text>
    <circle cx="92" cy="316" r="42" fill="#3c4043"/>
    <text x="92" y="328" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="31" font-weight="700" text-anchor="middle">B</text>
    <text x="154" y="301" fill="#202124" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="700">Bernard Powell</text>
    <text x="154" y="338" fill="#5f6368" font-family="Arial, Helvetica, sans-serif" font-size="21">to me ▾</text>
    <text x="1027" y="301" fill="#5f6368" font-family="Arial, Helvetica, sans-serif" font-size="21" text-anchor="end">9:14 AM</text>
    <text x="917" y="346" fill="#5f6368" font-family="Arial, Helvetica, sans-serif" font-size="34">☆   ↩   ⋮</text>
    ${textLines({ values: body, x: 62, y: 450, size: 36, lineHeight: 1.34, fill: '#202124', weight: 400 })}
    <rect x="62" y="1135" width="142" height="64" rx="26" fill="#f1f3f4"/>
    <text x="133" y="1177" fill="#3c4043" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" text-anchor="middle">↩ Reply</text>
    <rect x="224" y="1135" width="166" height="64" rx="26" fill="#f1f3f4"/>
    <text x="307" y="1177" fill="#3c4043" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" text-anchor="middle">↪ Forward</text>
  `)
}

function wouldYouRather({ kicker, leftImage, rightImage, leftCopy, rightCopy }) {
  const leftUri = dataUri(leftImage)
  const rightUri = dataUri(rightImage)
  const defs = `
    <clipPath id="leftCircle"><circle cx="292" cy="432" r="125"/></clipPath>
    <clipPath id="rightRound"><rect x="704" y="296" width="220" height="310" rx="10"/></clipPath>`
  return base(`
    <rect width="${W}" height="${H}" fill="#ffffff"/>
    <text x="540" y="112" fill="${ink}" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" text-anchor="middle">${esc(kicker)}</text>
    <text x="540" y="218" fill="${ink}" font-family="Arial Black, Arial, sans-serif" font-size="67" font-weight="900" text-anchor="middle">Would you rather?</text>
    <line x1="540" y1="294" x2="540" y2="862" stroke="#d6d6d6" stroke-width="3"/>
    ${image(leftUri, 167, 307, 250, 250, 'clip-path="url(#leftCircle)"')}
    <rect x="704" y="296" width="220" height="310" rx="10" fill="#f3f3f3" filter="url(#lightShadow)"/>
    <image href="${rightUri}" x="704" y="296" width="220" height="310" preserveAspectRatio="xMidYMid meet" clip-path="url(#rightRound)"/>
    ${textLines({ values: leftCopy, x: 292, y: 676, size: 31, lineHeight: 1.08, fill: ink, weight: 700, anchor: 'middle' })}
    ${textLines({ values: rightCopy, x: 814, y: 676, size: 31, lineHeight: 1.08, fill: ink, weight: 700, anchor: 'middle' })}
    <circle cx="292" cy="914" r="46" fill="#e94b3c"/>
    <text x="292" y="927" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="37" text-anchor="middle">A</text>
    <circle cx="814" cy="914" r="46" fill="#e94b3c"/>
    <text x="814" y="927" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="37" text-anchor="middle">B</text>
    <path d="M0 1092 C356 1200 724 1214 1080 1014 L1080 1350 L0 1350 Z" fill="#e94b3c"/>
  `, defs)
}

function newsStunt({ photo, category, headline, logo }) {
  const photoUri = dataUri(photo)
  const logoUri = dataUri(logo)
  return base(`
    ${image(photoUri, 0, 0, W, H)}
    <rect x="0" y="850" width="1080" height="500" fill="#ffffff"/>
    <rect x="0" y="850" width="210" height="74" fill="${newsRed}"/>
    <text x="105" y="900" fill="#fff" font-family="Arial Black, Arial, sans-serif" font-size="29" font-weight="900" text-anchor="middle">${esc(category)}</text>
    <rect x="210" y="850" width="870" height="74" fill="#0d1420"/>
    <image href="${logoUri}" x="238" y="862" width="318" height="50" preserveAspectRatio="xMinYMid meet"/>
    ${textLines({
      values: headline,
      x: 38,
      y: 1006,
      size: 59,
      lineHeight: .98,
      fill: ink,
      weight: 900,
      family: 'Arial Black, Arial, sans-serif',
    })}
  `)
}

function pickCard({ eyebrow, title, subtitle, cards, footer }) {
  const cardW = 278
  const cardH = 230
  const startX = 82
  const startY = 470
  const gapX = 41
  const gapY = 32
  const cardMarkup = cards.map((card, index) => {
    const col = index % 3
    const row = Math.floor(index / 3)
    const x = startX + col * (cardW + gapX)
    const y = startY + row * (cardH + gapY)
    const fill = (index + row) % 2 === 0 ? '#167148' : '#f0c43b'
    const detail = fill === '#167148' ? '#f5d86f' : '#145f42'
    return `
      <rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="8" fill="${fill}" stroke="#fff7c4" stroke-width="5" filter="url(#lightShadow)"/>
      <rect x="${x + 17}" y="${y + 17}" width="${cardW - 34}" height="${cardH - 34}" rx="6" fill="none" stroke="${detail}" stroke-width="3"/>
      <circle cx="${x + cardW / 2}" cy="${y + 78}" r="43" fill="${detail}"/>
      <text x="${x + cardW / 2}" y="${y + 92}" fill="${fill}" font-family="Arial Black, Arial, sans-serif" font-size="41" font-weight="900" text-anchor="middle">${esc(card.code)}</text>
      <text x="${x + cardW / 2}" y="${y + 169}" fill="${detail}" font-family="Arial Black, Arial, sans-serif" font-size="23" font-weight="900" text-anchor="middle">${esc(card.label)}</text>
    `
  }).join('')
  return base(`
    <rect width="${W}" height="${H}" fill="#fff0ad"/>
    <rect x="0" y="0" width="1080" height="96" fill="#176844"/>
    <text x="540" y="64" fill="#fff0ad" font-family="Arial Black, Arial, sans-serif" font-size="32" font-weight="900" text-anchor="middle">${esc(eyebrow)}</text>
    <text x="540" y="188" fill="#155f40" font-family="Arial Black, Arial, sans-serif" font-size="83" font-weight="900" text-anchor="middle">${esc(title)}</text>
    <text x="540" y="244" fill="#155f40" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700" text-anchor="middle">${esc(subtitle)}</text>
    <polygon points="880,115 933,135 978,104 992,160 1047,174 1014,219 1035,271 979,272 947,319 912,274 856,278 875,225 840,182 895,164" fill="#f1c63a" stroke="#155f40" stroke-width="5"/>
    <text x="944" y="194" fill="#155f40" font-family="Arial Black, Arial, sans-serif" font-size="26" font-weight="900" text-anchor="middle">FREE</text>
    <text x="944" y="230" fill="#155f40" font-family="Arial Black, Arial, sans-serif" font-size="24" font-weight="900" text-anchor="middle">30 SEC</text>
    <text x="540" y="402" fill="#155f40" font-family="Arial Black, Arial, sans-serif" font-size="32" font-weight="900" text-anchor="middle">(TAP A CARD)</text>
    ${cardMarkup}
    <rect x="0" y="1238" width="1080" height="112" fill="#176844"/>
    <text x="540" y="1308" fill="#fff0ad" font-family="Arial Black, Arial, sans-serif" font-size="29" font-weight="900" text-anchor="middle">${esc(footer)}</text>
  `)
}

function giantProduct({ scene, cover, coverBox, coverPath, handPaths }) {
  const sceneUri = dataUri(scene)
  const coverUri = dataUri(cover)
  const defs = `
    <clipPath id="giantCoverFace">
      <path d="${coverPath}"/>
    </clipPath>
    <clipPath id="giantHands">
      ${handPaths.map((handPath) => `<path d="${handPath}"/>`).join('')}
    </clipPath>`
  return base(`
    <image href="${sceneUri}" x="0" y="0" width="1080" height="1350" preserveAspectRatio="xMidYMid slice"/>
    <image href="${coverUri}" x="${coverBox.x}" y="${coverBox.y}" width="${coverBox.width}" height="${coverBox.height}" preserveAspectRatio="none" clip-path="url(#giantCoverFace)" opacity=".985"/>
    <image href="${sceneUri}" x="0" y="0" width="1080" height="1350" preserveAspectRatio="xMidYMid slice" clip-path="url(#giantHands)"/>
    <path d="${coverPath}" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="2"/>
  `, defs)
}

function renderAd(repo, name, svg) {
  const folder = path.join(repo, 'creative', 'ads', name)
  fs.mkdirSync(folder, { recursive: true })
  const svgPath = path.join(folder, `${name}.svg`)
  const pngPath = path.join(folder, `${name}.png`)
  fs.writeFileSync(svgPath, svg.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n'))
  execFileSync('rsvg-convert', ['-w', String(W), '-h', String(H), '-o', pngPath, svgPath])
  return pngPath
}

function makeContactSheet(images, output) {
  execFileSync('magick', [
    'montage',
    '-font', '/System/Library/Fonts/Supplemental/Arial.ttf',
    '-label', '',
    ...images,
    '-thumbnail', '540x675^',
    '-gravity', 'center',
    '-extent', '540x675',
    '-tile', '4x2',
    '-geometry', '+14+14',
    '-background', '#0c1320',
    output,
  ])
}

const factoryImages = path.join(factoryRepo, 'public', 'images')
const tradeSource = path.join(tradeRepo, 'creative', 'platform-native-static-ads', 'source')
const factorySource = path.join(factoryRepo, 'creative', 'platform-native-static-ads', 'source')
const bernard = path.join(factoryImages, '1750066266064.webp')
const bernardWhiteboard = path.join(factoryImages, '1765583997480.webp')
const warehouse = path.join(factoryImages, 'warehouse-visit.webp')
const training = path.join(factoryImages, 'training-room.webp')
const team = path.join(factoryImages, 'bernard with client team.webp')
const blueTeam = path.join(factoryImages, 'blue-jackets-group.webp')
const tradeCover = path.join(tradeSource, 'trade-roadmap-cover.png')
const factoryCover = path.join(factorySource, 'manufacturer-roadmap-cover.png')
const realPbaWordmark = path.join(workspace, 'external/bernard/live-projects/traffic/assets/preview/pba-logo-full-on-dark.jpg')

const tradeAds = [
  ['trademap-img01-margin-proof', fakeTweet({
    background: path.join(tradeSource, 'generated', 'trade-grid-panel-electrician.jpg'),
    avatar: bernard,
    post: [
      'Most trade businesses don’t have a',
      'lead problem. They have a “we won',
      'the job — where did the margin go?”',
      'problem.',
    ],
    note: 'The leak is usually hiding after the quote.',
  })],
  ['trademap-img02-camera-roll', tradeGrid({
    photos: [
      path.join(tradeSource, 'generated', 'trade-grid-panel-electrician.jpg'),
      path.join(tradeSource, 'generated', 'trade-grid-panel-plumber.jpg'),
      path.join(tradeSource, 'generated', 'trade-grid-panel-builder.jpg'),
    ],
    headline: ['JOBS WON.', 'MARGIN MISSING.'],
    subhead: 'THE 5 LEAKS ARE USUALLY HIDING AFTER THE QUOTE.',
  })],
  ['trademap-img03-sorry-profit-leaks', apology({
    body: [
      'We got so busy mapping the five silent',
      'profit leaks inside NZ trade businesses,',
      'we forgot to make them difficult to find.',
    ],
    makeRight: ['So here’s how we’re making it right:', 'your free 30-second', 'Trade Profit Roadmap.'],
    cover: tradeCover,
  })],
  ['trademap-img04-forwarded-job-margin', forwardedEmail({
    subject: 'Fwd: the job you already won',
    body: [
      'Quick one —',
      '',
      'More leads won’t fix a leak that starts',
      'after the quote.',
      '',
      'I mapped the 5 places to check.',
      'Free. Takes 30 seconds.',
      '',
      'Bernard',
    ],
  })],
  ['trademap-img05-fix-or-sell-more', wouldYouRather({
    kicker: 'The Trade Map:',
    leftImage: path.join(tradeSource, 'generated', 'trade-grid-dump.png'),
    rightImage: tradeCover,
    leftCopy: ['KEEP CHASING', 'MORE JOBS'],
    rightCopy: ['FIND WHAT’S', 'EATING THE', 'MARGIN'],
  })],
  ['trademap-img06-margin-news', newsStunt({
    photo: bernardWhiteboard,
    category: 'MARGIN',
    headline: ['WHY FULL JOB BOOKS', 'STILL DON’T MEAN', 'MORE PROFIT'],
    logo: realPbaWordmark,
  })],
  ['trademap-img07-pick-your-trade', pickCard({
    eyebrow: 'NZ TRADE OWNER? LET’S PLAY A GAME.',
    title: 'PICK A CARD',
    subtitle: 'Pick your trade. Get the map matched to your business.',
    cards: [
      { code: 'E', label: 'ELECTRICAL' },
      { code: 'P', label: 'PLUMBING' },
      { code: 'H', label: 'HVAC' },
      { code: 'B', label: 'BUILDING' },
      { code: 'R', label: 'ROOFING' },
      { code: 'L', label: 'LANDSCAPE' },
    ],
    footer: 'FREE TRADE PROFIT ROADMAP • NO GUESSING',
  })],
  ['trademap-img08-giant-trade-map', giantProduct({
    scene: path.join(tradeSource, 'generated', 'trade-giant-product-person.png'),
    cover: tradeCover,
    coverBox: { x: 300, y: 104, width: 525, height: 875 },
    coverPath: 'M302 108 L824 108 L810 974 L302 974 Z',
    handPaths: [
      'M282 520 C294 514 311 520 317 528 C326 532 330 540 327 547 C333 554 330 562 325 566 C330 573 325 582 318 585 C315 593 304 596 296 591 C286 594 276 588 272 580 C263 574 260 562 263 552 C259 544 264 536 270 532 C271 526 276 522 282 520 Z',
      'M810 529 C820 526 831 535 832 543 C838 549 838 558 833 563 C838 570 834 578 829 581 C830 590 822 596 814 595 C807 596 800 591 798 585 C790 584 785 578 786 571 C779 568 778 560 783 554 C783 546 790 541 797 540 C799 534 804 530 810 529 Z',
    ],
  })],
]

const factoryAds = [
  ['factorymap-img01-revenue-profit-flat', fakeTweet({
    background: warehouse,
    avatar: bernard,
    post: [
      'Revenue up. Profit flat.',
      '',
      'That usually means the factory is',
      'leaking somewhere the P&L can’t',
      'show you at a glance.',
    ],
    note: 'Find the first leak before you add another shift.',
  })],
  ['factorymap-img02-factory-camera-roll', photoGrid({
    photos: [warehouse, training, blueTeam],
    headline: ['BUSIER FACTORY.', 'SAME PROFIT.'],
    subhead: 'FIND THE FIRST LEAK BEFORE YOU ADD ANOTHER SHIFT.',
  })],
  ['factorymap-img03-sorry-factory-leaks', apology({
    body: [
      'We got so busy turning the leaks that keep',
      'factory owners trapped on the floor into',
      'one clear roadmap, we forgot to charge for it.',
    ],
    makeRight: ['So here’s how we’re making it right:', 'your free 30-second', 'Manufacturer’s Roadmap.'],
    cover: factoryCover,
  })],
  ['factorymap-img04-forwarded-profit-flat', forwardedEmail({
    subject: 'Fwd: revenue up, profit flat',
    body: [
      'Quick one —',
      '',
      'A busy factory can still be a leaking factory.',
      '',
      'Before you add another shift, find the first',
      'leak and the fix that recovers profit fastest.',
      '',
      'I mapped the checks. Takes 30 seconds.',
      '',
      'Bernard',
    ],
  })],
  ['factorymap-img05-fix-leak-first', wouldYouRather({
    kicker: 'The Manufacturer’s Roadmap:',
    leftImage: warehouse,
    rightImage: factoryCover,
    leftCopy: ['ADD ANOTHER', 'SHIFT'],
    rightCopy: ['FIX THE', '#1 LEAK', 'FIRST'],
  })],
  ['factorymap-img06-factory-prison-news', newsStunt({
    photo: warehouse,
    category: 'FACTORY',
    headline: ['WHY FACTORIES GET', 'BUSIER WHILE PROFIT', 'STAYS FLAT'],
    logo: realPbaWordmark,
  })],
  ['factorymap-img07-pick-your-leak', pickCard({
    eyebrow: 'FACTORY OWNER? LET’S PLAY A GAME.',
    title: 'PICK A CARD',
    subtitle: 'Which leak looks most familiar on your floor?',
    cards: [
      { code: 'R', label: 'REWORK' },
      { code: 'OT', label: 'OVERTIME' },
      { code: 'W', label: 'TOO MUCH WIP' },
      { code: 'D', label: 'DISCOUNTING' },
      { code: 'F', label: 'FIREFIGHTING' },
      { code: 'O', label: 'OWNER HOURS' },
    ],
    footer: 'FREE MANUFACTURER’S ROADMAP • 30 SECONDS',
  })],
  ['factorymap-img08-giant-roadmap', giantProduct({
    scene: path.join(factorySource, 'generated', 'factory-giant-product-person.png'),
    cover: factoryCover,
    coverBox: { x: 274, y: 80, width: 576, height: 865 },
    coverPath: 'M276 82 L850 82 L840 944 L276 944 Z',
    handPaths: [
      'M252 501 C264 499 276 508 279 516 C286 522 288 531 285 538 C289 545 287 554 283 558 C286 566 282 576 277 580 C275 588 267 592 257 590 C248 591 241 583 239 575 C232 568 230 557 232 548 C228 539 231 529 234 522 C237 514 243 505 252 501 Z',
      'M855 497 C867 498 874 510 870 520 C875 528 873 538 869 542 C873 551 868 560 862 565 C861 574 851 579 842 575 C832 574 825 568 823 560 C816 557 813 549 817 542 C813 535 817 527 823 523 C824 515 833 509 841 508 C844 502 849 498 855 497 Z',
    ],
  })],
]

const tradeRendered = tradeAds.map(([name, svg]) => renderAd(tradeRepo, name, svg))
const factoryRendered = factoryAds.map(([name, svg]) => renderAd(factoryRepo, name, svg))

makeContactSheet(
  tradeRendered,
  path.join(tradeRepo, 'creative', 'platform-native-static-ads', 'trademap-contact-sheet.png'),
)
makeContactSheet(
  factoryRendered,
  path.join(factoryRepo, 'creative', 'platform-native-static-ads', 'factorymap-contact-sheet.png'),
)

console.log(`Rendered ${tradeRendered.length + factoryRendered.length} platform-native ads.`)
