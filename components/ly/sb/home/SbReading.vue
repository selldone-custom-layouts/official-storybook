<!--
  "From the play journal" (Storybook design, the reading band): the journal's newest post on the tint, its title set
  large, its own line and "Read the story", beside the skin's "feature" photo (the post's own picture when the skin
  has none). Hidden while the shop has no post.
-->
<template>
  <section v-if="post" :aria-labelledby="'sb-read-h'" class="wrap sb-sec sb-reading">
    <div class="sb-reading-in">
      <div class="sb-reading-copy">
        <p class="eyebrow">{{ t("sb.home.fromJournal", "From the play journal") }}</p>
        <h2 id="sb-read-h"><bdi>{{ post.title }}</bdi></h2>
        <p v-if="post.description"><bdi>{{ post.description }}</bdi></p>
        <router-link :to="postRoute(post)" class="btn quiet">{{ t("sb.home.readStory", "Read the story") }}</router-link>
      </div>
      <div class="sb-reading-photo">
        <ly-photo :alt="t('sb.home.featureAlt', 'Hands building a little town')" name="feature" pos="55% 58%">
          <template #fallback><img v-if="postPic" :src="postPic" alt="" class="ph-img" loading="lazy" /></template>
        </ly-photo>
      </div>
    </div>
  </section>
</template>

<script>
import LyPhoto from "../../LyPhoto.vue";
import homeData from "../../home/home-data";
import { loadPosts, postImage, posts } from "../sb";

export default {
  name: "SbReading",
  components: { LyPhoto },
  mixins: [homeData],
  data: () => ({ posts }),
  computed: {
    post() {
      return this.posts.list[0] || null;
    },
    postPic() {
      return postImage(this.post);
    },
  },
  created() {
    loadPosts();
  },
};
</script>
