<!--
  About (design/about-b.html, pages-read.js about): the
  title band ("About <shop>", the counter's address); "Who we are" beside
  the About photo (skins/<name>/photos/about.webp; without it, the shop's
  own pastries spread on the counter), with the counter's lines (address,
  hours, the way to pay); three panels — the counter, a collection photo,
  "Sold one by one"; the collections with their photos; and a collage of
  pastries with "A small table of favourites".

  The story is the shop's own About page (Selldone dashboard › Shop ›
  Profile) when it has written one; until then sample copy built only from
  the shop's facts (its address, collections, delivery ways and way to
  pay), with the label "Sample text — the shop has not written this page
  yet". Never invented history, awards, names or counts.
-->
<template>
  <div class="ly ly-about">
    <ly-pt :crumbs="[{ label: t('ly.rd.about', 'About') }]" :lead="bandLead" :title="t('ly.rd.aboutT', 'About {shop}', { shop: name })" art="croissant" art2="macaron" />

    <!-- Storybook (about.html): one panel, the story beside the skin's feature photo; the shop's own facts under the words -->
    <section aria-labelledby="ab-h" class="sb-about">
      <div class="wrap">
        <div class="sb-about-panel">
          <ly-photo :alt="t('sb.home.featureAlt', 'Hands building a little town')" class="sb-about-ph" name="feature">
            <template v-if="spread.length" #fallback><ly-cuts :products="spread" kind="spread" /></template>
          </ly-photo>
          <div class="ab-tx">
            <p class="eyebrow">{{ t("sb.about.eyebrow", "Our story") }}</p>
            <h2 id="ab-h" class="h2">{{ own ? t("ly.rd.aboutT", "About {shop}", { shop: name }) : t("sb.ftr.line", "Make time for play.") }}</h2>
            <ly-sample-tag v-if="!own" />
            <div v-if="own" class="art-body ly-own" v-html="ownHtml"></div>
            <template v-else>
              <p>{{ storyP1 }}</p>
              <p v-if="storyP2">{{ storyP2 }}</p>
            </template>
            <ul v-if="lines.length" class="ils">
              <ly-ic-line v-for="l in lines" :key="l.key" :icon="l.icon" :text="l.text" :title="l.title" />
            </ul>
            <router-link :to="shopTo" class="btn">{{ t("sb.about.explore", "Explore the collection") }}</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import LyIcon from "@app-storefront/components/ly/LyIcon.vue";
import LyArt from "@app-storefront/components/ly/LyArt.vue";
import LyCuts from "@app-storefront/components/ly/LyCuts.vue";
import LyPhoto from "@app-storefront/components/ly/LyPhoto.vue";
import LyPt from "@app-storefront/components/ly/ui/LyPt.vue";
import LyIcLine from "@app-storefront/components/ly/ui/LyIcLine.vue";
import LySampleTag from "@app-storefront/components/ly/ui/LySampleTag.vue";
import { bySells, catImage, catTitle, catTo, ly, inCat, loadDm, mixed, openLine as openWords, productImage, shopFacts, unitOf } from "@app-storefront/components/ly/ly";
import { collectionPhoto } from "@app-storefront/components/ly/ly-photos";
import { numberWord } from "@app-storefront/components/ly/product/pd";
import { listWords, ownText, paySentence, shopName, shopProfile, shortAddress } from "@app-storefront/components/ly/read/rd";
import { catalogueRoute } from "@app-storefront/components/kalio/kalio-catalog";
import { t } from "@app-storefront/components/kalio/i18n/kalio-i18n";

export default {
  name: "StorefrontPageOfficialAboutUs",
  components: { LyIcon, LyArt, LyCuts, LyPhoto, LyPt, LyIcLine, LySampleTag },
  inject: ["$shop"],

  data: () => ({ ly, profile: null as any }),

  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    f() {
      return shopFacts(this.shop);
    },
    name() {
      return shopName(this.shop);
    },
    own() {
      return ownText(this.profile?.body);
    },
    ownHtml() {
      return String(this.profile?.body || "").replace(/\scontenteditable="[^"]*"/g, "");
    },
    bandLead() {
      const at = shortAddress(this.f);
      return at ? t("ly.rd.aboutLead", "A pâtisserie counter at {place}.", { place: at }) : "";
    },
    units() {
      return [...new Set(this.ly.cats.map((c: any) => unitOf(this.ly.products.find((p: any) => p.category_id === c.id) || {}).toLowerCase()).filter(Boolean))] as string[];
    },
    collectionsWords() {
      return listWords(this.ly.cats.map((c: any) => catTitle(c).toLowerCase()));
    },
    storyP1() {
      const where = this.f.address;
      const lead = where ? t("ly.rd.storyAt", "{shop} is a bakery counter at {address}.", { shop: this.name, address: where }) : t("ly.rd.storyIs", "{shop} is a bakery counter.", { shop: this.name });
      const small = this.units[0] ? t("ly.rd.storySmall", ", so an order can be a single {unit} or a small table of favourites", { unit: this.units[0] }) : "";
      const hold = this.collectionsWords ? t("ly.rd.storyCase", "Its collections — {names} — are sold as individual pieces{small}.", { names: this.collectionsWords, small }) : "";
      return [lead, hold].filter(Boolean).join(" ");
    },
    storyP2() {
      const f = this.f;
      const open = f.hours ? (f.everyDay ? t("ly.rd.openEveryFrom", "The counter is open every day from {hours}.", { hours: f.hours }) : t("ly.rd.openFrom", "The counter is open {hours}.", { hours: f.hours })) : "";
      const kinds: string[] = [];
      if (f.courier) kinds.push(f.courier.distance ? t("ly.rd.byCourierKm", "travel with the {name} within {km} km", { name: f.courier.title, km: f.courier.distance }) : t("ly.rd.byCourier", "travel with the {name}", { name: f.courier.title }));
      if (f.shipping) kinds.push(t("ly.rd.byShipping", "ship further away"));
      if (f.pickup) kinds.push(t("ly.rd.byPickup", "wait at the counter for pickup"));
      const how = kinds.length ? t("ly.rd.ordersHow", "Orders {kinds}", { kinds: listWords(kinds) }) : "";
      const pay = f.gateway?.cod ? t("ly.rd.paidCod", ", and they are paid in cash on delivery.") : how ? "." : "";
      return [open, how ? how + pay : ""].filter(Boolean).join(" ");
    },
    /* The counter's lines: where, when, how it is paid. */
    lines() {
      const f = this.f;
      const out: any[] = [];
      if (f.address) out.push({ key: "pin", icon: "pin", title: f.address, text: f.pickupNote });
      const open = openWords(f);
      if (open) out.push({ key: "clock", icon: "clock", title: open, text: f.everyDay ? t("ly.rd.monSun", "Monday to Sunday") : "" });
      if (f.gateway) out.push({ key: "cash", icon: "cash", title: f.gateway.name, text: f.gateway.cod ? t("ly.rd.nothingOnline", "Nothing is charged online") : f.gateway.description || paySentence(f) });
      return out;
    },
    spread() {
      return mixed(bySells(this.ly.products)).slice(0, 5);
    },
    counterText() {
      return this.f.pickupNote || [shortAddress(this.f), openWords(this.f)].filter(Boolean).join(". ") || t("ly.rd.counterP", "Every piece is baked and packed at the counter.");
    },
    /* The collection with the most sold pieces, in its photo. */
    photoCat() {
      const cats = this.ly.cats.slice();
      const sold = (c: any) => inCat(c.id).reduce((n: number, p: any) => n + (Number(p.sells) || 0), 0);
      return cats.sort((a: any, b: any) => sold(b) - sold(a))[0] || null;
    },
    oneByOne() {
      const u = this.units;
      if (u.length >= 3) return t("ly.rd.oneByOneP3", "One {a}, one {b}, one {c} — every pastry is its own piece, with its own price.", { a: u[0], b: u[1], c: u[2] });
      return t("ly.rd.oneByOneP", "Every pastry is its own piece, with its own price.");
    },
    tableText() {
      const u = this.units;
      const tail = t("ly.rd.tableTail", "Each piece is chosen on its own, and the bag shows the full price, the saving and the total before checkout.");
      if (u.length >= 3) return `${t("ly.rd.tableMix", "Mix a {a} with a {b}, and add a {c} for later.", { a: u[0], b: u[1], c: u[2] })} ${tail}`;
      return tail;
    },
    collage() {
      return mixed(bySells(this.ly.products)).slice(0, 6);
    },
    shopTo() {
      return catalogueRoute({});
    },
    contactTo() {
      return { name: window.$storefront.routes.SHOP_CONTACT_US };
    },
    faqTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : this.contactTo;
    },
  },

  created() {
    loadDm();
    this.setPageTitle?.(t("ly.rd.aboutT", "About {shop}", { shop: shopName(this.$store.getters.getShop) }));
    shopProfile(this.$shop.name, "about-us").then((p) => (this.profile = p));
  },

  methods: { t, catTo, catTitle, productImage, bySells, inCat, numberWord, colPhoto: (c) => collectionPhoto(c) || catImage(c, null) },
};
</script>
