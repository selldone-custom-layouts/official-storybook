<!--
  "Find the right fit" (Storybook design, the ages strip): every age the shop's toys are made for, read from the
  toys' own specification (the row whose name says "age"), youngest first, as capsules that open every toy for that
  age. Seven to a row on a computer, four on a phone; hidden when no toy names an age.
-->
<template>
  <section v-if="ages.length" :aria-labelledby="'sb-ages-h'" class="sb-ages">
    <div class="wrap sb-ages-in">
      <h2 id="sb-ages-h">{{ t("sb.home.agesH", "Find the right fit") }}</h2>
      <div :style="{ '--n': Math.min(ages.length, 7) }" class="sb-ages-row">
        <router-link v-for="a in ages" :key="a.value" :aria-label="t('sb.home.ageAria', 'Toys for {age}', { age: a.value })" :to="ageTo(a.value)">{{ ageShort(a.value, t) }}</router-link>
      </div>
    </div>
  </section>
</template>

<script>
import homeData from "../../home/home-data";
import { ageShort, agesOf } from "../sb";
import { catalogueRoute } from "../../../kalio/kalio-catalog";

export default {
  name: "SbAges",
  mixins: [homeData],
  computed: {
    ages() {
      return this.ly.ready ? agesOf(this.products).slice(0, 14) : [];
    },
  },
  methods: {
    ageShort,
    ageTo(v) {
      return catalogueRoute({ age: v });
    },
  },
};
</script>
