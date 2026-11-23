<!--
  "A slow morning of making." (Storybook design, the craft band): the skin's "craft" photo beside a collection's
  name as the eyebrow, the line and "Shop <collection>". The collection: the one whose own name speaks of making
  (crafts, art, paint, model…), else the collection with the most toys after the first. Hidden without one.
-->
<template>
  <section v-if="col" :aria-labelledby="'sb-craft-h'" class="sb-sec sb-craft">
    <div class="wrap sb-craft-in">
      <div class="sb-craft-photo">
        <ly-photo :alt="t('sb.home.craftAlt', 'Children making things at a table')" name="craft">
          <template #fallback><ly-cuts :products="cuts" kind="trio" /></template>
        </ly-photo>
      </div>
      <div class="sb-craft-copy">
        <p class="eyebrow"><bdi>{{ catTitle(col) }}</bdi></p>
        <h2 id="sb-craft-h">{{ t("sb.home.craftH", "A slow morning of making.") }}</h2>
        <p>{{ t("sb.home.craftP", "Set out a few things to make with. See what they come up with when there is a little room to try.") }}</p>
        <router-link :to="catTo(col)" class="btn">{{ t("sb.home.shopCol", "Shop {name}", { name: catTitle(col) }) }}</router-link>
      </div>
    </div>
  </section>
</template>

<script>
import LyPhoto from "../../LyPhoto.vue";
import LyCuts from "../../LyCuts.vue";
import homeData from "../../home/home-data";
import { bySells, catTitle, inCat } from "../../ly";

const MAKING = /craft|art\b|arts|paint|draw|model|clay|creat|make|making|حرف|رسم|فن/i;

export default {
  name: "SbCraft",
  components: { LyPhoto, LyCuts },
  mixins: [homeData],
  computed: {
    col() {
      const withToys = this.cats.filter((c) => inCat(c.id).length);
      return withToys.find((c) => MAKING.test(catTitle(c)) || MAKING.test(c.name || "")) || this.rank[1]?.c || withToys[0] || null;
    },
    cuts() {
      return this.col ? bySells(inCat(this.col.id)).slice(0, 3) : [];
    },
  },
};
</script>
