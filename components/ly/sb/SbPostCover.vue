<!--
  A journal post's picture on a card (the journal list, More from the journal, the home's newest posts): the post's
  own cover; without one, the toys its text names as cut-outs on the plate (the design's journal cards); without
  those, the sparkle.
-->
<template>
  <img v-if="cover" :sizes="sizes" :src="cover" :srcset="srcset" alt="" decoding="async" height="1000" loading="lazy" width="1600" @error="dropSrcset" />
  <span v-else-if="cuts.length" class="sb-post-cuts"><img v-for="p in cuts" :key="p.id" :src="productImage(p)" alt="" decoding="async" loading="lazy" /></span>
  <span v-else class="sb-post-none"><ly-icon name="sparkle" /></span>
</template>

<script>
import LyIcon from "../LyIcon.vue";
import { postCuts, postImage } from "./sb";
import { dropSrcset, photoSrcset, productImage } from "../../kalio/kalio-catalog";

export default {
  name: "SbPostCover",
  components: { LyIcon },
  props: { post: { type: Object, required: true }, sizes: { type: String, default: "(max-width: 760px) 46vw, 400px" } },
  computed: {
    cover() {
      return postImage(this.post);
    },
    srcset() {
      return photoSrcset(this.cover);
    },
    cuts() {
      return this.cover ? [] : postCuts(this.post);
    },
  },
  methods: { dropSrcset, productImage },
};
</script>
