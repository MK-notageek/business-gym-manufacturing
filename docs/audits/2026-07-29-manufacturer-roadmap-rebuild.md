# Manufacturer Roadmap Rebuild — 2026-07-29

## Outcome

- Rebuilt all five manufacturer Profit Roadmaps in the visual system used by
  the Trade Map Profit Roadmap.
- Preserved the manufacturer-specific diagnosis, seven profit areas, revenue
  stage guidance, 90-day plan, PBA proof, and owner results.
- Updated the proof point from 125 to 141 reviews.
- Renamed the free call CTA to `Growth Assessment`.
- Kept the five existing public filenames so delivery URLs remain stable.
- Kept the landing page free of a roadmap download button.

## Files

| Revenue band | Hosted path |
|---|---|
| Under $1M | `/roadmaps/profit-roadmap-under-1m.pdf` |
| $1M–$2M | `/roadmaps/profit-roadmap-1m-2m.pdf` |
| $2M–$5M | `/roadmaps/profit-roadmap-2m-5m.pdf` |
| $5M–$10M | `/roadmaps/profit-roadmap-5m-10m.pdf` |
| $10M+ | `/roadmaps/profit-roadmap-10m-plus.pdf` |

## Validation

- Each PDF is 13 pages.
- Each PDF contains searchable text.
- Each PDF contains `Growth Assessment` and the updated `141` review proof.
- Each PDF has one final-page booking link.
- The production build includes all five PDFs.

## Funnel continuity

No booking or post-booking implementation was changed in this rebuild:

- calendar iframe and prefill
- booking detection
- `/api/calendar-booked`
- Meta/browser tracking
- `/booked` redirect
- thank-you VSL

Testimonials and Google review proof remain beneath the manufacturer calendar.

## GoHighLevel audit

- Location: `Business GYM Auckland, Nz`
- Folder: `Manufacturer Roadmap`
- Published delivery workflow: `ROADMAP DOWNLOAD → BOOKING`
- Trigger: tag `lead-magnet-survey-submitted`
- The workflow already branches on the five `Annual revenue` values.
- Existing delivery emails use GoHighLevel media-file URLs rather than the
  stable website paths above.
- Final branch-by-branch URL replacement is held until the rebuilt PDFs are
  approved for deployment, so the published workflow cannot send an
  unapproved or mismatched revenue-band file.

## Release status

Not deployed. Ayaan requested visual verification before any deployment.
