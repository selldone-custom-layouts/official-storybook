# Storybook Toy Shop — release notes

**Storybook Toy Shop** (package `storybook-toy-shop`) is a Layout of the Selldone shop **toychi** (xapi `toychi-KX4iQgu0`), built for **storybook.selldone.shop**. It is a skin of the Layout base (see [`BASE.md`](BASE.md)): everything that makes it this Layout is `skins/storybook/skin.json` and `skins/storybook/photos/`; the code, the flows and the checks are the base's.

## Setup

| Area | What is set |
| --- | --- |
| Repo | `storybook-layout`, branch `main`; remote `upstream` (selldone/storefront, fetch only, push disabled); `origin` = `selldone-custom-layouts/official-storybook` once published (`scripts/publish-github.sh`) |
| Names | `manifest.json` and `selldone-layout.json` from the skin (`package` is permanent after the first upload; the `description` must be right on the FIRST upload, Selldone keeps it) |
| Dev server | port **9176**, shop `toychi-KX4iQgu0` (`.env`); `npm run serve` (launch entry `storybook-layout`) |
| Skin | Clay, Rosewood, Olive, Indigo (brand `clay`), Fraunces over DM Sans, radius 26 / 14 px, basket word "bag" |
| Layout id | (after the first upload) |

## Home

1. **hero** (split): The shop's name and line on the left; the counter photo bleeding to the right edge of the frame, a framed inset across the seam with the best seller, the three most-ordered collections set large on the photo's dark corner (from Pralino).
2. **collections** (cards): The same four as a 2 × 2 grid of cards, the photo on top inside the card (Domino).
3. **journal** (photo, tint band): The four newest posts beside a tall photo with the big word 'Journal' (from Pralino; best last).

## Photos

| Slot | File | Size | In the build |
| --- | --- | --- | --- |
| hero | `skins/storybook/photos/hero.webp` | 1500 × 1000 | yes |
| feature | `skins/storybook/photos/feature.webp` | 1500 × 1000 | yes |
| craft | `skins/storybook/photos/craft.webp` | 1320 × 880 | yes |
| each collection | `skins/storybook/photos/col-<slug of its title>.webp` | 900 × 1200 | 0 file(s); a collection without one shows its best sellers on a plate |

## Checks

<!-- CHECKS:START -->
(none yet)
<!-- CHECKS:END -->

## Releases

| Version | Date | Layout | Deploy | What |
| --- | --- | --- | --- | --- |
