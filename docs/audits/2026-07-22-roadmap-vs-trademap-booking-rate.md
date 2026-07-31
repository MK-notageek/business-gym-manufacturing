# Roadmap vs Trade Map — conversion & bookings

2026-07-22. Window 5 Feb–22 Jul 2026. Meta acct `866870886064863`, GHL loc `om6L4L1Zfk1cl0MLSbHM`.

## Numbers

| | Roadmap (manufacturers) | Trade Map (trades) |
|---|---|---|
| LPV → lead (Meta) | 8.3% | 12.5% |
| GHL leads | 395 `roadmap-download` | 106 `tradie` |
| `call-booked` tags | 48 | 0 |
| Lead → booking | 12.2% | 0% |

## Conclusion

**Undecided — the trades booking number is not trustworthy.** Trade Map converts more
visitors to leads; whether those leads book cannot be answered yet.

## Why the 0 can't be used

- Both funnels tag `call-booked` via a client-side hack: `ThankYouPage.tsx` matches a
  *guessed* postMessage shape from the booking iframe, then POSTs `/api/calendar-booked`.
- `call-booked` fires 48× vs ~9 real calendar appointments → loose proxy, not a booked slot.
- `direct-booking` is a form-submit segment label, not a booking. Ignore it.
- The live trades repo `MK-notageek/pba-profit-roadmap` was **edited 2026-07-22 12:32Z**:
  calendar swapped to `link.premierbusinessacademy.co.nz/.../pba-business-strategy-call`,
  origin allowlist widened. The 0 reflects the *old* growthhub setup, not the live page.

## Next

End-to-end test: book on the live trademap page → check that contact for `call-booked` +
Vercel logs (`[calendar-booked] → 200`). Note a real booking fires Bernard's Slack + WhatsApp.

Repos: trades `MK-notageek/pba-profit-roadmap` (private), roadmap
`MK-notageek/business-gym-manufacturing`. Scripts: `scripts/pba-booking-rate.py`,
`scripts/trades-tracking-check.py`.
