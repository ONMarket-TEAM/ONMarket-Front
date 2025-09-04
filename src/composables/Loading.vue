<template>
  <div v-if="visible" class="loading-container">
    <div class="loading-content">
      <!-- 비디오 로고 -->
      <video class="spinner-video" :src="videoSrc" autoplay loop muted playsinline></video>

      <!-- 로딩 텍스트 -->
      <!-- 로딩 텍스트 -->
      <div class="loading-text fade-animation">
        {{ text }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    visible: { type: Boolean, default: true },
    videoSrc: { type: String, default: '/src/assets/movingLogo.mp4' },
    text: { type: String, default: '온마켓 준비 중' },
  },
};
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner-video {
  width: 200px;
  height: 100px;
  object-fit: contain;
}

.loading-text {
  font-size: 15px;
  font-weight: 500;
  color: #ff7a45; /* 브랜드 주황 */
  display: flex;
  align-items: center;
}

/* 페이드 인/아웃 애니메이션 */
.fade-animation {
  animation: fade 2s ease-in-out infinite;
}

@keyframes fade {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
}
</style>
