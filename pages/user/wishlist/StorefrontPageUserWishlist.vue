<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<!--
  Saved toys (Storybook design, wishlist.html): the buyer's Selldone wishlist as the story cards, four to a row (two
  on a phone), every heart already pressed; a toy taken out of the list leaves it at once. Empty: a calm card and
  "Browse toys". Live data only: the shop's own wishlist answer (only_in_wishlist).
-->
<template>
  <div class="ly ly-saved">
    <header class="sb-saved-hd">
      <h2 class="sb-saved-h">{{ t("sb.saved.title", "Saved toys") }}</h2>
      <p class="sb-saved-l">{{ t("sb.saved.lead", "Come back to the toys you’re thinking about.") }}</p>
    </header>
    <div v-if="busy_fetch && !products.length" aria-hidden="true" class="sb-grid4 sb-saved-grid">
      <div v-for="i in 4" :key="i" class="pc ly-skel"><div class="pc-plate"></div><div class="pc-tx"><span class="sk-l"></span><span class="sk-l s"></span></div></div>
    </div>
    <div v-else-if="shown.length" class="sb-grid4 sb-saved-grid">
      <ly-card v-for="p in shown" :key="p.id" :product="p" />
    </div>
    <ly-empty v-else :text="t('sb.saved.emptyP', 'Tap the heart on any toy to keep it here.')" :title="t('sb.saved.emptyT', 'Nothing saved yet')" cls="boxed" icon="heart">
      <template #acts>
        <router-link :to="allTo" class="btn">{{ t("sb.bag.browse", "Browse toys") }}</router-link>
      </template>
    </ly-empty>
    <div v-if="products.length < totalItems" class="ly-or-more">
      <button :aria-disabled="busy_fetch ? 'true' : undefined" class="btn quiet" type="button" @click="more">{{ t("sb.saved.more", "Show more") }}</button>
    </div>
  </div>
</template>

<script lang="ts">
import { t } from "../../../components/kalio/i18n/kalio-i18n";
import NotificationService from "@selldone/components-vue/plugins/notification/NotificationService.ts";

import LyCard from "../../../components/ly/ui/LyCard.vue";
import LyEmpty from "../../../components/ly/ui/LyEmpty.vue";
import { loadDm } from "../../../components/ly/ly";
import { isSaved, saved } from "../../../components/ly/sb/sb";

export default {
  name: "StorefrontPageUserWishlist",
  components: { LyCard, LyEmpty },
  inject: ["$shop"],
  data: () => ({
    products: [],

    busy_add: false,

    search: "",
    filter: {},
    sortBy: [{ key: null, order: "desc" }],

    busy_fetch: false,
    // Pagination:
    page: 1,
    itemsPerPage: 24,
    saved,
    totalItems: 0,
    options: {},
  }),
  computed: {
    /* a toy unsaved on this page leaves the list at once */
    shown() {
      void this.saved;
      return this.products.filter((p) => isSaved(p));
    },
    allTo() {
      return { name: window.$storefront.routes.SHOP_PAGE, query: { dir: "*" } };
    },
    pageCount() {
      return Math.ceil(this.totalItems / this.itemsPerPage);
    },

    keys() {
      return [
        { label: this.$t("global.sort.product_type"), value: "type" },
        { label: this.$t("global.sort.title"), value: "title" },
        { label: this.$t("global.sort.discount"), value: "discount" },
        { label: this.$t("global.sort.rate"), value: "rate" },
        { label: this.$t("global.sort.rate_count"), value: "rate_count" },
        { label: this.$t("global.sort.category"), value: "category_id" },
      ];
    },
  },

  created() {
    this.setPageTitle(t("sb.saved.title", "Saved toys")); // Set Page Title!
    loadDm();
    this.fetchData(1);
  },

  methods: {
    t,
    more() {
      if (this.busy_fetch) return;
      this.page++;
      this.fetchData(this.page, null, true, true);
    },
    fetchData(page, sortBy = null, sortDesc = true, append = false) {
      this.busy_fetch = true;

      const handleSuccessResponse = ({ products, total }) => {
        const list = (products || []).map((p) => ({ ...p, wishlist: true }));
        for (const p of list) if (this.saved[p.id] === undefined) this.saved[p.id] = true;
        this.products = append ? [...this.products, ...list.filter((p) => !this.products.some((q) => q.id === p.id))] : list;

        this.totalItems = total;
      };

      window.$storefront.products
        .optimize(60)
        .list("*", (page - 1) * this.itemsPerPage, this.itemsPerPage, {
          sortBy: sortBy,
          sortDesc: sortDesc,
          search: this.search,

          dir: "*",
          only_in_wishlist: true, /// OLD: only_stared
          products_only: true,

          with_total: true,
        })
        .cache(handleSuccessResponse)
        .then(handleSuccessResponse)

        .catch((error) => {
          NotificationService.showLaravelError(error);
        })

        .then(() => {
          this.busy_fetch = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
