/*
 * Storybook (the Toychi "storybook" design) helpers shared by the header, the cards, the home and the pages.
 * Live data only: nothing here names a product, a price, a collection or an age of this shop.
 *
 * - saved toys: Selldone's own wishlist (a signed-in buyer), one reactive map so every heart on the page agrees;
 *   a guest's heart opens the sign-in sheet (the app's need-login event);
 * - the toy's age: the spec row whose key says "age" (e.g. "Suggested Age"), as the shop wrote it;
 * - the ages and the price bands the home offers, read from the live catalogue.
 */
import { reactive } from "vue";
import { EventBus } from "@selldone/components-vue/utils/events/EventBus.ts";
import { specGroups } from "../ly";

declare const window: any;

/* ━━━━━━━━━━━━ Saved toys (Selldone's wishlist) ━━━━━━━━━━━━ */
export const saved = reactive<Record<number, boolean>>({});

export function isSaved(p: any): boolean {
  if (!p) return false;
  return saved[p.id] ?? !!p.wishlist;
}

export function toggleSaved(vm: any, p: any): Promise<void> {
  if (!p) return Promise.resolve();
  const user = vm?.$store?.getters?.getUser;
  if (!user) {
    EventBus.$emit("need-login", true);
    return Promise.resolve();
  }
  const on = isSaved(p);
  const shop = window.$storefront.name;
  saved[p.id] = !on;
  const call = on ? window.axios.delete(window.XAPI.DELETE_WISHLIST_PRODUCT(shop, p.id)) : window.axios.put(window.XAPI.PUT_WISHLIST_PRODUCT(shop, p.id));
  return call
    .then(({ data }: any) => {
      if (data?.error) saved[p.id] = on;
    })
    .catch(() => {
      saved[p.id] = on;
    });
}

export function savedRoute() {
  return { name: window.$storefront.routes.USER_FAVORITES_PAGE };
}

/* ━━━━━━━━━━━━ Ages ━━━━━━━━━━━━ */
const AGE_KEY = /\bage\b|\bages\b|سن|عمر/i;

/** The toy's age as the shop wrote it ("5–7 years"), or "". */
export function ageOf(p: any): string {
  for (const g of specGroups(p)) for (const [k, v] of g.rows) if (AGE_KEY.test(k)) return v;
  return "";
}

/** The spec key the shop uses for the age ("Suggested Age"), or "". */
export function ageKey(products: any[]): string {
  for (const p of products) for (const g of specGroups(p)) for (const [k] of g.rows) if (AGE_KEY.test(k)) return k;
  return "";
}

/** The first number of an age, in months ("6–12 months" 6, "3–4 years" 36, "13+ years" 156): for ordering. */
export function ageMonths(v: string): number {
  const m = String(v || "").match(/(\d+(?:\.\d+)?)/);
  if (!m) return 9999;
  const n = parseFloat(m[1]);
  return /month|mo\b|شهر/i.test(v) ? n : n * 12;
}

/** A short label for an age chip: "6–12 months" -> "6–12 mo.", "12–24 months" -> "1–2 yrs", "3–4 years" -> "3–4 yrs". */
export function ageShort(v: string, t: (k: string, en: string, a?: any) => string): string {
  const s = String(v || "").trim();
  const m = s.match(/^(\d+)\s*(?:[–-]\s*(\d+))?\s*(\+)?\s*(months?|mo\.?|years?|yrs?)\b/i);
  if (!m) return s;
  let a = Number(m[1]);
  let b = m[2] ? Number(m[2]) : null;
  const plus = !!m[3];
  let unit = /^m/i.test(m[4]) ? "m" : "y";
  if (unit === "m" && a >= 12 && a % 12 === 0 && (b == null || b % 12 === 0)) {
    a = a / 12;
    b = b == null ? null : b / 12;
    unit = "y";
  }
  const range = b != null ? `${a}–${b}` : `${a}${plus ? "+" : ""}`;
  return unit === "m" ? t("sb.age.mo", "{range} mo.", { range }) : t("sb.age.yrs", "{range} yrs", { range });
}

/** Every age the catalogue uses, youngest first, each with its products. */
export function agesOf(products: any[]): { value: string; n: number }[] {
  const map = new Map<string, number>();
  for (const p of products) {
    const a = ageOf(p);
    if (a) map.set(a, (map.get(a) || 0) + 1);
  }
  return [...map.entries()].map(([value, n]) => ({ value, n })).sort((x, y) => ageMonths(x.value) - ageMonths(y.value));
}

/** Three price bands from the live prices: the round amounts under which about a third, two thirds and every
    product fall ("Up to $75", "Up to $150", "Up to $250"). Fewer when the prices are close together. */
export function priceBands(prices: number[]): number[] {
  const list = prices.filter((x) => x > 0).sort((a, b) => a - b);
  if (!list.length) return [];
  const round = (x: number) => {
    const step = x <= 20 ? 5 : x <= 100 ? 25 : x <= 500 ? 50 : x <= 2000 ? 250 : 1000;
    return Math.ceil(x / step) * step;
  };
  const q = (f: number) => list[Math.min(list.length - 1, Math.floor(f * (list.length - 1)))];
  const out: number[] = [];
  for (const v of [round(q(0.34)), round(q(0.67)), round(list[list.length - 1])]) if (!out.includes(v)) out.push(v);
  return out;
}

/* ━━━━━━━━━━━━ The journal's newest posts (read once, shared by the footer and the home) ━━━━━━━━━━━━ */
import { journalPage } from "../../kalio/pages/kalio-journal";

export const posts = reactive({ list: [] as any[], ready: false });
let postsRead = false;
export function loadPosts(): void {
  if (postsRead) return;
  postsRead = true;
  journalPage({ page: 1, limit: 4 })
    .then(({ articles }) => {
      posts.list = articles || [];
      posts.ready = true;
    })
    .catch(() => {
      posts.ready = true;
    });
}

/** A post's cover (Selldone's image of the post), or null. */
export function postImage(b: any): string | null {
  return b?.image ? (window.CDN?.GET_SHOP_IMAGE_PATH ? window.CDN.GET_SHOP_IMAGE_PATH(b.image, null) : b.image) : null;
}

/* ━━━━━━━━━━━━ A post without a cover: the toys it names, as on the design's journal cards ━━━━━━━━━━━━
   The journal list carries no text, so the post is read once (one request per coverless post) and the toys its
   text names are found in the catalogue (productsIn). No toy named: the card keeps the sparkle on its plate. */
import { journalPost, productsIn } from "../../kalio/pages/kalio-journal";
import { ly, loadDm } from "../ly";

const cutsRead = reactive({} as Record<string, string>);
export function postCuts(b: any): any[] {
  if (!b || b.image) return [];
  const key = String(b.parent_id || b.id || "");
  if (!key) return [];
  if (!(key in cutsRead)) {
    cutsRead[key] = "";
    loadDm();
    journalPost(key)
      .then((data: any) => {
        cutsRead[key] = String(data?.article?.body || "");
      })
      .catch(() => {});
  }
  return cutsRead[key] && ly.products.length ? productsIn(cutsRead[key], ly.products, 2) : [];
}
