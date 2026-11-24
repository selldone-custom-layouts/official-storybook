// node scripts/order-preview.cjs <outdir> <widths> — the Storybook order page and its messages, drawn on the dev server from a
// made-up order answered inside this test browser only (Play Lab's flow-more.cjs approach): nothing is ordered, the
// order request never leaves the browser, chat posts and every /buy/ call are aborted.
// env: ORIGIN (default http://localhost:9176), DARK=1, AR=1, CHAT=0 (no messages), STATE=CheckQueue|PreparingOrder|SentOrder|ToCustomer
const { chromium } = require(process.env.PW || (() => { try { return require.resolve("playwright"); } catch { return require("path").resolve(__dirname, "../../kalio-marketplace/node_modules/playwright"); } })());
const fs = require("fs");
const path = require("path");
const OUT = process.argv[2];
const WIDTHS = (process.argv[3] || "1440,390").split(",").map(Number);
const ORIGIN = process.env.ORIGIN || "http://localhost:9176";
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch();
  for (const W of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: W, height: W < 600 ? 844 : 900 }, userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36" });
    await ctx.addInitScript(([dark, ar]) => {
      window.__THEME_SWITCHER_SHOP__ = { id: 16144 };
      try {
        localStorage.setItem("storybook-splash", "1");
        if (dark) localStorage.setItem("storybook-theme", JSON.stringify({ palette: "clay", mode: "dark" }));
        if (ar) { localStorage.setItem("local-shop-toychi-KX4iQgu0", "ar"); localStorage.setItem("storybook-dev-languages", "ar"); }
      } catch {}
    }, [process.env.DARK === "1", process.env.AR === "1"]);
    await ctx.route(/selldone\.com\/.*\/buy\//, (r) => r.abort());
    const p = await ctx.newPage();
    p.setDefaultTimeout(60000);
    p.on("pageerror", (e) => console.log("PAGEERROR", e.message.slice(0, 200)));
    await p.goto(ORIGIN + "/", { waitUntil: "load" });
    await p.waitForSelector(".ly .ftr", { timeout: 90000 });
    await p.waitForTimeout(2500);
    const products = (await p.evaluate(async (ids) => {
      const out = [];
      for (const id of ids) {
        const r = await fetch(window.XAPI.GET_PRODUCT_INFO(window.$storefront.name, id));
        out.push(r.ok ? (await r.json()).product : null);
      }
      return out;
    }, [741339, 741335])).filter(Boolean);
    const now = new Date();
    const iso = (d) => d.toISOString().slice(0, 19).replace("T", " ");
    const items = products.map((x, i) => ({ id: i + 1, product_id: x.id, product: x, variant: null, variant_id: null, count: i === 0 ? 1 : 2, price: x.price, dis: 0, currency: x.currency || "USD", offer_amount: 0 }));
    const sum = items.reduce((s, it) => s + it.price * it.count, 0);
    const chat =
      process.env.CHAT === "0"
        ? []
        : [
            { body: "Hello! Could the train set be wrapped as a gift?", date: iso(new Date(now - 50 * 60e3)) },
            { body: "Of course. We'll wrap it in paper and add a blank card for your note.", date: iso(new Date(now - 35 * 60e3)), officer: { name: "Toychi" } },
          ];
    const basket = {
      id: 900001, type: "PHYSICAL", status: "COD", delivery_state: process.env.STATE || "PreparingOrder", currency: items[0]?.currency || "USD", code: "mock",
      created_at: iso(new Date(now - 2 * 3600e3)), updated_at: iso(now), reserved_at: iso(new Date(now - 2 * 3600e3)), delivery_at: null,
      price: sum, tax: 0, tax_included: false, tax_shipping: 0, delivery_price: 0, discount: 0,
      items,
      receiver_info: { name: "Sample Buyer", address: "1544 Madison Avenue", no: "12", city: "Memphis", state: "TN", postal: "38104", country: "US", phone: "+19015550100", location: { lat: 35.1387, lng: -90.0095 } },
      delivery_info: { type: "Motorbike", time_spans: ["Morning"] }, transportation: { type: "Motorbike" },
      payment: null, payment_type: "cod", chat, gift_cards: [], transactions_pending: [], vendor_orders: [], billing: null, user: null, customer: null, form: null,
    };
    await ctx.route(/\/baskets\/900001(\/|\?|$)/, (r) => {
      if (r.request().method() === "GET" && /\/baskets\/900001(\?|$)/.test(r.request().url())) return r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ basket }) });
      return r.abort();
    });
    await p.evaluate((r) => window.$global_router.push(r), "/orders/physical/SM-900001");
    await p.waitForTimeout(8000);
    const tag = `${W}${process.env.DARK === "1" ? "-dark" : ""}${process.env.AR === "1" ? "-ar" : ""}${process.env.CHAT === "0" ? "-nochat" : ""}`;
    await p.screenshot({ path: path.join(OUT, `order-${tag}.png`), fullPage: true });
    console.log("order", tag, await p.evaluate(() => (document.querySelector(".ly .od, .ly-order, main")?.innerText || "").replace(/\s+/g, " ").slice(0, 260)));
    await ctx.close();
  }
  await b.close();
})();
