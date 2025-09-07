<template>
  <div class="insta-post">
    <!-- 헤더 -->
    <div class="insta-header">
      <img class="insta-profile" src="/default-profile.png" />
      <span class="insta-username">{{ username || 'username' }}</span>
    </div>

    <!-- 이미지 -->
    <div class="insta-image">
      <img v-if="image" :src="image" alt="uploaded preview" />
      <div v-else class="insta-image-ph">이미지 없음</div>
    </div>

    <!-- 액션 버튼 -->
    <div class="insta-actions">
      <span>❤️</span>
      <span>💬</span>
      <span>✈️</span>
      <span class="save">🔖</span>
    </div>

    <!-- 좋아요 수 -->
    <div class="insta-likes">{{ likes }}명이 좋아합니다</div>

    <!-- 본문 (username + caption) -->
    <div class="insta-caption">
      <strong>{{ username || 'username' }}</strong>
      <span>{{ caption || '본문이 없습니다.' }}</span>
    </div>

    <!-- 해시태그 -->
    <div class="insta-hashtags" v-if="hashtags?.length">
      {{ hashtags.join(' ') }}
    </div>

    <!-- 댓글 (샘플) -->
    <div class="insta-comments">
      <span class="view-comments">댓글 {{ comments }}개 모두 보기</span>
    </div>

    <!-- 게시 시간 -->
    <div class="insta-time">{{ timeAgo }}</div>
  </div>
</template>

<script setup>
defineProps({
  username: {
    type: String,
    default: 'username'
  },
  caption: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  hashtags: {
    type: Array,
    default: () => []
  },
  likes: {
    type: Number,
    default: 123
  },
  comments: {
    type: Number,
    default: 5
  },
  timeAgo: {
    type: String,
    default: '1시간 전'
  }
});
</script>

<style scoped>
.insta-post {
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  background: #fff;
  font-family: Arial, sans-serif;
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
  overflow: hidden;
}

.insta-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
}
.insta-profile {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #ddd;
}
.insta-username {
  font-weight: 600;
  font-size: 14px;
}

.insta-image img {
  width: 100%;
  display: block;
}
.insta-image-ph {
  width: 100%;
  height: 300px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.insta-actions {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 20px;
}
.insta-actions span {
  margin-right: 8px;
  cursor: pointer;
}
.insta-actions .save {
  margin-left: auto;
}

.insta-likes {
  font-weight: 600;
  font-size: 14px;
  padding: 0 12px;
}

.insta-caption {
  padding: 4px 12px;
  font-size: 14px;
}
.insta-caption strong {
  margin-right: 6px;
}

.insta-hashtags {
  padding: 2px 12px 6px;
  font-size: 13px;
  color: #00376b;
}

.insta-comments {
  padding: 0 12px 4px;
  font-size: 13px;
  color: #999;
}
.view-comments {
  cursor: pointer;
}

.insta-time {
  padding: 0 12px 12px;
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
}
</style>
