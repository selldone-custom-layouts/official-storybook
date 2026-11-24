// node scripts/tablet-probe.cjs <outdir> [widths=768,820,1024,1180]  (dev server :9176, or BASE=...; DARK=1; PAGES=name=/path,...)
// The tablet pass: every page (and its drawers and sheets) at tablet widths. For each state it measures
//   overflow  - the page scrolls sideways (document wider than the window), or a box sticks out past it
//   orphan    - a short row of cards (a rail of up to 8 cards) whose last row holds fewer cards than the first (3 + 1)
//   photo     - a card's photo narrower than 120px, or a button lying over a card's photo
//   track     - a visible scroll bar inside the page (a box that scrolls with a bar showing)
// and saves a screenshot per state (JPEG, full page; drawers at the window). Prints one line per finding and "TOTAL n".
// Pages are opened through the app's router (a fresh load of /product/ or /blog/ answers headless browsers with
// Selldone's SEO page on the live shop). Nothing is ordered; /buy/ calls are aborted.
"use strict";
const path = require("path");
const fs = require("fs");
const { chromium } = require(process.env.PW || (() => { try { return require.resolve("playwright"); } catch { return path.resolve(__dirname, "../../kalio-marketplace/node_modules/playwright"); } })());
const SK = JSON.parse(fs.readFileSync(path.join(__dirname, "../checks/fast-checks.json"), "utf8"));
const OUT = process.argv[2] || ".shots/tablet";
const WIDTHS = (process.argv[3] || "768,820,1024,1180").split(",").map(Number);
const BASE = (process.env.BASE || "http://localhost:9176").replace(/\/$/, "");
const DARK = process.env.DARK === "1";
/* the skin's own test inputs (a collection, two products, a search word, a post, a comparison) */
const C = JSON.parse(fs.readFileSync(path.join(__dirname, "../skins", require("./lib/skin.cjs").activeName(path.resolve(__dirname, "..")), "skin.json"), "utf8")).checks || {};
const PAGES = (
  process.env.PAGES ||
  [
    "home=/",
    `category=${C.category || "/"}`,
    "all=/?search=",
    `search=/?search=${C.search || "toy"}`,
    "deals=/?filter=%7B%22only_has_discount%22%3Atrue%7D",
    `product=/product/${C.product}`,
    `compare=/comparison?list=${C.compare || ""}`,
    "blog=/blog",
    `article=${C.article || "/blog"}`,
    "about=/about-us",
    "contact=/contact-us",
    "faq=/faq",
    "terms=/terms",
    "404=/no-such-page",
    "cart=/basket/PHYSICAL",
    "checkout=/basket/PHYSICAL?step=checkout",
    "account=/user",
    "saved=/user/favorites",
    "orders=/user/orders/physical",
  ].join(",")
)
  .split(",")
  .map((s) => [s.slice(0, s.indexOf("=")), s.slice(s.indexOf("=") + 1)]);
/* drawers and sheets, opened on the page named first */
const STATES = [
  ["home", "menu", ".sb-nav [aria-controls=menu], .sb-hdr [aria-controls=menu], button[aria-controls=menu]"],
  ["home", "search", "#sb-q"],
  ["home", "region", ".sb-region, .rg-pill"],
  ["home", "bag", ".bag-btn"],
  ["category", "filters", ".fbtn"],
  ["category", "quick", ".sb-ql"],
  ["account", "signin", ".acc-nav button.an"],
];
fs.mkdirSync(OUT, { recursive: true });

function audit() {
  const out = [];
  const W = document.documentElement.clientWidth;
  const name = (el) => (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : el.tagName.toLowerCase());
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return false;
    for (let p = el; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.display === "none" || s.visibility === "hidden" || +s.opacity === 0) return false;
    }
    return true;
  };
  if (document.documentElement.scrollWidth > W + 1) out.push(`overflow: the page is ${document.documentElement.scrollWidth - W}px wider than the window`);
  const wide = [];
  for (const el of document.querySelectorAll("body *")) {
    const r = el.getBoundingClientRect();
    if (r.width && r.right > W + 1 && vis(el)) {
      /* inside a box that clips or scrolls sideways (a carousel): not past the window */
      let clipped = false;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (s.overflowX !== "visible" && p.getBoundingClientRect().right <= W + 1) { clipped = true; break; }
        if (s.position === "fixed") break;
      }
      if (!clipped) wide.push(name(el) + " right " + Math.round(r.right));
    }
  }
  if (wide.length) out.push("overflow: " + [...new Set(wide)].slice(0, 6).join(" | "));
  /* rails of cards: the last row shorter than the first */
  const CARD = ".pc, .sb-room, .sb-post, .bc, .cc, .deal, .bf-card";
  const parents = new Set([...document.querySelectorAll(CARD)].filter(vis).map((c) => c.parentElement));
  for (const p of parents) {
    const kids = [...p.children].filter((c) => c.matches(CARD) && vis(c));
    if (kids.length < 2 || kids.length > 8) continue;
    const s = getComputedStyle(p);
    if (s.overflowX === "auto" || s.overflowX === "scroll" || s.flexWrap === "nowrap" && s.display.includes("flex")) continue;
    const rows = new Map();
    for (const k of kids) {
      const t = Math.round(k.getBoundingClientRect().top / 4);
      rows.set(t, (rows.get(t) || 0) + 1);
    }
    const counts = [...rows.values()];
    if (counts.length > 1 && counts[counts.length - 1] < counts[0]) out.push(`orphan: ${name(p)} ${counts.join(" + ")} (${kids.length} cards)`);
  }
  /* card photos */
  for (const c of document.querySelectorAll(".pc")) {
    if (!vis(c)) continue;
    const ph = c.querySelector(".pc-ph, .plate, .pc-img, img");
    if (!ph) continue;
    const r = ph.getBoundingClientRect();
    if (r.width < 120) out.push(`photo: ${name(c)} photo ${Math.round(r.width)}px wide`);
    for (const b of c.querySelectorAll("button, .btn, a.qlink")) {
      if (!vis(b) || ph.contains(b)) continue;
      const q = b.getBoundingClientRect();
      const ix = Math.min(q.right, r.right) - Math.max(q.left, r.left), iy = Math.min(q.bottom, r.bottom) - Math.max(q.top, r.top);
      if (ix > 4 && iy > 4) { out.push(`photo: ${name(b)} lies over a card photo`); break; }
    }
  }
  /* visible scroll bars inside the page */
  for (const el of document.querySelectorAll("body *")) {
    const s = getComputedStyle(el);
    const scrollY = (s.overflowY === "auto" || s.overflowY === "scroll") && el.scrollHeight > el.clientHeight + 1;
    const scrollX = (s.overflowX === "auto" || s.overflowX === "scroll") && el.scrollWidth > el.clientWidth + 1;
    if (!scrollY && !scrollX) continue;
    if (!vis(el)) continue;
    const barY = el.offsetWidth - el.clientWidth - parseFloat(s.borderLeftWidth) - parseFloat(s.borderRightWidth);
    const barX = el.offsetHeight - el.clientHeight - parseFloat(s.borderTopWidth) - parseFloat(s.borderBottomWidth);
    if ((scrollY && barY > 2) || (scrollX && barX > 2)) out.push(`track: ${name(el)} shows a ${scrollX && barX > 2 ? "sideways" : "vertical"} scroll bar`);
  }
  return [...new Set(out)];
}

(async () => {
  const b = await chromium.launch();
  let total = 0;
  for (const W of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: W, height: W < 900 ? 1100 : 860 }, deviceScaleFactor: 1, hasTouch: W < 1024 });
    await ctx.addInitScript(([dark, key, storage]) => {
      window.__THEME_SWITCHER_SHOP__ = { id: 16144 };
      try {
        localStorage.setItem(storage.splash, "1");
        if (dark) localStorage.setItem(key, JSON.stringify({ palette: "clay", mode: "dark" }));
      } catch {}
    }, [DARK, SK.storage.theme, SK.storage]);
    await ctx.route(/selldone\.com\/.*\/buy\//, (r) => r.abort());
    const p = await ctx.newPage();
    p.on("pageerror", (e) => console.log(`  PAGEERROR ${W}: ${e.message.slice(0, 160)}`));
    await p.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 120000 });
    await p.waitForSelector(".ly .ftr", { timeout: 120000 });
    await p.waitForTimeout(3000);
    const go = async (to, again = true) => {
      try {
        await p.keyboard.press("Escape").catch(() => {});
        await p.evaluate((to) => window.$global_router.push(to).catch(() => {}), to);
        await p.waitForTimeout(4500);
        await p.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
          scrollTo(0, 0);
        });
        await p.waitForTimeout(900);
      } catch (e) {
        /* the page reloaded under us (a dev server's reload, a lost connection): start again from the home once */
        if (!again) throw e;
        await p.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 120000 });
        await p.waitForSelector(".ly .ftr", { timeout: 120000 });
        await p.waitForTimeout(3000);
        await go(to, false);
      }
    };
    const tag = `${W}${DARK ? "-dark" : ""}`;
    const report = async (label, file, full) => {
      const found = await p.evaluate(audit);
      total += found.length;
      console.log(`${label.padEnd(18)} ${tag.padEnd(9)} ${found.length ? "ISSUES " + found.length : "ok"}`);
      for (const f of found) console.log("    " + f);
      await p.screenshot({ path: path.join(OUT, `${file}-${tag}.jpg`), type: "jpeg", quality: 72, fullPage: full });
    };
    let filled = false;
    for (const [n, to] of PAGES) {
      /* the bag and the checkout with two toys in a guest bag (nothing is ordered; the bag stays for this context) */
      if ((n === "cart" || n === "checkout") && !filled) {
        filled = true;
        for (const id of [C.product, C.product2].filter(Boolean)) {
          await go("/product/" + id);
          const add = p.locator(".pd-buy button.btn.add, button.btn.add").filter({ visible: true }).first();
          if (await add.count()) { await add.click().catch(() => {}); await p.waitForTimeout(2200); await p.keyboard.press("Escape").catch(() => {}); }
        }
      }
      await go(to);
      await report(n, n, true);
      for (const [on, st, sel] of STATES.filter((s) => s[0] === n)) {
        const btn = p.locator(sel).filter({ visible: true }).first();
        if (!(await btn.count())) { console.log(`${(n + ":" + st).padEnd(18)} ${tag.padEnd(9)} (no opener)`); continue; }
        await btn.click().catch(() => {});
        await p.waitForTimeout(1500);
        await report(n + ":" + st, `${n}-${st}`, false);
        await p.keyboard.press("Escape").catch(() => {});
        await p.waitForTimeout(600);
        await go(to);
      }
    }
    await ctx.close();
  }
  await b.close();
  console.log("TOTAL " + total);
})();
