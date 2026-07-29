# Trade Map funnel adaptation for manufacturers

Date: 2026-07-29

## Change

- Replaced the long-form manufacturer landing page with the Trade Map’s focused
  hero-first structure.
- Added a manufacturer-specific interactive Profit Roadmap booklet.
- Rebuilt the survey as seven one-question screens while preserving all
  manufacturer fields and API behavior.
- Removed the download dead end; the confirmation begins with email delivery.
- Reframed the free booking as a 45-minute Growth Assessment Session with a top
  PBA advisor.
- Moved six manufacturer result videos and 141-review Google proof beneath the
  calendar.
- Kept the existing manufacturer calendar pending PBA’s dedicated Growth
  Assessment calendar.

## Verification

- `npm run build`: passed.
- Desktop 1440 × 1000: booklet and survey visible, initial scroll position 0,
  no horizontal overflow.
- Mobile 390 × 844: survey visible, booklet intentionally hidden, no horizontal
  overflow.
- All seven survey steps completed with mocked API responses and redirected to
  `/thank-you`.
- Email-delivery line, Growth Assessment copy, calendar, video testimonials,
  and Google reviews render on `/thank-you`.
- No browser console or page errors.
- No GHL contact or booking was created.
- No deployment was made.
