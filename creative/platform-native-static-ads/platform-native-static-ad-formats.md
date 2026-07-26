# Platform-native static ad formats

Source studied: https://www.instagram.com/p/DbHjteVSKyc/

Studied on: 2026-07-27

Creator: James Wastell / Optamize

## The eight formats

| Format | What makes it stop the scroll | Best use |
| --- | --- | --- |
| Fake tweet | Looks like an organic opinion or proof post instead of designed advertising. | A direct founder insight, objection or sharp diagnosis. |
| Grid dump | Looks like four photos from a camera roll rather than one polished campaign shoot. | Showing the avatar, product-in-use, work environment or several real moments at once. |
| Fake apology | “We’re sorry” opens a curiosity gap; the confession reveals the offer. | Launches, lead magnets, price drops or a damaging admission. |
| Forwarded email | Borrows the familiar trust and curiosity of an inbox subject line. | Founder notes, a useful warning, a forwarded insight or a short offer reveal. |
| Would you rather | Turns the ad into a self-diagnosis rather than a sales pitch. | Old path versus new path, pain versus outcome, or two operating choices. |
| News stunt | Uses an editorial/broadcast visual hierarchy to make the topic feel important. | Founder commentary, market shifts or a strong industry diagnosis. |
| Pick a card | Feels interactive and pre-qualifies the avatar before the click. | Industry, pain, stage, desired outcome or product selection. |
| Giant product | Makes the product physically impossible to ignore and creates instant curiosity. | Books, guides, packaging, products or a tangible offer asset. |

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
