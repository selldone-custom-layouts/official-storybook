# Storybook Toy Shop — release notes

**Storybook Toy Shop** (package `storybook-toy-shop`) is a Layout of the Selldone shop **toychi** (xapi `toychi-KX4iQgu0`), built for **storybook.selldone.shop**. It is a skin of the Layout base (see [`BASE.md`](BASE.md)): everything that makes it this Layout is `skins/storybook/skin.json` and `skins/storybook/photos/`; the code, the flows and the checks are the base's.

## Setup

| Area | What is set |
| --- | --- |
| Repo | `storybook-layout`, branch `main`; remote `upstream` (selldone/storefront, fetch only, push disabled); `origin` = `selldone-custom-layouts/official-storybook` once published (`scripts/publish-github.sh`) |
| Names | `manifest.json` and `selldone-layout.json` from the skin (`package` is permanent after the first upload; the `description` must be right on the FIRST upload, Selldone keeps it) |
| Dev server | port **9176**, shop `toychi-KX4iQgu0` (`.env`); `npm run serve` (launch entry `storybook-layout`) |
| Skin | Clay, Rosewood, Olive, Indigo (brand `clay`), Fraunces over DM Sans, radius 26 / 14 px, basket word "bag" |
| Layout id | **51** |

## Home

The approved Storybook design (Toychi Layout Mockups/storybook), drawn from live data only (`components/ly/sb/home/`):

1. **sb-welcome**: the hero photo in a 26 px panel with a capsule to the most-ordered collection, beside "A little more time to *play.*" and Explore the toy shop.
2. **sb-rooms** (wash band): three collections as cards, each collection's own image on an arched tint, its name and description.
3. **sb-shelf · playroom**: four best sellers, one collection after another (story cards).
4. **sb-ages**: Find the right fit, every age the toys' own spec names, youngest first (opens `?age=`).
5. **sb-reading**: the journal's newest post on the tint beside the feature photo.
6. **sb-craft** (wash band): the craft photo beside a making collection and Shop <collection>.
7. **sb-shelf · quiet**: four toys of the calm collection (puzzles, games, books…), Browse <collection>.
8. **sb-budget** (wash band): three price bands from the live prices (opens `?price=-N`).
9. **sb-journal**: the four newest posts (last section).

Every other page keeps the base's flows in the Storybook dress (`style/ly/sb.css`, loaded last): the header (search, centred wordmark, saved, account, bag pill; the link row and the Explore drawer), the footer (Find a toy, Here to help, the journal card, the Theme row), the story card, the listing (title panel with the collection's own image, collection chips, the filter column from the real spec, the no-deals state with "Good finds under <price>"), the product page (gallery, the toy's own words and first facts, a sticky buy box with save and compare, Specifications / About this toy / Reviews), the bag drawer and page, the three-step checkout, compare, the journal, About, Terms, Privacy, Contact, FAQ and the 404. The base's pastry words and line drawings are replaced with a toy shop's (skin words, `ly-icons.ts`).

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
| 1.0.0 | 2026-11-24 | 51 | 807 | First release: the Storybook design on the base (header, Explore drawer, footer with the Theme row, the nine home sections, the story card, the listing, the product page, bag drawer and page, checkout, compare, journal, post, 404, toy words and drawings). PROD-CHECK OK on storybook.selldone.shop; server copy: extracting false, error null, shop.js and shop.css match (release 01M85AJESEM3B82TGQ04R826DZ, 272 files). Not pinned yet. |
