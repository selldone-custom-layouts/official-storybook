/*
 * The guest checkout walk on a live shop, up to Selldone's payment window. Never further.
 * (Galio's galio-checkout-walk.mjs with the Layout's markup.)
 *
 * For each width (1440 desktop, 390 phone), in a fresh browser (so a fresh guest basket):
 *   home → one piece in the bag (the playroom shelf's first "Add to bag") → the bag drawer → Checkout →
 *   contact (fake) → (a shop that shows no way before an address, a local delivery's distance: the address
 *   sheet first) → every delivery way the shop offers, one after the other (and a window when the way
 *   has windows) → the delivery sheet ("Compare the options") → the address sheet as the shop has it
 *   (map on: a pin, then the details; map off: the form), fake details, Save → for each way: "Place order",
 *   which only opens Selldone's payment window → a screenshot → the window's ✕. At the end the bag is
 *   emptied again.
 *
 * Nothing is ordered: nothing inside the payment window is touched but its ✕, and every Selldone /buy/
 * call is blocked here as a second guard (it would be logged as BLOCKED).
 *
 * Usage: node --use-system-ca scripts/checkout-walk.mjs [base] [out-folder]
 *   base default the skin's live domain (skins/<name>/skin.json shop.domain) · out default .shots/walk · WIDTHS=1440,390 · MODE=light|dark
 *   PW=<path to playwright's index.js> (default: the "playwright" package)
 * Prints every step, then "WALK OK" or "WALK PROBLEMS n".
 */
import { createRequire as __cr } from "node:module";
const { shopUrl: __shopUrl } = __cr(import.meta.url)("./lib/skin.cjs");
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const BASE = (process.argv[2] || __shopUrl()).replace(/\/$/, "");
const OUT = path.resolve(process.argv[3] || ".shots/walk");
const WIDTHS = (process.env.WIDTHS || "1440,820,390").split(",").map(Number);
/* WALK_PLACE: an address searched in the sheet before the pin (e.g. "Los Angeles, CA": far from the warehouse, so a
   local courier is out and a van or a post is in); WALK_WAY: a pattern; only the ways whose name matches are
   chosen and taken to the payment window (e.g. "van|truck" or "pickup"). With a pickup-only WALK_WAY no address
   is entered. */
const PLACE = process.env.WALK_PLACE || "";
const ONLY_WAY = process.env.WALK_WAY ? new RegExp(process.env.WALK_WAY, "i") : null;
const PICKUP_ONLY = !!ONLY_WAY && ONLY_WAY.test("pickup") && !ONLY_WAY.test("van");
const MODE = process.env.MODE || "light";
fs.mkdirSync(OUT, { recursive: true });

/* PW may name the package's folder or its index.js */
const pwFile = (p) => (fs.existsSync(p) && fs.statSync(p).isDirectory() ? path.join(p, "index.js") : p);
const pw = process.env.PW ? await import(pathToFileURL(pwFile(process.env.PW)).href) : await import("playwright");
const chromium = pw.chromium || pw.default?.chromium;
const browser = await chromium.launch();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let problems = 0;
const bad = (w, msg) => {
  problems++;
  console.log(`  PROBLEM ${w}: ${msg}`);
};
const slug = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 28);

for (const W of WIDTHS) {
  const H = W < 768 ? 844 : 900;
  console.log(`\n=== ${W}×${H} ${MODE}`);
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: W < 768, hasTouch: W < 768 });
  await ctx.addInitScript((mode) => {
    try {
      localStorage.setItem("ly-theme", JSON.stringify({ palette: "tan", mode }));
    } catch {}
  }, MODE);
  const page = await ctx.newPage();
  const errors = [];
  const blocked = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 240)));
  await page.route(
    (u) => !/^(localhost|127\.0\.0\.1)$/.test(u.hostname) && /\/buy\//.test(u.pathname),
    (r) => {
      blocked.push(r.request().method() + " " + r.request().url());
      return r.abort();
    },
  );
  const shot = async (name, full = false) => {
    const file = path.join(OUT, `walk-${W}-${name}.png`);
    await page.screenshot({ path: file, fullPage: full });
    console.log(`  shot ${path.basename(file)}`);
    return file;
  };
  const push = (to) => page.evaluate((p) => window.$global_router.push(p).catch(() => {}), to);
  const visible = (sel) => page.locator(sel).filter({ visible: true }).first();
  const ways = () => page.locator("#co-delivery .mcs label.mc");
  /* a way's card by its name (the list can change under the walk: a pickup point's place can bring a van in) */
  const wayCard = (name) => page.locator("#co-delivery .mcs label.mc").filter({ has: page.locator(".mc-t", { hasText: name }) }).first();
  const wayOn = (name) =>
    page.evaluate((name) => !![...document.querySelectorAll("#co-delivery .mcs label.mc")].find((l) => l.querySelector(".mc-t")?.textContent?.trim() === name)?.querySelector("input")?.checked, name);

  try {
    // ── home and one piece in the bag
    await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForSelector(".ly .ftr", { timeout: 90000 });
    /* Storybook: the playroom shelf's first story card ("Add to bag") */
    const ADD = ".ly .sb-shelf .pc-add button.add";
    await page.waitForSelector(ADD, { timeout: 60000 });
    await sleep(2500);
    const addBtn = page.locator(ADD).first();
    await addBtn.scrollIntoViewIfNeeded();
    const piece = await page.evaluate(() => document.querySelector(".ly .sb-shelf .pc")?.querySelector(".pc-t")?.textContent?.trim());
    await addBtn.click();
    console.log(`  added one piece: ${piece || "(first row)"}`);
    await sleep(3500);

    // ── the bag drawer
    await visible(".bag-btn").click();
    await page.waitForSelector("#drawer a.btn", { state: "visible", timeout: 20000 });
    await sleep(1200);
    const drawerLines = await page.evaluate(() => document.querySelectorAll("#drawer .dw-list > li").length);
    console.log(`  bag drawer open, ${drawerLines} line(s)`);
    if (!drawerLines) bad(W, "the drawer shows no line after adding a piece");
    await shot("01-drawer");
    await page.locator("#drawer .dw-acts a.btn:not(.quiet)").first().click(); /* Storybook: View bag, then Checkout */
    await page.waitForSelector("#co-details", { timeout: 45000 });
    await sleep(3500);
    console.log(`  checkout: ${await page.evaluate(() => location.pathname + location.search)}`);
    await shot("02-checkout", true);

    // ── contact (fake)
    const email = page.locator("#co-email");
    if (!(await email.count())) bad(W, "no email field");
    else if (await email.isDisabled()) bad(W, "the guest email field is disabled (no guest checkout?)");
    else {
      await email.fill("ly.walk@example.com");
      await email.blur();
    }
    const phone = page.locator("#co-phone");
    if (await phone.count()) {
      await phone.fill("+1 415 555 0199");
      await phone.blur();
    }
    await sleep(2500);

    // ── the address sheet as the shop has it (map on: a pin at the map's centre, then the details; map off: the form)
    const addressSheet = async () => {
      const addrBtn = page.locator("#co-address .addr-add, #co-address .addr-card .qlink").first();
      if (!(await addrBtn.count())) {
        bad(W, "no address card to open");
        return false;
      }
      await addrBtn.scrollIntoViewIfNeeded();
      await addrBtn.click();
      await page.waitForSelector(".k-addr__grid", { timeout: 20000 });
      await sleep(4000);
      const hasMap = await page.evaluate(() => !!document.querySelector(".k-addr__map"));
      console.log(`  address sheet open, map ${hasMap ? "on" : "off"} (the shop's option)`);
      await shot(`05-address-map-${hasMap ? "on" : "off"}`);
      if (PLACE) {
        const q = page.locator(".k-addr__search input, .k-addr__search.-inline input").filter({ visible: true }).first();
        if (await q.count()) {
          await q.fill(PLACE);
          await page.waitForSelector(".k-addr__results li button", { timeout: 15000 }).catch(() => {});
          const hit = page.locator(".k-addr__results li button").filter({ visible: true }).first();
          if (await hit.count()) {
            console.log(`  searched "${PLACE}": ${(await hit.textContent()).replace(/\s+/g, " ").trim().slice(0, 90)}`);
            await hit.click();
            await sleep(5000);
          } else bad(W, `the address search found nothing for "${PLACE}"`);
        } else bad(W, "no address search field in the sheet");
      }
      if (hasMap && !PLACE) {
        await page.locator(".k-addr__pin svg").click().catch(() => {});
        await sleep(5000);
        const found = await page.evaluate(() => document.querySelector(".k-addr__found b")?.textContent?.trim());
        console.log(`  pin placed; address under it: ${found}`);
        if (await page.evaluate(() => !!document.querySelector(".k-addr__grid.-step-map"))) {
          await page.locator(".k-sheet__foot .k-sheet__go").click();
          await sleep(1500);
        }
      }
      const fill = async (sel, v, force = false) => {
        const el = page.locator(sel).first();
        if (!(await el.count())) return;
        if (force || !(await el.inputValue())) await el.fill(v);
      };
      await fill('.k-addr__field input[autocomplete="street-address"]', "12 Walk Street");
      await fill('.k-addr__field input[placeholder="No."]', "12");
      await fill('.k-addr__field input[autocomplete="name"]', "Test Walk", true);
      await fill('.k-addr__field input[autocomplete="tel"]', "+1 415 555 0199", true);
      await fill('.k-addr__field input[autocomplete="address-level2"]', PLACE ? PLACE.split(",")[0] : "Walk City");
      await fill('.k-addr__field input[autocomplete="postal-code"]', PLACE ? "90012" : "94105");
      await fill(".k-addr__field textarea", "Ring twice (test walk)", true);
      await sleep(800);
      await shot("06-address-details");
      await page.locator(".k-sheet__foot .k-sheet__go").click();
      await sleep(5000);
      const left = await page.evaluate(() => !!document.querySelector(".k-addr__grid"));
      const missing = await page.evaluate(() => document.querySelector(".k-addr__missing")?.textContent?.trim());
      if (left) bad(W, `the address sheet stayed open after Save${missing ? ": " + missing : ""}`);
      const set = await page.evaluate(() => (document.querySelector("#co-address .addr-card")?.textContent || "(no address card)").replace(/\s+/g, " ").trim());
      console.log(`  address saved: ${set}`);
      await shot("07-address-set", true);
      return !left;
    };

    // ── every delivery way (a shop whose only ways depend on the address, a local delivery's distance, shows
    //    them once the address is in: then the address comes first)
    const listWays = () =>
      page.evaluate(() =>
        [...document.querySelectorAll("#co-delivery .mcs label.mc")].map((b) => [b.querySelector(".mc-t"), b.querySelector(".mc-f"), b.querySelector(".mc-n")].map((x) => x?.textContent?.trim() || "").join(" | ")),
      );
    let list = await listWays();
    let addressDone = false;
    /* a far address first (WALK_PLACE): the ways that reach it show once it is in */
    if (PLACE && !PICKUP_ONLY) {
      console.log(`  the address first: ${PLACE}`);
      addressDone = await addressSheet();
      await sleep(3000);
      list = await listWays();
    } else if (!PICKUP_ONLY && (!list.length || (await page.locator("#co-address .addr-add").count()))) {
      /* no address yet: the ways to the door (a courier's radius, a van) show once it is in, so it comes first */
      if (!list.length) {
        const none = await page.evaluate(() => document.querySelector("#co-delivery .ly-ship-none")?.textContent?.trim());
        console.log(`  no way before an address; the Delivery card says: ${none || "(nothing)"}`);
        if (!none) bad(W, "the Delivery card shows no way and says nothing about it");
      } else console.log(`  before an address: ${list.join(" / ")}; the address first`);
      addressDone = await addressSheet();
      await sleep(3000);
      list = await listWays();
    }
    console.log(`  delivery ways (${list.length}):`);
    list.forEach((w, i) => console.log(`    ${i + 1}. ${w}`));
    if (!list.length) bad(W, "the Delivery card shows no way");
    const wayInfo = [];
    for (let i = 0; i < list.length; i++) {
      const card = wayCard(list[i].split(" | ")[0]);
      await card.scrollIntoViewIfNeeded();
      await card.click();
      await sleep(3500);
      /* a basket update still on its way (the contact just typed) can answer over the choice: choose once more */
      if (!(await wayOn(list[i].split(" | ")[0]))) {
        console.log("    (not chosen yet: once more)");
        await card.click();
        await sleep(3500);
      }
      const st = await page.evaluate((i) => {
        const c = [...document.querySelectorAll("#co-delivery .mcs label.mc")].find((l) => l.querySelector(".mc-t")?.textContent?.trim() === i);
        const chips = [...document.querySelectorAll("#co-delivery .wins .wchip")];
        return {
          checked: !!c?.querySelector("input")?.checked,
          chips: chips.map((x) => x.textContent.trim() + (x.disabled ? " (off)" : "")),
          date: !!document.querySelector("#co-delivery .ly-ship-date input"),
          addressH: document.querySelector("#co-address h2")?.textContent?.trim(),
          receipt: (document.querySelector("#co-pay")?.innerText || "").replace(/\s+/g, " ").match(/(Delivery|Pickup|Shipping)[^$]*\$?[\d.,]*|Free/i)?.[0] || "",
        };
      }, list[i].split(" | ")[0]);
      const name = list[i].split(" | ")[0];
      console.log(`  way ${i + 1} "${name}": checked=${st.checked} windows=[${st.chips.join(", ")}]${st.date ? " date-field" : ""} address-card="${st.addressH}" receipt="${st.receipt}"`);
      if (!st.checked) bad(W, `way "${name}" did not become the chosen one`);
      /* a way without windows must not carry the window of the way before it */
      if (!st.chips.length && / · (Morning|Noon|Afternoon|Evening|Night|Instant)/.test(st.receipt)) bad(W, `way "${name}" has no windows but the receipt names one: "${st.receipt}"`);
      const firstChip = page.locator("#co-delivery .wins .wchip:not([disabled])").first();
      if (await firstChip.count()) {
        await firstChip.click();
        await sleep(2500);
        const on = await page.evaluate(() => document.querySelector("#co-delivery .wins .wchip[aria-checked='true']")?.textContent?.trim());
        console.log(`    window chosen: ${on || "NONE"}`);
        if (!on) bad(W, `way "${name}": a window did not stay chosen`);
      }
      wayInfo.push({ i, name, pickup: /pickup/i.test(st.addressH || "") });
      await page.locator("#co-delivery").screenshot({ path: path.join(OUT, `walk-${W}-03-way${i + 1}-${slug(name)}.png`) });
      console.log(`  shot walk-${W}-03-way${i + 1}-${slug(name)}.png`);
    }

    // ── the delivery sheet
    const cmp = page.locator("#co-delivery [aria-controls=dlvm]");
    if (await cmp.count()) {
      await cmp.click();
      await page.waitForSelector("#dlvm .dls .dl", { state: "visible", timeout: 15000 }).catch(() => bad(W, "the delivery sheet shows no way"));
      await sleep(1500);
      const rows = await page.evaluate(() => [...document.querySelectorAll("#dlvm .dls .dl .dl-t b")].map((b) => b.textContent.replace(/\s+/g, " ").trim()));
      console.log(`  delivery sheet: ${rows.length} row(s): ${rows.join(" / ")}`);
      await shot("04-delivery-sheet");
      const done = page.locator("#dlvm .btn").filter({ hasText: /done/i }).first();
      if (await done.count()) await done.click();
      else await page.keyboard.press("Escape");
      await sleep(1200);
    }

    // ── a way that needs an address, then the address sheet
    const home = wayInfo.find((w) => !w.pickup);
    if (addressDone) {
      /* the address is in already (it came first) */
    } else if (home) {
      await wayCard(home.name).click();
      await sleep(3000);
      const firstChip = page.locator("#co-delivery .wins .wchip:not([disabled])").first();
      if (await firstChip.count()) {
        await firstChip.click();
        await sleep(2000);
      }
      await addressSheet();
    } else if (!PICKUP_ONLY) bad(W, "no way that needs an address");

    // ── each way (or the WALK_WAY ones): Place order → the payment window → its ✕
    const chosen = ONLY_WAY ? wayInfo.filter((w) => ONLY_WAY.test(w.name)) : wayInfo;
    if (ONLY_WAY) console.log(`  ways for the payment window (${process.env.WALK_WAY}): ${chosen.map((w) => w.name).join(", ") || "none"}`);
    if (ONLY_WAY && !chosen.length) bad(W, `no way matches "${process.env.WALK_WAY}"`);
    /* the ways to the door first, a pickup last (a pickup point in the receiver hides a courier whose radius
       does not reach it, until a way to the door brings the buyer's own address back) */
    chosen.sort((a, b) => Number(a.pickup) - Number(b.pickup));
    for (const w of chosen) {
      if (!(await wayCard(w.name).count())) {
        for (const o of wayInfo.filter((x) => !x.pickup && x.name !== w.name)) {
          if (await wayCard(o.name).count()) {
            await wayCard(o.name).click();
            await wayCard(w.name).waitFor({ timeout: 15000 }).catch(() => {});
            await sleep(1500);
            break;
          }
        }
      }
      if (!(await wayCard(w.name).count())) {
        bad(W, `way "${w.name}" is no longer in the list`);
        continue;
      }
      await wayCard(w.name).scrollIntoViewIfNeeded();
      await wayCard(w.name).click();
      await sleep(3500);
      const chip = page.locator("#co-delivery .wins .wchip:not([disabled])").first();
      if ((await chip.count()) && !(await page.locator("#co-delivery .wins .wchip[aria-checked='true']").count())) {
        await chip.click();
        await sleep(2500);
      }
      const place = page.locator("#co-pay button.place");
      if (!(await place.count())) {
        bad(W, `way "${w.name}": no Place order button (${await page.evaluate(() => document.querySelector("#co-pay .rc-note")?.textContent?.trim())})`);
        continue;
      }
      const label = (await place.textContent()).replace(/\s+/g, " ").trim();
      await place.scrollIntoViewIfNeeded();
      await place.click();
      const opened = await page
        .waitForSelector(".s--storefront-master-payment-dialog .v-card", { state: "visible", timeout: 20000 })
        .then(() => true)
        .catch(() => false);
      if (!opened) {
        const miss = await page.evaluate(() => [...document.querySelectorAll(".co-alert li, .co-alert, #co-pay .rc-note")].map((x) => x.textContent.replace(/\s+/g, " ").trim()).join(" ; "));
        bad(W, `way "${w.name}": "${label}" did not open the payment window (${miss})`);
        await shot(`09-noplace-${slug(w.name)}`, true);
        continue;
      }
      await sleep(3500);
      const pay = await page.evaluate(() => {
        const d = document.querySelector(".s--storefront-master-payment-dialog");
        const r = d.getBoundingClientRect();
        return { text: d.innerText.replace(/\s+/g, " ").trim().slice(0, 300), box: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], over: d.scrollWidth > d.clientWidth + 1 };
      });
      console.log(`  way "${w.name}": "${label}" → payment window [${pay.box}]${pay.over ? " SIDE-SCROLL" : ""}: ${pay.text}`);
      if (pay.box[2] > W + 1 || pay.box[0] < -1) bad(W, `payment window is off the screen: ${pay.box}`);
      /* the button's total and the payment window's total are the same bill (a stale bill shows a different one) */
      const btnTotal = (label.match(/$[d.,]+/) || [])[0];
      const payTotal = (pay.text.match(/TOTAL PAYMENTs*($[d.,]+)/i) || [])[1];
      if (btnTotal && payTotal && btnTotal !== payTotal) bad(W, `way "${w.name}": the button says ${btnTotal}, the payment window ${payTotal}`);
      await shot(`10-payment-${slug(w.name)}`);
      const x = page.locator(".s--storefront-master-payment-dialog .v-toolbar .v-btn").last();
      if (await x.count()) await x.click();
      else await page.keyboard.press("Escape");
      await page.waitForSelector(".s--storefront-master-payment-dialog .v-card", { state: "hidden", timeout: 10000 }).catch(() => bad(W, "the payment window did not close with its ✕"));
      await sleep(1500);
    }
  } catch (e) {
    bad(W, "walk stopped: " + e.message.split("\n")[0]);
    await shot("99-stopped", true).catch(() => {});
  }

  // ── leave the guest bag empty
  try {
    await push("/basket/PHYSICAL");
    await sleep(3500);
    for (let i = 0; i < 6; i++) {
      const x = await page.$(".ly-cartpage .cr-rm");
      if (!x) break;
      await x.click();
      await sleep(2500);
    }
    const left = await page.evaluate(() => document.querySelectorAll(".ly-cartpage .cr-rm").length);
    console.log(`  bag emptied: ${left ? left + " line(s) LEFT" : "yes"}`);
    if (left) bad(W, "the bag is not empty at the end");
    await shot("11-bag-empty");
  } catch (e) {
    bad(W, "emptying the bag: " + e.message.split("\n")[0]);
  }
  if (errors.length) bad(W, "page errors: " + errors.join(" | "));
  if (blocked.length) bad(W, "BLOCKED buy calls (the walk pressed something it must not): " + blocked.join(" | "));
  await ctx.close();
}
await browser.close();
console.log(problems ? `\nWALK PROBLEMS ${problems}` : "\nWALK OK");
process.exit(problems ? 1 : 0);
