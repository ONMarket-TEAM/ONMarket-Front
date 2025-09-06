<template>
  <section class="upload-section">
    <div class="upload-drop" :class="{ 'has-images': uploadedImages.length > 0 }" @drop.prevent="handleDrop" @dragover.prevent>
      <input
        type="file"
        ref="fileInput"
        accept="image/jpeg,image/png"
        multiple
        @change="handleFileChange"
        hidden
      />

      <div v-if="uploadedImages.length > 0" class="uploaded-grid">
        <div class="upload-header">
          <div class="header-left">
            <h3>업로드된 이미지 <span class="count-text">({{ uploadedImages.length }}/20)</span></h3>
            <p class="ai-info">
              * 온마켓이 앞의 3장을 분석하여 최적화된 콘텐츠를 생성해드려요
            </p>
          </div>
          <button class="add-more-btn" type="button" @click="openPicker" :disabled="isUploading || uploadedImages.length >= 20">
            <span v-if="isUploading">업로드 중...</span>
            <span v-else-if="uploadedImages.length >= 20">최대 20장 업로드 완료</span>
            <span v-else>+ 더 추가하기</span>
          </button>
        </div>

        <div class="images-grid">
          <div
            v-for="(image, index) in uploadedImages"
            :key="image.id"
            class="image-item"
            :class="{ 'will-analyze': index < 3 }"
          >
            <div class="image-wrapper">
              <img :src="image.imageUrl" :alt="`업로드된 이미지 ${index + 1}`" />
              <div class="image-overlay">
                <button class="remove-btn" @click="removeImage(image.id)" aria-label="이미지 제거">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5 6.5L6.5 17.5M6.5 6.5L17.5 17.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              <div v-if="index < 3" class="analyze-badge">
                AI 분석 {{ index + 1 }}
              </div>
            </div>
            <div class="image-meta">
              <span class="image-number">{{ index + 1 }}</span>
              <span class="filename">{{ image.filename || `이미지 ${index + 1}` }}</span>
            </div>
          </div>
        </div>

        <div class="upload-status">
          <p v-if="isUploading">새 이미지 업로드 중...</p>
          <p v-else>업로드 완료! 더 추가하거나 다음 단계로 진행하세요.</p>
        </div>
      </div>

      <button v-else class="upload-inner" type="button" @click="openPicker" :disabled="isUploading">
        <div v-if="isUploading" class="loading-spinner"></div>
        <svg
          v-else
          class="cloud"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.31-2A4.5 4.5 0 0 0 5 18"
            :stroke="gray600"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M12 13v6m0-6-2.5 2.5M12 13l2.5 2.5"
            :stroke="gray600"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <p class="upload-text-1">
          {{ isUploading ? '업로드 중...' : '사진을 드래그하거나 클릭해서 업로드하세요' }}
        </p>
        <p class="upload-text-2" v-if="!isUploading">JPG, PNG 파일 지원 (최대 10MB, 20장까지)</p>
        <p class="upload-text-3" v-if="!isUploading">제품, 음식, 풍경, 인물 등 모든 사진 가능</p>
        <p class="upload-text-4" v-if="!isUploading">
          <span class="highlight"> ※ 여러 장 선택 시 AI가 앞의 3장을 분석합니다</span>
        </p>
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  uploadedImages: {
    type: Array,
    default: () => []
  },
  isUploading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['upload-files', 'remove-image']);

const fileInput = ref(null);
const gray600 = ref('#9AA0A6');

onMounted(() => {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--color-gray-600');
  if (v) gray600.value = v.trim();
});

function openPicker() {
  if (!props.isUploading && props.uploadedImages.length < 20) {
    fileInput.value?.click();
  }
}

function handleFileChange(e) {
  const files = Array.from(e.target.files || []);
  if (files.length > 0) {
    emit('upload-files', files);
  }
  e.target.value = '';
}

function handleDrop(e) {
  const files = Array.from(e.dataTransfer.files || []);
  if (files.length > 0) {
    emit('upload-files', files);
  }
}

function removeImage(imageId) {
  emit('remove-image', imageId);
}
</script>

<style scoped>
/* 섹션 컨테이너: 전체 너비 및 마진 */
.upload-section {
  width: 940px;
  max-width: calc(100% - 48px);
  margin: 24px auto 0; /* 중앙 정렬 */
}

/* 드롭존 기본 스타일 */
.upload-drop {
  border: 2px dashed var(--color-gray-400, #d9d9d9); /* 변수 사용 권장 */
  border-radius: 12px;
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-white, #ffffff);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  padding: 24px;
}

/* 이미지가 있을 때 드롭존 스타일 */
.upload-drop.has-images {
  border: 2px solid var(--color-sub);
  background: var(--color-gray-100, #f8f9fa);
  min-height: auto;
  align-items: flex-start;
  padding-bottom: 32px; /* 하단 여백 추가 */
}

/* 로딩 스피너 */
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-sub);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 업로드된 이미지 그리드 컨테이너 */
.uploaded-grid {
  width: 100%;
}

/* 업로드 헤더: Flexbox를 사용하여 좌우 정렬 */
.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end; /* 하단 정렬 */
  margin-bottom: 24px;
}

.upload-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-sub);
}

.upload-header .count-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-gray-600, #9aa0a6);
}

/* AI 정보 영역 */
.ai-info {
  margin: 8px 0 0 0;
  padding: 8px 12px;

  border-radius: 8px;
  font-size: 14px;
  color: var(--color-sub-dark, #666);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.info-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0; /* 아이콘 크기 고정 */
}

/* 더 추가하기 버튼 */
.add-more-btn {
  background: var(--color-sub);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-more-btn:hover:not(:disabled) {
  background: var(--color-main);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.add-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 이미지 그리드 */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px; /* 간격 넓힘 */
  margin-bottom: 24px;
}

/* 개별 이미지 아이템 */
.image-item {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}

.image-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.image-item.will-analyze {
  border: 2px solid var(--color-sub);
}

.image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 비율 유지 */
  overflow: hidden;
}

.image-wrapper img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 오버레이 */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

/* 제거 버튼 */
.remove-btn {
  background: rgba(253, 202, 191, 0.9);
  border: 1px solid white;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: var(--color-danger, #dc3545);
}

/* AI 분석 배지 */
.analyze-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: var(--color-sub);
  color: white;
  padding: 4px 10px;
  border-radius: 20px; /* 둥근 모양으로 변경 */
  font-size: 11px;
  font-weight: 600;
}

/* 이미지 메타 정보 */
.image-meta {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.image-number {
  background: var(--color-sub);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.filename {
  font-size: 13px;
  color: var(--color-gray-700, #495057);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 업로드 상태 텍스트 */
.upload-status {
  text-align: center;
  color: var(--color-gray-600, #666);
  font-size: 14px;
}

.upload-status p {
  margin: 0;
}

/* 업로드 드롭존 내부 버튼 */
.upload-inner {
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: center;
  width: 100%;
  height: 100%;
  padding: 24px;
}

.upload-inner:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* 업로드 텍스트 */
.cloud {
  display: block;
  margin: 0 auto 20px;
}

.upload-text-1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-gray-800, #3c4043);
}

.upload-text-2,
.upload-text-3 {
  margin: 8px 0 0 0;
  font-size: 15px;
  color: var(--color-gray-600, #6f7275);
}

.upload-text-4 {
  margin: 24px 0 0 0;
  font-size: 14px;
}

.highlight {
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 600;
  background: var(--color-highlight-bg, #fff2f2);
  color: var(--color-highlight-text, #FF7474);
}
</style>
