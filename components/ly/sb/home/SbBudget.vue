<!--
  "Good finds at every price" (Storybook design, the budget band): three round amounts from the shop's own live
  prices (in the visitor's currency), about a third, two thirds and all of the toys under each, as tiles that open
  every toy up to that price. Hidden when the shop has no prices.
-->
<template>
  <section v-if="bands.length" :aria-labelledby="'sb-budget-h'" class="sb-sec sb-budget">
    <div class="wrap">
      <header class="sb-top">
        <h2 id="sb-budget-h">{{ t("sb.home.budgetH", "Good finds at every price") }}</h2>
      </header>
      <div :class="['sb-budget-row', 'n' + bands.length]">
        <router-link v-for="b in bands" :key="b" :to="bandTo(b)"
          ><span>{{ t("sb.home.upTo", "Up to {price}", { price: money(b, true) }) }}</span><ly-icon cls="fl" name="arrow"
        /></router-link>
      </div>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import homeData from "../../home/home-data";
import { priceBands } from "../sb";
import { catalogueRoute } from "../../../kalio/kalio-catalog";

export default {
  name: "SbBudget",
  components: { LyIcon },
  mixins: [homeData],
  computed: {
    bands() {
      if (!this.ly.ready) return [];
      void this.currency;
      return priceBands(this.products.map((p) => this.pv(p).now));
    },
  },
  methods: {
    bandTo(b) {
      return catalogueRoute({ price: "-" + b });
    },
  },
};
</script>
