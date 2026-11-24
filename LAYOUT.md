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
Fast checks (`new-shop-kits/fast-checks` with `scripts/fast-checks.config.mjs`: 50 runs, 390 to 3840 px, light and dark, Clay, Rosewood, Olive, Indigo and the custom colours #ffff00, #00ffff and #111111, Arabic) and the guest checkout walk (`scripts/checkout-walk.mjs`, 1440 and 390 px) on https://storybook.selldone.shop, 24 Nov 2026, each through `new-shop-kits/pw-lock.sh`:

| Check | 1.0.1 | 1.0.2 | 1.0.3 | 1.0.4  | 1.0.6 | 1.0.8 |
| --- | --- | --- | --- | ---  | --- | --- |
| ring, card-edge, corner, circle, cart, currency, box, i18n (Arabic), text-col, underline, variant | 0 | 0 | 0 | 0  | 0 | 0 |
| contrast (424 states) | 0 | 0 | 0 | 3 (the post's "All posts" link at 2.1:1; the checks read a dead demo post until 1.0.4)  | 0 | 0 |
| shape | 832 (the journal band's and the product tabs' joined halves, the menu thumbs at 10 px, the checkboxes at 5 px) | 0 | 0 | 0  | 0 | 0 |
| corner (Arabic) | 13 (a hanging space past the clamped collection and post lines) | 0 | 0 | 0  | 0 | 0 |
| checkout walk | 6 (no way showed before an address, so the walk stopped there) | WALK OK | WALK OK | WALK OK  | WALK OK | WALK OK × 3 (below) |

**1.0.8** is pinned and checked on the live domain (24 Nov 2026): the full suite at **TOTAL 0** with the tablet width 820 added to the checks (516 contrast states, 173 shape states), and three guest walks at 1440, 820 and 390, each WALK OK: the default walk (the address at the warehouse, then the courier, the van and the pickup point, each to Selldone's payment window), the van to an address searched far away (`WALK_PLACE="Los Angeles, CA" WALK_WAY="van|truck"`: only the van and the pickup reach it) and the pickup point alone (`WALK_WAY=pickup`, no address). On 1.0.7 the suite found 38: 32 + 2 from the checks themselves (they looked for the phone's menu button at 820, where a tablet keeps the link row) and 4 from Selldone's pickup chip at 4.1:1 on the custom yellow and cyan (fixed in 1.0.8). The tablet pass (`scripts/tablet-probe.cjs`: orphan rows, squeezed or covered photos, stray tracks, overflow) is at **TOTAL 0** at 768, 820, 1024 and 1180, light and dark, on the dev server, and at 820 and 1024 on the live domain.

The walk: one toy in the bag → the bag drawer → Checkout → contact → the Delivery card says "Add the delivery address…" (the shop's only way to the door is a local courier within 30 km) → the address sheet (map on: the pin, the details, Save) → Toychi courier with its windows → the delivery sheet → Place order → Selldone's payment window (cash on delivery) → ✕ → the bag emptied. Nothing is ordered; every `/buy/` call is blocked.

Not reachable by the checks: the order page and its messages (they need a real order). They are drawn on the dev server from a made-up order answered inside the test browser (nothing is ordered; chat posts and `/buy/` calls are aborted).

A journal post opened fresh at its own address (`/blog/<slug>-<blog id>`) shows the Layout's post page in a browser; Selldone answers a headless browser (`HeadlessChrome` in the user agent or `sec-ch-ua`) with its own SEO page, so the checks open posts through the app's router.
<!-- CHECKS:END -->

## Releases

| Version | Date | Layout | Deploy | What |
| --- | --- | --- | --- | --- |
| 1.0.8 | 2026-11-24 | 51 | 828 | Selldone's pickup chip under the price in the tint's own ink (it showed at 4.1:1 on the custom yellow and cyan once the pickup way had a point). PROD-CHECK OK; 272 files; server js/css match (release 01M86RV5MBE0EPW7T6WN7KS0SW); pinned on domain 1278. |
| 1.0.7 | 2026-11-24 | 51 | 826 | The shop's new delivery setup: the van ("Toychi delivery van", a truck icon; "Delivered to your door" when its reach has no real limit, not "within 99,999 km"), the pickup point under its own name ("Toychi Pickup · Bryant Park", not "Pickup at Toychi Pickup …"); the bag says delivery to the door shows at checkout; the ways' cards share the row (one way fills it). Tablet pass at 768, 820, 1024 and 1180, light and dark (`scripts/tablet-probe.cjs`): no orphan rows, no squeezed or covered photos, no stray tracks. PROD-CHECK OK; 272 files; server js/css match (release 01M86NM0QY5TWG9ZXC9Z7EGEWV); pinned on domain 1278. |
| 1.0.6 | 2026-11-24 | 51 | 824 | Arabic keeps the order's messages and its payment and delivery lines in their own direction (English punctuation no longer jumps to the wrong end). PROD-CHECK OK; 272 files; server js/css match (release 01M86FT5NEKNVBY67G544SEKVH); pinned on domain 1278. |
| 1.0.5 | 2026-11-24 | 51 | 823 | The post's journal card ("All posts") in the tint's own ink: the checks reading the real post found it at 2.1:1 (the base's link colour for a dark band). PROD-CHECK OK; server js/css match (release 01M86DXV85FHMCFPSG8QYE5CNT); pinned on domain 1278. |
| 1.0.4 | 2026-11-24 | 51 | 820 | Pickup only with a pickup point (the bag, the product page and the shop's facts; Toychi's Pickup has none); the post page: the title, its lead and the date in the reading column with the cover under them (it covered the title), the opening paragraph not repeated, `/blog/<id>-<slug>` (an article or a blog id) opens the post; a post without a cover shows the toys it names on the plate (journal list, More from the journal, the home, the footer takes the newest post with a cover); the order page as the design (Order status and the receipt left; Delivery, Payment and the messages right; Share order in plain case); checks read the real post. PROD-CHECK OK (with the post); server js/css match (release 01M86BJACP7MFQKKDK2CJPKM9F); pinned on domain 1278. |
| 1.0.3 | 2026-11-24 | 51 | 814 | The "more" arrows' class is `sb-fl` (it was `.fl`, the field labels' class: the delivery window's label was squeezed to 17 px and field labels would have been mirrored in Arabic); the address sheet's Save and Cancel as capsules in normal case; "Add discount code" in normal case. PROD-CHECK OK; server js/css match (release 01M85G7GSFH73MAE43S91C59JF); pinned on domain 1278. |
| 1.0.2 | 2026-11-24 | 51 | 812 | Shapes on the 26/14 scale everywhere (the journal band on the home and the product tabs as one panel each, the menu thumbs and the filter checkboxes on the inner radius); Arabic: the collection and post lines clamp without a hanging space; the Delivery card and sheet say what to do while no way shows (a local delivery waits for the address) or when none reaches it; the order page in the design's words (Receipt, Order placed). PROD-CHECK OK; server js/css match (release 01M85ENVKB26W5A3GGHPP5PQ2B); pinned on domain 1278. |
| 1.0.1 | 2026-11-24 | 51 | 809 | The design's three checkout steps (Bag, Delivery, Payment); Contact's help band, About as one panel, Terms and Privacy in a panel, the deals band and About tiles on light grounds; the sign-in wordmark as the header's; the search panel on focus with popular words; Saved toys as story cards; the order page, messages and account panels; the Theme row and legal row readable on the light footer; words on the tint in its own ink; light photo plates in dark mode; Arabic keeps the shop's words in their own direction; cash on delivery named from the gateway's flag; shape-check reads the skin's 26/14 scale. PROD-CHECK OK; server js/css match (release 01M85CFCCPPPP52311PF3G3WE1); pinned on domain 1278. |
| 1.0.0 | 2026-11-24 | 51 | 807 | First release: the Storybook design on the base (header, Explore drawer, footer with the Theme row, the nine home sections, the story card, the listing, the product page, bag drawer and page, checkout, compare, journal, post, 404, toy words and drawings). PROD-CHECK OK on storybook.selldone.shop; server copy: extracting false, error null, shop.js and shop.css match (release 01M85AJESEM3B82TGQ04R826DZ, 272 files). Pinned by the coordinator on domain 1278. |
