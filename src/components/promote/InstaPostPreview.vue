<!-- InstaPostPreview.vue -->
<template>
  <div class="insta-post">
    <div class="insta-header">
      <img class="insta-profile" src="/default-profile.png" />
      <span class="insta-username">username</span>
    </div>
    <div class="insta-image">
      <img v-if="image" :src="image" alt="preview" />
    </div>
    <div class="insta-actions">
      ❤️ 💬 ✈️ 🔖
    </div>
    <div class="insta-caption">
      <strong>{{ username }}</strong> {{ caption || '캡션 없음' }}
    </div>
    <div class="insta-hashtags" v-if="hashtags?.length">
      {{ hashtags.join(' ') }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  username: String,
  caption: String,
  image: String,
  hashtags: Array
});
</script>

<style scoped>
.insta-post {
  border: 1px solid #dbdbdb;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  width: 350px;
  font-family: Arial, sans-serif;
}
.insta-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
}
.insta-profile {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
.insta-username {
  font-weight: 600;
  font-size: 14px;
}
.insta-image img {
  width: 100%;
  display: block;
}
.insta-actions {
  padding: 8px;
  font-size: 18px;
}
.insta-caption {
  padding: 0 8px 8px;
  font-size: 14px;
}
.insta-hashtags {
  padding: 0 8px 8px;
  font-size: 13px;
  color: #00376b;
}
</style>
