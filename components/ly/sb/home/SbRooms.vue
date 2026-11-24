<!--
  "A toy for their kind of play" (Storybook design, the rooms): three collections as cards, the collection's own
  image on an arched tint, its name in the display face and its own description, and an arrow. The three with the
  most toys (the shop's order on a tie). Hidden when the shop has no collection with toys.
-->
<template>
  <section v-if="rooms.length" :aria-labelledby="'sb-rooms-h'" class="sb-sec sb-rooms">
    <div class="wrap">
      <header class="sb-top">
        <h2 id="sb-rooms-h">{{ t("sb.home.roomsH", "A toy for their kind of play") }}</h2>
        <router-link :to="allTo" class="sb-more">{{ t("sb.home.allCollections", "All collections") }}<ly-icon cls="fl" name="arrow" /></router-link>
      </header>
      <div :class="['sb-room-grid', 'n' + rooms.length]">
        <router-link v-for="c in rooms" :key="c.id" :to="catTo(c)" class="sb-room">
          <span class="sb-room-art">
            <img v-if="catPic(c)" :src="catPic(c)" alt="" loading="lazy" />
            <ly-cuts v-else :products="bySells(inCat(c.id)).slice(0, 3)" kind="trio" />
          </span>
          <span class="sb-room-tx">
            <h3><bdi>{{ catTitle(c) }}</bdi></h3>
            <p v-if="c.description">{{ c.description }}</p>
          </span>
          <ly-icon cls="fl sb-room-go" name="arrow" />
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import LyCuts from "../../LyCuts.vue";
import homeData from "../../home/home-data";
import { bySells, catImage, inCat } from "../../ly";
import { catalogueRoute } from "../../../kalio/kalio-catalog";

export default {
  name: "SbRooms",
  components: { LyIcon, LyCuts },
  mixins: [homeData],
  computed: {
    rooms() {
      return this.cats
        .map((c, i) => ({ c, i, n: inCat(c.id).length }))
        .filter((x) => x.n)
        .sort((a, b) => b.n - a.n || a.i - b.i)
        .slice(0, 3)
        .sort((a, b) => a.i - b.i)
        .map((x) => x.c);
    },
    allTo() {
      return catalogueRoute({ dir: "*" });
    },
  },
  methods: {
    bySells,
    inCat,
    catPic(c) {
      return catImage(c, null);
    },
  },
};
</script>
