# Factory Roadmap

## Live system

- Landing page: `https://roadmap.premierbusinessacademy.co.nz`
- Thank-you page: `https://roadmap.premierbusinessacademy.co.nz/thank-you`
- Code: `code/business-gym-manufacturing`
- GitHub: `MK-notageek/business-gym-manufacturing`, branch `main`
- Vercel: `pba-lead-magnet` on the paid `mos-projects` team
- GHL location: `om6L4L1Zfk1cl0MLSbHM`

## Manufacturer roadmap email delivery

The manufacturer sequence is code-managed as of 10 August 2026. GHL remains the sender and
contact store, but its visual workflow is no longer triggered for new roadmap submissions.

- The completed form sends email 1 immediately through the GHL Conversations API.
- Vercel cron runs every ten minutes to retry failures and send days 1, 3, 5, and 7.
- The five revenue answers map to the five current PDFs in `public/roadmaps/`.
- Email 1 includes the clickable Bernard video preview from `public/media/email-vsl-thumb.jpg`.
- Video and booking clicks return to the live thank-you page; booking clicks retain contact attribution.
- The sequence stops when the contact has the existing `call-booked` tag.
- Existing contacts already inside the published GHL workflow can finish; new contacts are not added.

## Tracking

- Each email records its sent state as a GHL tag.
- Opens use an encrypted per-contact tracking pixel and record one open tag per email.
- Video, roadmap, testimonial, and booking clicks record separate GHL tags.
- Bookings use the existing `call-booked` tag and the thank-you-page calendar callback.
- Protected aggregate reporting is available at `/api/email-stats` using `CRON_SECRET` authorization.
- Open rates are directional because privacy proxies can inflate them; clicks and bookings are stronger.

The schedule start is stored in the GHL text field `Manufacturer Roadmap Email Started At`
(`wTlDJoA2INPoSelc2JrR`). Production has encrypted `CRON_SECRET` and
`ROADMAP_EMAIL_TRACKING_SECRET` variables; their values are not stored in this workspace.

## Verification

- Source commit: `b6f0990` (`Move manufacturer roadmap emails into code`), pushed to `main`.
- Production deployment: `dpl_5VmsAh6V38DULakaq7dVGpM4dJhg`, state `READY`.
- Vercel reports the production cron at `*/10 * * * *`.
- Eleven local tests pass and the production Vite build passes.
- Live thank-you page, thumbnail, pixel, protected click, stats, and cron routes respond correctly.
- No live test contact was created, because it could trigger Bernard's Slack and WhatsApp workflows.

## Next

Run one controlled send to an approved existing test contact, then verify inbox rendering,
default unsubscribe footer, GHL sent/open/click tags, and the aggregate statistics response.
