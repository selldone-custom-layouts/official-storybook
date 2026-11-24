<!--
  A shelf of four toys (Storybook design, "The playroom shelf" and "For a quiet afternoon"), the story cards in one
  row (two by two on a phone):
  - "playroom": the best sellers, one collection after another (never four of one kind), in stock first;
  - "quiet": the toys of the calm collection (puzzles, games, books… found by the collection's own name, else
    the collection the rooms and the playroom shelf did not use), with "Browse <collection>".
  Hidden with fewer than two toys.
-->
<template>
  <section v-if="list.length >= 2" :aria-labelledby="hid" :class="['sb-sec', 'sb-shelf', 'v-' + variant]">
    <div class="wrap">
      <header class="sb-top">
        <h2 :id="hid">{{ title }}</h2>
        <router-link :to="moreTo" class="sb-more">{{ moreLabel }}<ly-icon cls="sb-fl" name="arrow" /></router-link>
      </header>
      <div class="sb-grid4">
        <ly-card v-for="p in list" :key="p.id" :product="p" />
      </div>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import LyCard from "../../ui/LyCard.vue";
import homeData from "../../home/home-data";
import { bySells, catTitle, catTo, inCat, mixed } from "../../ly";
import { catalogueRoute } from "../../../kalio/kalio-catalog";

/* a calm collection's name (any language the shop writes in) */
const CALM = /puzzl|jigsaw|game|book|stor(y|ies)|read|card|board|لغز|كتاب|ألعاب/i;

export default {
  name: "SbShelf",
  components: { LyIcon, LyCard },
  mixins: [homeData],
  computed: {
    hid() {
      return "sb-shelf-" + this.variant;
    },
    quiet() {
      return this.variant === "quiet";
    },
    /* the collection of the quiet shelf */
    calm() {
      const withToys = this.cats.filter((c) => inCat(c.id).length >= 2);
      return withToys.find((c) => CALM.test(catTitle(c)) || CALM.test(c.name || "")) || withToys[withToys.length - 1] || null;
    },
    list() {
      if (!this.ly.ready) return [];
      if (this.quiet) {
        const c = this.calm;
        return c ? bySells(inCat(c.id)).sort((a, b) => (b.quantity > 0) - (a.quantity > 0)).slice(0, 4) : [];
      }
      const inStock = this.products.filter((p) => p.quantity > 0);
      return mixed(bySells(inStock.length >= 4 ? inStock : this.products)).slice(0, 4);
    },
    title() {
      return this.quiet ? this.t("sb.home.quietH", "For a quiet afternoon") : this.t("sb.home.shelfH", "The playroom shelf");
    },
    moreTo() {
      return this.quiet && this.calm ? catTo(this.calm) : catalogueRoute({ dir: "*" });
    },
    moreLabel() {
      return this.quiet && this.calm ? this.t("sb.home.browse", "Browse {name}", { name: catTitle(this.calm) }) : this.t("sb.home.shopAll", "Shop all toys");
    },
  },
};
</script>
