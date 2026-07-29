# factory-roadmap

Client: bernard
Status: live

## The offer

Free Profit Roadmap for New Zealand manufacturers. The landing page scores the
business and routes the lead to a revenue-band roadmap.

- Destination: https://roadmap.premierbusinessacademy.co.nz/
- Repo: `business-gym-manufacturing`
- Meta account: Premier Business Academy

## Current Meta structure

- Campaign: `Roadmap | Leads Campaign | Landing Page | July | Consolidated 1x1x6`
- Ad set: `Roadmap | Advantage+ Broad NZ | Consolidated | All Winners`
- Campaign budget: NZ$100/day
- Delivery: active, one ad set, 41 ads total as of 2026-07-22
- The 20 newest video variants are paired Music / No Music versions across ten hooks.

## Live-source notes

- The live campaign and ad-set settings were audited in Meta Ads Manager on
  2026-07-22. See `reports/2026-07-22-meta-settings-audit.md`.
- The old Organized folder contains four `stage-0` to `stage-3` PDFs. They do not
  match the five revenue-band PDFs currently shipped by the live repo, so they
  were left in the archive rather than copied into this project.
- The repo now lives as a real directory at
  `code/business-gym-manufacturing`; the former `~/Projects` staging copy and
  workspace symlink were replaced on 2026-07-29.

## 2026-07-29 focused funnel

- Replaced the long-form landing page with the Trade Map’s earlier hero-first
  structure.
- Added a manufacturer-specific interactive Profit Roadmap booklet.
- Changed the survey from two grouped screens to seven one-question screens:
  name, email, phone, revenue, staff, biggest constraint, and hours in the business.
- Preserved the manufacturer API fields, partial-contact capture, Meta events,
  qualification rule, and delivery workflow.
- The confirmation now leads with email delivery, removes any download dead end,
  and offers a free 45-minute Growth Assessment Session with a top PBA advisor.
- Manufacturer video testimonials and 141-review Google proof now sit beneath
  the calendar.
- The page uses the dedicated `growth-assessment-session` calendar.
- The rebuilt funnel is live at `roadmap.premierbusinessacademy.co.nz`.

## 2026-07-29 roadmap rebuild

- Rebuilt all five 13-page manufacturer roadmaps using the Trade Map Profit
  Roadmap's visual system while preserving the manufacturer-specific content.
- Updated proof to 141 reviews and renamed the final free-call CTA to Growth
  Assessment.
- The final PDF CTA now opens the manufacturer `/thank-you` booking page; the
  dated `book.premierbusinessacademy.co.nz` link has been removed.
- Kept the five public PDF filenames stable for email delivery.
- Confirmed the published GoHighLevel workflow already branches across all five
  annual-revenue bands and replaced every delivery action with its matching
  stable hosted PDF path.
- Deployed approved version `dpl_HWHL7uzY1TT69bTEWfk8QBqP3kSW`; all five live
  PDFs returned HTTP 200 and linked to the manufacturer `/thank-you` booking
  page.

## 2026-07-30 form integrity

- All seven survey answers are required in both the browser and API.
- The API accepts only the exact options displayed for annual revenue, staff,
  constraint, and hours.
- The GHL annual-revenue field is `contact.annual_revenue`
  (`TYG5Nl56EZ3XR5r9OGUN`); it accepts all five manufacturer bands, including
  `<$1M`.
- The `lead-magnet-survey-submitted` delivery tag is now added only after all
  required contact fields have been stored successfully.
- A rejected GHL field write returns an error and keeps the lead on the survey;
  it can no longer redirect to `/thank-you` with a blank revenue field.

See `reports/2026-07-30-required-fields-and-roadmap-routing.md`.

## 2026-07-22 post-submit audit

- The confirmation page has no direct roadmap download button; it tells the lead
  the roadmap is being delivered by email and immediately presents the booking calendar.
- Manufacturing retains its separate `profit-roadmap-session` calendar. Live inspection
  confirmed name, email, and phone prefill, and the page copy now matches its 45-minute duration.
- Confirmed booking messages still fire the Schedule/tagging path and redirect to `/booked`.
- The shared 1:51 pre-call VSL is now served locally as an optimized 9.7 MB MP4 with a local poster,
  removing the slower cross-domain 24 MB video request used previously.
- Production deployment `dpl_BpJBm9eMFsw5dLbCBYSFFh5wzvAo` was READY and verified through
  `roadmap.premierbusinessacademy.co.nz`. No live contact or appointment was created in this audit.
- Manufacturing now uses the same PBA favicon set as Trade Map (`favicon.png`,
  `favicon.ico`, and `apple-touch-icon.png`) instead of Vite's placeholder icon.
  Deployment `dpl_8M7PZJxfq2Qd7J22zTcfnhPcBSq2` was verified on the custom domain.

## Open items

- Decide whether Meta's generative text/persona variations and automatic voice
  translation should remain enabled. They can alter approved copy and introduce
  claims that are not in the manually written ads.
- Add URL parameters if campaign/ad/creative attribution outside Meta is wanted.
- Resolve the separate 12-item unpublished draft batch before using a bulk
  publish action; several of those unrelated older ads currently show errors.

## Platform-native static ads

As of 2026-07-27, the project has eight 1080 × 1350 static creatives adapted
from the platform-native formats in
`brain/learned/platform-native-static-ad-formats.md`: fake tweet, camera-roll
grid, fake apology, forwarded email, would-you-rather, PBA-owned news layout,
pick-your-leak, and giant product.

- Ad folders: `ads/factorymap-img01-*` through `ads/factorymap-img08-*`
- Source and launch copy:
  `code/business-gym-manufacturing/creative/platform-native-static-ads/`
- Each ad folder contains the matching PNG, editable SVG and `origin.md`.
- The fake tweet/email use Bernard/PBA-authored copy; the news layout is
  labelled as PBA-owned editorial rather than implying third-party coverage.
