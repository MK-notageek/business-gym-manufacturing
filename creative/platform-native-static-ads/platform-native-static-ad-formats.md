# Platform-native static ad formats

Source studied: https://www.instagram.com/p/DbHjteVSKyc/

Studied on: 2026-07-27

Creator: James Wastell / Optamize

## The eight formats

| Format | Reel reference aesthetic | Best use |
| --- | --- | --- |
| Fake tweet | A real dark-mode X post floating over a casual, full-bleed product or use-case photo. It is not a white testimonial card. | A direct founder insight, objection or sharp diagnosis. |
| Grid dump | Three rough vertical camera-roll clips with platform-style white caption strips crossing the panels. It is not a polished 2×2 brand collage. | Showing the avatar, product-in-use, work environment or several real moments at once. |
| Fake apology | Warm cream paper, an enormous green “WE’RE SO SORRY!”, small plain body copy and the product tucked into the lower-right corner. | Launches, lead magnets, price drops or a damaging admission. |
| Forwarded email | A tightly cropped, zoomed Gmail message with a curiosity-led subject, sender row and plain body. No decorated email card or CTA button. | Founder notes, a useful warning, a forwarded insight or a short offer reveal. |
| Would you rather | Sparse white comparison card: small brand/category line, large question, two product or situation images, thin divider, A/B markers and one bold bottom colour sweep. | Old path versus new path, pain versus outcome, or two operating choices. |
| News stunt | A candid talking-head or workplace frame with a TV-news lower third: red category slug and a very large black headline on white. | Founder commentary, market shifts or a strong industry diagnosis. |
| Pick a card | Loud old-school game-board creative: yellow paper, green headline bars, starburst, repeated card backs and an instruction to tap. | Industry, pain, stage, desired outcome or product selection. |
| Giant product | A raw surreal photo where a person’s arms and legs visibly wrap around an impossibly oversized physical product. No headline box is needed. | Books, guides, packaging, products or a tangible offer asset. |

## Non-negotiable execution rule

The eight formats are eight separate visual worlds. Do not put them through one
brand template. No shared footer, shared gradient, repeated CTA pill, repeated card
radius or repeated logo position should connect the set.

Model the reference artifact first and insert the offer second:

1. Reproduce the platform or media object closely enough to be recognised with no explanation.
2. Preserve its ordinary spacing, typography, colour and imperfections.
3. Replace only the subject, copy and product with the client’s truthful material.
4. Remove every decorative element that exists only to make the piece feel like an ad.

## What the Reel is really teaching

- Native-looking beats over-designed when the feed is full of polished ads.
- The format is the visual hook; the copy still needs one concrete tension and one clear action.
- Proof, diagnosis and curiosity are stronger than generic motivational claims.
- The creative should make sense without sound and at a glance on mobile.
- The format should be reusable. A winner should produce at least ten hook or copy variants.

## AdvLaunch guardrails

- Use the visual grammar without inventing facts.
- A fake tweet should carry the founder’s real point of view, not a fabricated customer quote.
- A forwarded email should come from the brand or founder unless a real email has permission to be shown.
- A news stunt must be visibly brand-owned. Do not impersonate a third-party newsroom or imply earned media that did not happen.
- Do not create fake reviews, fake results, fake discounts, fake urgency or fake scarcity.
- Logos are opt-in, not default. Most native formats should have no client logo.
- Never manufacture a shorthand logo. If branding is required, use the approved full asset exactly as supplied.
- For PBA, use the real `PBA / PREMIER BUSINESS ACADEMY` wordmark. Never substitute a single “P”.
- Keep one audience, one problem, one promise and one CTA per asset.
- Default feed size: 1080 × 1350 px (4:5).
- Keep critical copy inside a 72 px safe margin and readable at phone size.

## AdvLaunch production workflow

1. Confirm the live offer and public destination before writing the creative.
2. Pull the best-performing pain, proof and CTA from the live campaign or source assets.
3. Build 70% from proven hooks, 20% winner-adjacent formats and 10% experiments.
4. Name every ad with `<offer>-img<nn>-<angle>`.
5. Put the matching image and `origin.md` inside the same ad folder.
6. Scan the image at thumbnail size: audience, tension and action must still be obvious.
7. Launch each format as its own ad so Meta data maps back to the exact folder.

## First applications

- Trade Map: `external/bernard/live-projects/trades-roadmap/ads/`
- Manufacturers Profit Roadmap: `external/bernard/live-projects/factory-roadmap/ads/`
- Reusable renderer: `brain/learned/render-platform-native-static-ads.mjs`
- Image-generation prompt record: `brain/learned/platform-native-static-ad-image-prompts.md`
