<template>
  <section class="step3">
    <div class="step3-topbox">
      <div class="left">
        <div class="badge-line">
          <span class="check-dot">•</span>
          <strong>1-2단계 완료</strong>
        </div>
        <div class="upload-mini">
          <div class="images-mini">
            <div
              v-for="(image, index) in uploadedImages.slice(0, 3)"
              :key="image.id"
              class="thumb"
            >
              <img :src="image.previewUrl" :alt="`분석된 사진 ${index + 1}`" />
              <div class="mini-badge">{{ index + 1 }}</div>
            </div>
          </div>
          <div class="meta">
            <div class="meta-title">AI 분석 대상 ({{ Math.min(uploadedImages.length, 3) }}장)</div>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="input-preview">
          <div class="label">입력 문구</div>
          <div class="bubble">{{ userCaption || '문구를 입력해주세요' }}</div>
        </div>
      </div>
    </div>

    <h2 class="h3">3단계: AI가 생성한 문구를 확인하고 편집해보세요</h2>
    <p class="analyze-info">
    * 온마켓이 업로드된 {{ uploadedImages.length }}장 중 앞의 {{ Math.min(uploadedImages.length, 3) }}장을 분석하여 최적화된 콘텐츠를 생성해드려요
    </p>

    <div class="ai-card-wrapper">
      <button class="back-fab" type="button" @click="$emit('back-to-step2')" aria-label="go back">
        ‹
      </button>
      <div class="ai-card">
        <div class="ai-card__header">
          <div class="title">
            <span class="red-dot" />
            {{ isGenerating ? 'AI 문구 생성 중...' : 'AI 생성 문구' }}
          </div>
          <div class="actions" v-if="!isGenerating && generatedText">
            <button class="btn-edit" type="button" @click="$emit('open-edit-modal')">편집하기</button>
            <button class="btn-restore" type="button" @click="$emit('restore-original')">
              원본으로 복원
            </button>
          </div>
        </div>
        <div class="ai-card__body">
          <div v-if="isGenerating" class="generating-state">
            <div class="loading-spinner"></div>
            <p>AI가 {{ Math.min(uploadedImages.length, 3) }}장의 이미지를 분석하여 문구를 작성하고 있습니다...</p>
          </div>
          <div v-else-if="generatedText" class="ai-output">{{ generatedText }}</div>
          <div v-else class="ai-placeholder">AI 문구가 생성되면 여기에 표시됩니다.</div>
        </div>
        <div class="ai-card__foot" v-if="!isGenerating && generatedText">
          <span class="warn-dot" /> 마음에 들지 않으면 편집하기 버튼을 눌러 수정해주세요
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
  },
  generatedText: {
    type: String,
    default: ''
  },
  originalGeneratedText: {
    type: String,
    default: ''
  },
  isGenerating: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update-generated-text', 'restore-original', 'back-to-step2', 'open-edit-modal']);
</script>

<style scoped>
.step3 {
  width: 940px;
  max-width: calc(100% - 48px);
  margin-top: 16px;
}

.step3-topbox {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border: 1.2px solid var(--color-main);
  background: var(--color-light-3);
  border-radius: 12px;
  padding: 20px;
}

.step3-topbox .badge-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
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

.step3-topbox .upload-mini {
  display: flex;
  align-items: center;
  gap: 12px;
}

.images-mini {
  display: flex;
  gap: 4px;
}

.thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-light-1);
  background: var(--color-white);
  position: relative;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-badge {
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

.meta-title {
  font-size: 13px;
  color: #666;
}

.input-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-preview .label {
  font-size: 12px;
  color: #6f7275;
  margin-right: 2px;
}

.input-preview .bubble {
  background: var(--color-white);
  border: 1.2px solid var(--color-sub);
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: 600;
  color: var(--color-sub);
  line-height: 1.5;
}

.h3 {
  margin: 18px 0 8px 0;
  font-size: 18px;
  font-weight: 700;
}

.analyze-info {
  margin: 0 0 16px 0;
  padding: 12px 16px;
  /* background: #e8f5e8; */
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.robot-icon {
  font-size: 18px;
}

/* AI 카드 */
.ai-card-wrapper {
  position: relative;
}

.back-fab {
  position: absolute;
  left: -22px;
  top: 44px;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1.2px solid var(--color-main);
  background: var(--color-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--color-sub);
}

.ai-card {
  border: 1.2px solid #eaeaea;
  border-radius: 12px;
  background: var(--color-white);
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.ai-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-light-1);
  background: var(--color-white);
  font-size: 15px;
  font-weight: 700;
}

.ai-card__header .title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.red-dot {
  width: 8px;
  height: 8px;
  background: var(--color-sub);
  display: inline-block;
  border-radius: 999px;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-edit {
  background: var(--color-sub);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  padding: 6px 12px;
  font-weight: 500;
  cursor: pointer;
}

.btn-edit:hover {
  filter: brightness(0.95);
}

.btn-restore {
  background: var(--color-white);
  border: 1px solid #ccc;
  color: #666;
  border-radius: 6px;
  font-size: 13px;
  padding: 6px 12px;
  font-weight: 500;
  cursor: pointer;
}

.btn-restore:hover {
  border-color: var(--color-sub);
  color: var(--color-sub);
}

.ai-card__body {
  padding: 18px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--color-sub);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.generating-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.generating-state p {
  margin-top: 16px;
  font-size: 14px;
}

.ai-output {
  background: var(--color-white);
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 18px;
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.ai-placeholder {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-style: italic;
}

.ai-card__foot {
  padding: 12px 16px;
  background: #fafafa;
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 6px;
}

.warn-dot {
  width: 8px;
  height: 8px;
  background: var(--color-sub);
  display: inline-block;
  border-radius: 999px;
}
</style>
