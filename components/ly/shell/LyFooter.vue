<!--
  The footer (Storybook design, shared/app.js storyFooter()): on the wash band, four columns: the wordmark with
  one line ("Make time for play.") and the way to the shop's story; Find a toy (every toy, the first collections in
  the shop's order, Deals); Here to help (FAQ, Contact, the buyer's orders); the journal's newest post as a small
  photo card. Then the Theme row (the owner's rule of 10 November 2026: palettes, a custom colour and Light / Dark,
  in a row of its own above the legal row; the kit's ThemeSwitcherRow, only on the showcase shops). Then the legal
  row: the copyright, Terms, Privacy, Selldone's cookie settings, the shop's social links and a small "made with"
  credit. A shop with custom footer code keeps Selldone's footer (StorefrontLayout).
-->
<template>
  <div class="ly ly-ftrwrap">
    <footer class="ftr sb-ftr">
      <div class="wrap sb-ftr-main">
        <div class="sb-ftr-note">
          <ly-logo />
          <p class="sb-ftr-h">{{ t("sb.ftr.line", "Make time for play.") }}</p>
          <router-link :to="{ name: r.SHOP_PROFILE_PAGE_ABOUT_US }" class="sb-more">{{ t("sb.ftr.story", "The {shop} story", { shop: shopName }) }}</router-link>
        </div>
        <nav :aria-label="t('sb.ftr.find', 'Find a toy')" class="sb-ftr-col">
          <h2>{{ t("sb.ftr.find", "Find a toy") }}</h2>
          <router-link :to="allTo">{{ t("sb.ftr.all", "All toys") }}</router-link>
          <router-link v-for="c in cats.slice(0, 3)" :key="c.id" :to="catTo(c)"><bdi>{{ catTitle(c) }}</bdi></router-link>
          <router-link :to="dealsTo">{{ t("ly.hdr.deals", "Deals") }}</router-link>
        </nav>
        <nav :aria-label="t('sb.ftr.help', 'Here to help')" class="sb-ftr-col">
          <h2>{{ t("sb.ftr.help", "Here to help") }}</h2>
          <router-link :to="faqTo">{{ t("sb.menu.help", "Help and FAQ") }}</router-link>
          <router-link :to="{ name: r.SHOP_CONTACT_US }">{{ t("ly.hdr.contact", "Contact") }}</router-link>
          <router-link :to="ordersTo">{{ t("sb.ftr.orders", "Your orders") }}</router-link>
        </nav>
        <div class="sb-ftr-journal">
          <h2>{{ t("sb.ftr.journal", "The play journal") }}</h2>
          <router-link :to="post ? postRoute(post) : blogTo" class="sb-fj">
            <span class="sb-fj-ph"><img v-if="postPic" :src="postPic" alt="" loading="lazy" /><ly-photo v-else name="feature" /></span>
            <span class="sb-fj-t"><bdi>{{ post ? post.title : t("sb.ftr.openJournal", "Open the journal") }}</bdi><ly-icon cls="fl" name="arrow" /></span>
          </router-link>
        </div>
      </div>

      <!-- The theme switcher (the owner, 10 November 2026: in the footer on every Layout), only on the showcase shops. -->
      <div v-if="theme.enabled" class="dts-row sb-theme">
        <div class="wrap dts-in"><theme-switcher-row /></div>
      </div>

      <div class="ftr-bot sb-legal">
        <div class="wrap fb-in">
          <span class="sb-copy">© {{ year }} <bdi>{{ shopName }}</bdi></span>
          <nav :aria-label="t('ly.ftr.legal', 'Legal')">
            <router-link :to="{ name: r.SHOP_PROFILE_PAGE_TERMS }">{{ t("ly.ftr.terms", "Terms") }}</router-link>
            <router-link :to="{ name: r.SHOP_PROFILE_PAGE_PRIVACY }">{{ t("ly.ftr.privacy", "Privacy") }}</router-link>
            <s-footer-section-gdpr class="ly-gdpr"></s-footer-section-gdpr>
          </nav>
          <div class="fb-end">
            <s-storefront-social-buttons class="ly-social"></s-storefront-social-buttons>
            <s-footer-section-selldone class="ly-made"></s-footer-section-selldone>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import LyLogo from "../LyLogo.vue";
import LyIcon from "../LyIcon.vue";
import LyPhoto from "../LyPhoto.vue";
import ThemeSwitcherRow from "../../theme-switcher/ThemeSwitcherRow.vue";
import { themeState } from "../../theme-switcher/theme-switcher";
import SStorefrontSocialButtons from "@selldone/components-vue/storefront/social/SStorefrontSocialButtons.vue";
import SFooterSectionGdpr from "@selldone/components-vue/storefront/footer/section/gdpr/SFooterSectionGdpr.vue";
import SFooterSectionSelldone from "@selldone/components-vue/storefront/footer/section/selldone/SFooterSectionSelldone.vue";
import { catTitle, catTo, loadDm, ly } from "../ly";
import { catalogueRoute, dealsRoute } from "../../kalio/kalio-catalog";
import { journalRoute, postRoute } from "../../kalio/pages/kalio-journal";
import { loadPosts, postImage, posts } from "../sb/sb";
import { t } from "../../kalio/i18n/kalio-i18n";

export default {
  name: "LyFooter",
  components: { LyLogo, LyIcon, LyPhoto, ThemeSwitcherRow, SStorefrontSocialButtons, SFooterSectionGdpr, SFooterSectionSelldone },
  data: () => ({ theme: themeState, ly, posts }),
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    r() {
      return window.$storefront.routes;
    },
    shopName() {
      const n = this.shop?.title || "";
      return n.charAt(0).toUpperCase() + n.slice(1);
    },
    year() {
      return new Date().getFullYear();
    },
    cats() {
      return this.ly.cats;
    },
    blogTo() {
      return journalRoute();
    },
    allTo() {
      return catalogueRoute({ dir: "*" });
    },
    dealsTo() {
      return dealsRoute();
    },
    ordersTo() {
      return { name: this.r.HISTORY_ORDERS_PHYSICAL };
    },
    faqTo() {
      return this.$router.hasRoute("ShopFAQ") ? { name: "ShopFAQ" } : { name: this.r.SHOP_CONTACT_US };
    },
    post() {
      return this.posts.list[0] || null;
    },
    postPic() {
      return this.post ? postImage(this.post) : null;
    },
  },
  created() {
    loadDm();
    loadPosts();
  },
  methods: { t, catTitle, catTo, postRoute },
};
</script>
