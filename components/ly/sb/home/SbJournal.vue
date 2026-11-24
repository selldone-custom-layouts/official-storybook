<!--
  "Notes from the playroom" (Storybook design, the journal row): the journal's four newest posts, each with its own
  picture, its date, its title in the display face, its line and "Read the story"; two by two on a phone. The last
  section of the home. Hidden while the shop has no post.
-->
<template>
  <section v-if="list.length" :aria-labelledby="'sb-jr-h'" class="wrap sb-sec sb-journal-home">
    <header class="sb-top">
      <h2 id="sb-jr-h">{{ t("sb.home.journalH", "Notes from the playroom") }}</h2>
      <router-link :to="blogTo" class="sb-more">{{ t("sb.home.openJournal", "Open the journal") }}<ly-icon cls="sb-fl" name="arrow" /></router-link>
    </header>
    <div class="sb-journal-grid">
      <article v-for="b in list" :key="b.id" class="sb-post">
        <router-link :to="postRoute(b)">
          <span class="sb-post-cover"><img v-if="postPic(b)" :src="postPic(b)" alt="" loading="lazy" /><ly-icon v-else name="sparkle" /></span>
          <span class="sb-post-tx">
            <time v-if="b.created_at" :datetime="b.created_at" class="eyebrow">{{ fmtDate(b.created_at) }}</time>
            <h3><bdi>{{ b.title }}</bdi></h3>
            <p v-if="b.description">{{ b.description }}</p>
            <span class="sb-more">{{ t("sb.home.readStory", "Read the story") }}<ly-icon cls="sb-fl" name="arrow" /></span>
          </span>
        </router-link>
      </article>
    </div>
  </section>
</template>

<script>
import LyIcon from "../../LyIcon.vue";
import homeData from "../../home/home-data";
import { loadPosts, postImage, posts } from "../sb";
import { journalRoute } from "../../../kalio/pages/kalio-journal";

export default {
  name: "SbJournal",
  components: { LyIcon },
  mixins: [homeData],
  data: () => ({ posts }),
  computed: {
    list() {
      return this.posts.list.slice(0, 4);
    },
    blogTo() {
      return journalRoute();
    },
  },
  created() {
    loadPosts();
  },
  methods: {
    postPic(b) {
      return postImage(b);
    },
  },
};
</script>
