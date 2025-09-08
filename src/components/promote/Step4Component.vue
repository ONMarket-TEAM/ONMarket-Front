<template>
  <section class="step4">
    <div class="step4__grid">
      <div class="final-left">
        <div class="final-box">
          <div class="final-box__title">
            <span class="red-icon" /> 최종 생성된 콘텐츠
          </div>
          <div class="final-box__body">
            <div class="final-caption">
              <div class="final-caption__header">
                <span class="green-dot" /> 완성된 캡션
              </div>
              <div class="final-caption__inner">
                <div class="final-caption__text">
                  {{ generatedText || '캡션이 생성되지 않았습니다.' }}
                </div>
              </div>
            </div>

            <div
              class="final-hashtags"
              v-if="generatedHashtags && generatedHashtags.length > 0"
            >
              <div class="hash-title"><span class="hash-icon" /> 추천 해시태그</div>
              <div class="hash-bubble">
                {{ generatedHashtags.join(' ') }}
              </div>
            </div>

            <div class="final-metrics" v-if="generatedBestTime || generatedImpact">
              <div class="metric" v-if="generatedBestTime">
                <div class="metric-label">
                  <span class="clock-icon" /> 최적 게시 시간
                </div>
                <div class="metric-value">{{ generatedBestTime }}</div>
              </div>
              <div class="metric" v-if="generatedImpact">
                <div class="metric-label"><span class="spark-icon" /> 예상 효과</div>
                <div class="metric-value">{{ generatedImpact }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="final-right">
        <div class="result-card">
          <div class="result-card__title">
            <span class="eye" /> 최종 결과물
          </div>
          <div class="result-canvas">
            <div class="result-images" v-if="uploadedImages.length > 0">
              <div
                v-for="(image, index) in uploadedImages.slice(0, 3)"
                :key="image.id"
                class="result-image"
                :style="{
                  zIndex: 3 - index,
                  transform: `translateX(${index * 10}px) translateY(${index * 5}px)`,
                }"
              >
                <img :src="image.previewUrl" :alt="`최종 결과 ${index + 1}`" />
                <div class="image-number">{{ index + 1 }}</div>
              </div>
            </div>
            <div class="canvas-ph" v-else>이미지 없음</div>
          </div>
          <div class="result-footer">
            <div class="orig-label">원본 문구:</div>
            <div class="orig-value link">
              {{ userCaption || '입력된 문구 없음' }}
            </div>
            <div class="result-note">
              <span class="info-icon" /> 총 {{ uploadedImages.length }}장 중 앞의
              {{ Math.min(uploadedImages.length, 3) }}장을 분석하여 생성된 결과입니다
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <div class="download-row">
            <div class="download-left"><span class="dl-icon" /> 콘텐츠 활용</div>
            <div class="download-btns">
              <button
                class="download-btn copy-btn"
                type="button"
                @click="$emit('copy-to-clipboard')"
              >
                <span class="btn-icon" /> 텍스트 복사
              </button>
              <button
                class="download-btn post-btn"
                type="button"
                @click="$emit('post-to-instagram')"
              >
                <span class="btn-icon" /> 인스타그램 게시하기
              </button>
            </div>
          </div>
          <div class="start-over-row">
            <button class="start-over-btn" type="button" @click="$emit('start-over')">
              다시 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  uploadedImages: {
    type: Array,
    default: () => [],
  },
  userCaption: {
    type: String,
    default: '',
  },
  generatedText: {
    type: String,
    default: '',
  },
  generatedHashtags: {
    type: Array,
    default: () => [],
  },
  generatedBestTime: {
    type: String,
    default: '',
  },
  generatedImpact: {
    type: String,
    default: '',
  },
});

defineEmits(['copy-to-clipboard', 'post-to-instagram', 'start-over']);
</script>

<style scoped>
.step4 {
  width: 100%;
  display: flex;
  justify-content: center;
}

.step4__grid {
  width: 940px;
  max-width: calc(100% - 48px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

/* Common Box Styling */
.final-box,
.result-card {
  border: 1.2px solid var(--color-main);
  border-radius: 12px;
  background: var(--color-white);
  overflow: hidden;
}

/* Title Styling */
.final-box__title,
.result-card__title {
  padding: 12px 16px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #f3d9cf;
  background: var(--color-white);
}

.final-box__title {
  border-bottom: 1px solid #f3d9cf;
}

.red-icon {
  width: 10px;
  height: 10px;
  background: var(--color-sub);
  border-radius: 999px;
  display: inline-block;
}

/* Body and Content Styling */
.final-box__body {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.final-caption {
  border: 1px solid #f3d9cf;
  background: var(--color-light-3);
  border-radius: 8px;
}

.final-caption__header {
  padding: 8px 10px;
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid #f3d9cf;
}

.green-dot {
  width: 8px;
  height: 8px;
  background: var(--color-main);
  border-radius: 999px;
  display: inline-block;
}

.final-caption__inner {
  padding: 16px;
}

.final-caption__text {
  white-space: pre-wrap;
  line-height: 1.8;
  color: #333;
  font-size: 14px;
}

.final-hashtags {
  margin-top: 0;
}

.hash-title {
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.hash-icon {
  width: 8px;
  height: 8px;
  background: var(--color-sub);
  display: inline-block;
  border-radius: 999px;
}

.hash-bubble {
  border: 1px solid #f3d9cf;
  background: var(--color-white);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #444;
}

.final-metrics {
  margin-top: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.metric {
  border: 1px solid #f3d9cf;
  background: var(--color-light-3);
  border-radius: 8px;
  padding: 10px 12px;
}

.metric-label {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 13px;
  color: #333;
}

.clock-icon,
.spark-icon {
  width: 10px;
  height: 10px;
  background: var(--color-sub);
  display: inline-block;
  border-radius: 999px;
}

/* Result Card Styling */
.result-card__title {
  padding: 10px 12px;
  border-bottom: 1px solid #f3d9cf;
  background: var(--color-white);
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.eye {
  font-size: 16px;
}

.result-canvas {
  padding: 24px;
  height: 432px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-images {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-image {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 3px solid var(--color-white);
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-number {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--color-sub);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-ph {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

.result-footer {
  padding: 16px;
  border-top: 1px solid #f3d9cf;
  background: var(--color-light-2);
}

.orig-label {
  font-size: 12px;
  color: #6f7275;
}

.orig-value {
  margin-top: 4px;
  color: var(--color-sub);
  font-weight: 700;
}

.result-note {
  margin-top: 8px;
  font-size: 11px;
  color: #9aa0a6;
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-icon {
  width: 10px;
  height: 10px;
  background: var(--color-main);
  border-radius: 999px;
  display: inline-block;
}

/* Action Buttons Section */
.action-buttons {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.download-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.download-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.dl-icon {
  width: 10px;
  height: 10px;
  background: var(--color-sub);
  border-radius: 999px;
  display: inline-block;
}

.download-btns {
  display: flex;
  gap: 8px; /* Adjusted gap */
}

.download-btn {
  border: none;
  background: var(--color-sub); /* Unified color */
  color: #fff;
  border-radius: 8px; /* Slightly smaller border-radius */
  padding: 10px 14px; /* Reduced padding for smaller size */
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 13px; /* Smaller font size */
}

.download-btn:hover {
  filter: brightness(0.95);
}

.btn-icon {
  width: 8px;
  height: 8px;
  background: var(--color-white);
  border-radius: 999px;
  display: inline-block;
  margin-right: 6px;
}

/* Start Over Button Section */
.start-over-row {
  display: flex;
  justify-content: flex-end;
}

.start-over-btn {
  border: 1px solid #ddd;
  background: #f0f0f0;
  color: #666;
  border-radius: 10px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
}

.start-over-btn:hover {
  filter: brightness(0.98);
}
</style>
