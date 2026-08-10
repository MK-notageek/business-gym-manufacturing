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
- All custom fields use GHL's documented `fieldValue` request property. Revenue
  is written and confirmed before the delivery tag is added, so the normal
  experience remains select, continue, submit, email.

See `reports/2026-07-30-required-fields-and-roadmap-routing.md`.

## 2026-07-31 international phone and duplicate-contact repair

- Phone validation now accepts international and local numbers from any country
  when they contain 6–15 digits and normal phone punctuation. *(Superseded: see
  2026-08-05 and 2026-08-06 below — validation is NZ-only again.)*
- A phone already present on another GHL contact no longer traps the visitor on
  the final survey step. The new lead remains keyed to their submitted email;
  GHL is retried without the conflicting phone so the existing phone owner is
  not overwritten.
- Revenue confirmation and the delivery-trigger ordering remain unchanged.

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

## 2026-08-07 funnel integrity audit

Two partial leads in a row prompted a full check of the live page, the tracking
and the field writes. Nothing is broken — 70% completion since the 2026-07-29
rebuild (26 complete, 11 partial), and the two leads dropped at the staff and
phone steps with everything before that stored correctly. Live bundle is current,
all five PDFs return 200, Lead EMQ is 9.3/10 with 100% email and phone coverage.
The NZ-only phone gate is not implicated; phone-step exits predate it.

Two gaps stand: no ad-level attribution reaches GHL, and partials fire three
Slack alerts but have no recovery sequence despite 19 of the last 28 leaving a
valid phone.

See `reports/2026-08-07-funnel-integrity-audit.md` in the project folder.

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

## 2026-08-05 phone validation tightened

The any-country phone change had left validation at "6 to 15 digits", so
`2222222` and `1234567890` passed. Validation now runs the number against the
real numbering plan of its country (`libphonenumber-js`) plus a junk guard for
fewer than three distinct digits and straight digit runs.

- Shared logic in `src/lib/phone.ts` and `api/_lib/phone.js`, identical on both
  sides so the browser and the API accept the same set.
- No leading `+` is read as New Zealand; overseas leads type `+` and their
  country code, and the field copy says so.
- Stored values are E.164 now, so GHL, Slack and the WhatsApp bridge get a
  dialable number. `partial-contact` drops an unparseable number instead of
  failing the capture.
- `npm test` covers 10 real formats and 18 junk ones; also verified in-browser.
- Commit `d13adb2`, pushed. **Not yet deployed** — production still runs the
  loose check until a manual Vercel deploy.

## 2026-08-06 back to New Zealand numbers only

Any-country was too loose in practice, so both funnels are NZ-only again. After
`libphonenumber-js` confirms the number is valid, it must also carry calling code
`64` and country `NZ` — so `+61 412 345 678`, `+1 415 555 2671` and
`+44 7911 123456` are rejected despite being real numbers. Pitcairn, which shares
`+64`, is excluded too.

- The plan check, the junk guard (`2222222`, `1234567890`) and E.164 storage are
  all unchanged; this adds one country gate on top.
- New `isOverseasPhone` helper in both twins, so a foreign country code gets
  "New Zealand numbers only — enter a NZ mobile or landline" rather than the
  generic invalid-number message.
- Field sub-copy is "New Zealand numbers only. No spam."; the server returns
  `Valid New Zealand phone required`.
- `npm test` green (10 valid NZ formats, 24 rejected). Browser-verified on both
  funnels at step 3.
- Commit `dbdec2e`, pushed.
- Deployed the same day: `dpl_4XD4umBBzm7UnKkHBfeBA4o2AuKz`, READY. Verified on
  `roadmap.premierbusinessacademy.co.nz`: `+61 412 345 678`, `+1 415 555 2671`,
  `2222222222`, `1234567890` and `0412345678` all return `Valid New Zealand
  phone required` from the live API; `021 123 4567` clears the phone gate. The
  live bundle carries the new copy. No GHL contact was created during the check.

The trades funnel got the identical fix; see `trades-roadmap.md`.
- Deployed 2026-08-05: `dpl_4aMyTvarGdGneg29PKAP4sGBgAtM`, READY. Verified on
  `roadmap.premierbusinessacademy.co.nz` the same way as the trades funnel, with
  no GHL contact created.
- The first attempt at this deploy was `dpl_CRb1YzbkwJxtNrGbWNAcWBbhnVb9`, BLOCKED:
  the staging archive sat inside the workspace repo and inherited its git author.
  See `brain/how-to/known-failures.md` entry 13.

## 2026-08-10 code-managed email delivery and tracking

This supersedes the older GHL workflow-trigger and calendar notes above for new
manufacturer roadmap submissions.

- GHL remains the email sender and contact store, but new submissions no longer
  receive the `lead-magnet-survey-submitted` workflow trigger.
- The legacy `ROADMAP DOWNLOAD → BOOKING` workflow
  (`1d2b4507-cc88-42c1-8126-9b4d08a6b95b`) was changed from Published to Draft
  on 10 August, so its 37 enrolled contacts cannot produce duplicate nurture.
- GHL's native appointment confirmation remains active. It follows a booking,
  not a roadmap request, and Vercel does not replace appointment confirmations.
- Email 1 sends immediately from `api/submit-form.js`; Vercel cron runs every
  ten minutes to retry failures and send days 1, 3, 5, and 7.
- Email 1 uses PBA's official full logo, a branded email-safe layout, the
  clickable Bernard video preview, and distinct roadmap and booking calls to
  action. The incorrect generated `PB` badge and its source were deleted.
- The visible explanation about why the email was received and LC Email's
  automatic unsubscribe handling was removed; LC Email still adds its native
  unsubscribe link.
- Days 1, 3, 5, and 7 retain the retired GHL workflow's original subjects and
  narrative proof points: pricing leakage, Trent, insolvencies, and Bernard's
  manufacturing background. Regression tests lock those elements in place.
- Video and booking clicks return to the live thank-you page, which autoplays
  muted and uses the current 45-minute `growth-assessment-session` calendar.
- All five revenue answers still route to their matching current PDF.
- Sent, open, video, roadmap, testimonial, and booking-click states are recorded
  as GHL tags. The existing `call-booked` tag stops later nurture.
- Open rates are directional because privacy proxies can inflate them; clicks
  and bookings are the stronger reporting signals.
- Protected aggregate reporting is available at `/api/email-stats`.
- The schedule start is stored in `Manufacturer Roadmap Email Started At`
  (`wTlDJoA2INPoSelc2JrR`).
- Production has encrypted `CRON_SECRET` and
  `ROADMAP_EMAIL_TRACKING_SECRET` variables; values are not stored here.
- Email delivery code began at `b6f0990`; the polished email is `dd879c2`.
  Production deployment `dpl_5N66vdHG2gTwR3n8SWwbJXE4edat` is `READY`, with the
  `*/10 * * * *` cron registered.
- Twelve tests and the production build pass. Live thank-you, thumbnail, pixel,
  protected click, stats, and cron routes were verified.
- A controlled copy was accepted by GHL and sent to Ayaan's existing contact at
  `Ayaan@Advlaunch.com`; no contact was created and no signup alert was triggered.
