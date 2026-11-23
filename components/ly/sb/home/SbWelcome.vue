<!--
  The welcome (Storybook design, pages.js storyHome() welcome): the skin's "hero" photo in a rounded panel with a
  small capsule link on it (the collection people order most, else the first in the shop's order), and beside it
  the shop's line in the display face with the last word in the accent italic, one sentence and "Explore the toy
  shop". On a phone the words come first, centred, and the photo under them. Without the photo: the collection's
  best sellers on the tint (LyPhoto's fallback).
-->
<template>
  <section :aria-label="t('sb.home.welcomeAria', 'Welcome')" class="sb-welcome-sec">
    <div class="wrap sb-welcome">
      <figure>
        <ly-photo :alt="t('sb.home.heroAlt', 'A child and a parent playing on the floor')" eager name="hero" pos="57% center">
          <template #fallback><ly-cuts :products="cuts" kind="trio" /></template>
        </ly-photo>
        <figcaption v-if="top">
          <router-link :to="catTo(top)">{{ t("sb.home.explore", "Explore {name}", { name: catTitle(top) }) }}<ly-icon cls="fl" name="arrow" /></router-link>
        </figcaption>
      </figure>
      <div class="sb-welcome-copy">
        <p class="eyebrow">{{ t("sb.home.eyebrow", "The {shop} play shop", { shop: shopName }) }}</p>
        <h1>
          {{ t("sb.home.h1a", "A little more time to") }} <em>{{ t("sb.home.h1b", "play.") }}</em>
        </h1>
        <p>{{ t("sb.home.lead", "From their first wobbly stack to a whole world built on the floor. Find the toys they’ll come back to.") }}</p>
        <router-link :to="allTo" class="btn">{{ t("sb.home.cta", "Explore the toy shop") }}</router-link>
      </div>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import LyPhoto from "../../LyPhoto.vue";
import LyCuts from "../../LyCuts.vue";
import homeData from "../../home/home-data";
import { catalogueRoute } from "../../../kalio/kalio-catalog";

export default {
  name: "SbWelcome",
  components: { LyIcon, LyPhoto, LyCuts },
  mixins: [homeData],
  computed: {
    top() {
      return this.rank[0]?.c || this.cats[0] || null;
    },
    cuts() {
      return (this.rank[0]?.ps || this.best).slice(0, 3);
    },
    allTo() {
      return catalogueRoute({ dir: "*" });
    },
  },
};
</script>
