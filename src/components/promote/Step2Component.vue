<template>
  <section class="step2">
    <div class="step2__grid">
      <!-- 왼쪽 -->
      <div class="col-left">
        <div class="uploaded-box">
          <div class="uploaded-box__header">
            <span class="check-dot" aria-hidden>•</span>
            <strong>1단계 완료: {{ uploadedImages.length }}장 사진 업로드됨</strong>
          </div>
          <div class="uploaded-box__body">
            <div class="images-preview">
              <div
                v-for="(image, index) in uploadedImages.slice(0, 3)"
                :key="image.id"
                class="thumb"
                :class="{ 'analyze-thumb': index < 3 }"
              >
                <img :src="image.imageUrl" :alt="`업로드된 사진 ${index + 1}`" />
                <div class="thumb-badge">{{ index + 1 }}</div>
              </div>
              <div v-if="uploadedImages.length > 3" class="more-indicator">
                +{{ uploadedImages.length - 3 }}장 더
              </div>
            </div>
            <div class="meta">
              <div class="meta-title">업로드된 사진 (AI 분석: 앞 3장)</div>
              <button type="button" class="link-change" @click="$emit('back-to-upload')">
                사진 변경하기
              </button>
            </div>
          </div>
        </div>

        <div class="field">
          <label class="field__label">문구 입력 <span class="required">*</span></label>
          <div class="textarea-wrap">
            <textarea
              :value="userCaption"
              @input="$emit('update-caption', $event.target.value)"
              class="textarea"
              :maxlength="100"
              placeholder="어떤 내용을 담고 싶으신가요? (예: 오늘 만든 특별한 요리, 새로 출시한 제품 소개 등)"
            ></textarea>
            <button
              class="clear-btn"
              type="button"
              v-if="userCaption"
              @click="$emit('update-caption', '')"
              aria-label="clear"
            >
              ×
            </button>
          </div>
          <div class="field__meta">
            <span class="agree"><span class="dot" /> 게시글 내용은 AI가 자동으로 다듬어서 생성해드려요</span>
            <span class="count">{{ userCaption.length }}/100</span>
          </div>
        </div>

        <div class="tips">
          <div class="tips__title">작성 팁</div>
          <ul class="tips__list">
            <li>꼭 들어갔으면 하는 문구·키워드를 입력해주세요.</li>
            <li>상호명·지역·이벤트·가격·URL 등을 입력해보세요.</li>
            <li>너무 길지 않게 핵심만 담아주세요.</li>
            <li>AI가 문구를 다듬어 매력적인 컨텐츠를 만들어드려요.</li>
          </ul>
        </div>
      </div>

      <!-- 오른쪽 -->
      <div class="col-right">
        <div class="preview-card">
          <div class="preview-card__title">
            <span class="eye" aria-hidden>👁️</span> 실시간 미리보기
          </div>
          <div class="preview-canvas">
            <div class="preview-badge">PREVIEW</div>
            <div class="preview-images" v-if="uploadedImages.length > 0">
              <img
                v-for="(image, index) in uploadedImages.slice(0, 3)"
                :key="image.id"
                :src="image.imageUrl"
                :alt="`미리보기 ${index + 1}`"
                class="preview-img"
                :style="{ zIndex: 3 - index }"
              />
            </div>
          </div>
          <div class="preview-footer">
            <div class="preview-label">입력한 문구:</div>
            <div class="preview-text">{{ userCaption || '문구를 입력해주세요' }}</div>
            <p class="preview-help">* AI가 이 문구를 바탕으로 홍보성 콘텐츠를 생성합니다</p>
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
    default: () => []
  },
  userCaption: {
    type: String,
    default: ''
  }
});

defineEmits(['update-caption', 'back-to-upload']);
</script>

<style scoped>
.step2 {
  width: 940px;
  max-width: calc(100% - 48px);
  margin-top: 16px;
}

.step2__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;
}

/* 업로드 정보 박스 */
.uploaded-box {
  border: 1px solid var(--color-light-1);
  background: var(--color-light-3);
  border-radius: 8px;
  padding: 16px;
}

.uploaded-box__header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #333;
  margin-bottom: 12px;
}

.check-dot {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--color-sub);
  color: #fff;
  font-weight: 700;
}

.uploaded-box__body {
  display: flex;
  gap: 12px;
  align-items: center;
}

.images-preview {
  display: flex;
  gap: 6px;
  align-items: center;
}

.thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-light-1);
  background: var(--color-white);
  flex: 0 0 auto;
  position: relative;
}

.thumb.analyze-thumb {
  border: 2px solid var(--color-sub);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: var(--color-sub);
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-indicator {
  font-size: 12px;
  color: #666;
  font-weight: 600;
  margin-left: 4px;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-title {
  font-size: 13px;
  color: #666;
}

.link-change {
  background: none;
  border: none;
  color: var(--color-sub);
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

/* 입력 필드 */
.field {
  margin-top: 24px;
}

.field__label {
  font-size: 14px;
  font-weight: 600;
}

.required {
  color: var(--color-sub);
}

.textarea-wrap {
  position: relative;
  margin-top: 8px;
}

.textarea {
  width: 100%;
  height: 140px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 36px 12px 12px;
  font-size: 14px;
  resize: none;
  font-family: inherit;
}

.textarea:focus {
  outline: none;
  border-color: var(--color-sub);
}

.clear-btn {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: var(--color-white);
  cursor: pointer;
}

.field__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
  font-size: 12px;
  color: #6f7275;
}

.field__meta .dot {
  width: 6px;
  height: 6px;
  background: var(--color-sub);
  display: inline-block;
  border-radius: 999px;
  margin-right: 6px;
}

.count {
  color: #9aa0a6;
}

/* 팁 */
.tips {
  margin-top: 16px;
  border: 1px solid var(--color-light-1);
  background: var(--color-light-3);
  border-radius: 8px;
  padding: 14px;
}

.tips__title {
  font-weight: 700;
  margin-bottom: 8px;
  font-size: 14px;
}

.tips__list {
  margin: 0;
  padding-left: 18px;
}

.tips__list li {
  margin: 4px 0;
  font-size: 13px;
  color: #5f6368;
}

/* 미리보기 */
.preview-card {
  border: 1px solid var(--color-light-1);
  background: var(--color-white);
  border-radius: 8px;
  overflow: hidden;
}

.preview-card__title {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-light-1);
  background: var(--color-light-3);
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.preview-canvas {
  position: relative;
  height: 420px;
  background: var(--color-light-2);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.preview-badge {
  font-size: 20px;
  letter-spacing: 4px;
  padding: 6px 10px;
  border: 2px solid var(--color-main);
  color: var(--color-sub);
  border-radius: 4px;
  z-index: 2;
  position: relative;
}

.preview-images {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.preview-img {
  max-width: 30%;
  max-height: 80%;
  object-fit: cover;
  border-radius: 8px;
  opacity: 0.3;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-footer {
  padding: 12px;
  border-top: 1px solid var(--color-light-1);
}

.preview-label {
  font-size: 12px;
  color: #6f7275;
  margin-bottom: 6px;
}

.preview-text {
  font-weight: 700;
  color: var(--color-sub);
}

.preview-help {
  margin-top: 6px;
  font-size: 11px;
  color: #9aa0a6;
}
</style>
