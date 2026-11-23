<!--
  The product card (Storybook design, shared/app.js storyCard()): a bordered card; the toy on the light media plate
  (a fixed box, contain); the collection, the name in the display face (two lines, then …), the shop's real
  reviews when there are some (never demo ones), the price (the struck was-price only while a discount runs) and
  the toy's age from its own spec; then a row with "Quick look" and the save heart, and "Add to bag" over the
  card's width, which turns into − n in bag + in place (LyAdd).
-->
<template>
  <article :class="['pc', 'sb-card', cls]" :style="delay != null ? { '--d': delay + 'ms' } : null">
    <router-link :to="to" aria-hidden="true" class="pc-plate pc-ph" tabindex="-1">
      <img
        :loading="eager ? 'eager' : 'lazy'"
        :src="img"
        :srcset="srcset"
        alt=""
        decoding="async"
        draggable="false"
        height="640"
        sizes="(max-width: 760px) 44vw, 280px"
        width="640"
        @error="dropSrcset"
      />
    </router-link>
    <div class="pc-tx">
      <p v-if="!noCat && catName" class="pc-c"><bdi>{{ catName }}</bdi></p>
      <h3 class="pc-t">
        <router-link :to="to">{{ product.title }}</router-link>
      </h3>
      <p v-if="rated" class="sb-rate"><ly-icon name="star" /><b>{{ rate }}</b><span>({{ product.rate_count }})</span></p>
      <p class="pc-ly">
        <span class="now money">{{ money(pv.now) }}</span><template v-if="pv.was">{{ " " }}<s class="was money">{{ money(pv.was) }}</s></template
        ><span v-if="age" class="sb-age"><bdi>{{ age }}</bdi></span>
      </p>
    </div>
    <div class="sb-ca">
      <button :aria-label="t('ly.card.quick', 'Quick view: {name}', { name: product.title })" aria-controls="qv" class="sb-ql" type="button" @click="quick($event)">
        {{ t("sb.card.quick", "Quick look") }}
      </button>
      <button :aria-label="t('sb.card.save', 'Save {name}', { name: product.title })" :aria-pressed="isSaved ? 'true' : 'false'" class="sb-heart" type="button" @click="save">
        <ly-icon name="heart" />
      </button>
      <div class="pc-add"><ly-add :product="product" /></div>
    </div>
  </article>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import LyAdd from "../LyAdd.vue";
import { catOf, catTitle, money, openQuick, priceView, productImage, productTo, unitOf } from "../ly";
import { dropSrcset, productSrcset } from "../../kalio/kalio-catalog";
import { currentCurrency } from "../../region-switcher/region";
import { fitInCircle } from "../../bakini/fit-in-circle";
import { fitOnResize } from "../ly-fit";
import { t } from "../../kalio/i18n/kalio-i18n";
import { ageOf, isSaved as savedOf, toggleSaved } from "../sb/sb";

export default {
  name: "LyCard",
  components: { LyIcon, LyAdd },
  props: {
    product: { type: Object, required: true },
    noCat: Boolean,
    eager: Boolean,
    cls: { type: [String, Array, Object], default: "" },
    delay: { type: Number, default: null },
  },
  computed: {
    shop() {
      return this.$store.getters.getShop;
    },
    pv() {
      void currentCurrency();
      return priceView(this.shop, this.product);
    },
    to() {
      return productTo(this.product);
    },
    img() {
      return productImage(this.product);
    },
    srcset() {
      return productSrcset(this.product);
    },
    unit() {
      return unitOf(this.product);
    },
    low() {
      const q = Number(this.product.quantity);
      return q > 0 && q <= 5;
    },
    catName() {
      return catTitle(catOf(this.product.category_id));
    },
    age() {
      return ageOf(this.product);
    },
    isSaved() {
      return savedOf(this.product);
    },
    /* the shop's own reviews only (rate is Selldone's average, rate_count its count) */
    rated() {
      return Number(this.product.rate_count) > 0 && Number(this.product.rate) > 0;
    },
    rate() {
      return (Math.round(Number(this.product.rate) * 10) / 10).toFixed(1);
    },
  },
  watch: {
    "pv.off"() {
      this.$nextTick(() => fitInCircle(this.$refs.off));
    },
  },
  beforeUnmount() {
    this.unfit?.();
  },
  mounted() {
    this.unfit = fitOnResize(() => fitInCircle(this.$refs.off));
    this.$nextTick(() => fitInCircle(this.$refs.off));
    document.fonts?.ready?.then(() => fitInCircle(this.$refs.off));
  },
  methods: {
    t,
    money,
    dropSrcset,
    quick(e) {
      openQuick(this.product, e.currentTarget);
    },
    save() {
      toggleSaved(this, this.product);
    },
  },
};
</script>
