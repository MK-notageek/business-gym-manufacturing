# PBA factory roadmap Meta settings audit

Audited live in Meta Ads Manager on 2026-07-22 (Asia/Karachi). No settings were
changed or published.

## Finding

The 20 new Music / No Music video variants are switched on. At the time of the
check, 16 were in Learning, 2 were Processing and 2 were In review. None of the
20 showed an ad-level error in the delivery table.

The campaign and ad-set configuration is internally consistent for a New
Zealand website-lead campaign. The main risks are Meta-generated copy and voice
translations being enabled, blank URL parameters, and a separate unpublished
draft batch that should not be bulk-published accidentally.

## Campaign

- Account: Premier Business Academy (`866870886064863`), NZD
- Campaign ID: `120247306180470576`
- Name: `Roadmap | Leads Campaign | Landing Page | July | Consolidated 1x1x6`
- Status: Active
- Buying type: Auction
- Objective: Leads
- Advantage+ leads campaign: On
- Budget strategy: Campaign budget
- Daily budget: NZ$100
- Meta-disclosed delivery limits: up to NZ$175 in a day and NZ$700 in a week
- Bid strategy: Highest volume
- Structure: 1 ad set, 41 ads total

## Ad set

- Ad set ID: `120247306189990576`
- Name: `Roadmap | Advantage+ Broad NZ | Consolidated | All Winners`
- Status: On; Learning
- Conversion location: Website
- Performance goal: Maximize number of leads
- Dataset/pixel: Premier Business Academy (`1420845489575315`)
- Conversion event: Lead
- Attribution model: Standard
- Cost-per-result goal: None
- Ad-set spending limits: None
- Start: 6 July 2026, 1:00am GMT+12
- End date: None
- Audience: Advantage+ on; hard location control is New Zealand
- No custom audience was populated in the visible inclusion field
- Estimated audience: 4.2M-4.9M
- Placements: Advantage+ placements on
- Account placement exclusions: None

## The 20 new ads

All 20 switches were on.

### Learning (16)

- 3 Years Of Next Year — Music / No Music
- 90 Days Or It's Free — Music / No Music
- Culture Isn't Pizza — Music / No Music
- Forget The 5-Year Plan — Music
- Leave For 2 Weeks — Music / No Music
- Nobody Tells You — Music / No Music
- Tired Of The Chaos — Music
- What Wastes Their Time — Music / No Music
- You Get Paid Last — Music / No Music

`What Wastes Their Time | Music` had already produced 1 Website Lead at NZ$4.06
during the selected 1-22 July reporting window. Early results are not enough to
judge winners.

### Processing (2)

- Busy Not Profitable — Music / No Music

### In review (2)

- Forget The 5-Year Plan — No Music
- Tired Of The Chaos — No Music

## Representative ad-level settings

Opened and inspected:
`Advantage Broad | Landing Page | Video | Nobody Tells You | No Music`.

- Switch: On; Learning
- Partnership ad: Off
- Facebook Page: Premier Business Academy
- Instagram profile: `premierbusinessacademy.co.nz`
- Threads identity: Use Instagram account
- Setup: Create ad, manual upload, single image or video
- Destination: Website
- Website URL: https://roadmap.premierbusinessacademy.co.nz/
- Browser add-on: None
- CTA: Sign up
- Website event tracking: On, using the PBA pixel
- Offline events: Off
- URL parameters: blank
- Placement warning: the preview reported that this ad will not deliver to one
  placement; Meta did not identify it in the collapsed summary.

This representative ad used five primary-text variants, five headline variants
and five description variants. The shared URL and tracking were not manually
opened on every one of the 20 ads, so they should not be described as
individually verified across all 20.

## Settings that deserve a decision

1. **Generative text/persona variations are enabled.** Meta had generated and
   selected additional persona-based text and headline variants. Some go beyond
   the manually written wording, including lines such as a 55% revenue lift and
   "profit soared." Leave this on only if Meta-authored claims are acceptable.
2. **Automatic translation is enabled, including voice.** This may alter both ad
   text and spoken delivery for users Meta assigns another language.
3. **URL parameters are blank.** Meta will still attribute through its pixel,
   but external analytics will not receive explicit campaign/ad UTMs.
4. **Creative enhancements are partially enabled.** The inspected ad had video
   touch-ups, highlights, relevant comments, reveal-details and video-effects
   features enabled, while CTA enhancement, spotlights, sticker CTA and text
   improvements were off.

## Separate unpublished drafts

Ads Manager also showed 12 unpublished draft objects: 1 ad set and 11 ads. This
batch is separate from the new 20-ad Music / No Music set. Several of the 11 ads
showed a Fix error state. Do not use Review and publish as a bulk action until
those older draft items are intentionally resolved or deselected.
