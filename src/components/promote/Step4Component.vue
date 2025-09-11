<template>
  <section class="step4">
    <div class="step4__grid">
      <!-- 왼쪽 영역: 최종 생성 콘텐츠 -->
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

            <div v-if="generatedHashtags && generatedHashtags.length > 0" class="final-hashtags">
              <div class="hash-title"><span class="hash-icon" /> 추천 해시태그</div>
              <div class="hash-bubble">{{ generatedHashtags.join(' ') }}</div>
            </div>

            <div v-if="generatedBestTime || generatedImpact" class="final-metrics">
              <div v-if="generatedBestTime" class="metric">
                <div class="metric-label"><span class="clock-icon" /> 최적 게시 시간</div>
                <div class="metric-value">{{ generatedBestTime }}에 게시하면 더 많은 관심을 받을 확률이 높습니다.</div>
              </div>
              <div v-if="generatedImpact" class="metric">
                <div class="metric-label"><span class="spark-icon" /> 예상 효과</div>
                <div class="metric-value">{{ generatedImpact }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 액션 버튼 - 왼쪽으로 이동 -->
        <div class="action-buttons">
          <div class="download-row">
            <div class="download-left"><span class="dl-icon" /> 콘텐츠 활용</div>
            <div class="download-btns">
              <button
                class="download-btn copy-btn"
                type="button"
                @click="$emit('copy-to-clipboard')"
              >
                <i class="fa-regular fa-copy"></i> 텍스트 복사
              </button>
              <button
                class="download-btn post-btn"
                type="button"
                @click="uploadToInstagram"
              >
                <i class="fa-brands fa-instagram"></i> 게시글 업로드
              </button>
            </div>
          </div>

          <!-- 안내 문구 추가 -->
          <div class="action-guide">
            <div class="guide-item">* 텍스트 복사를 통해 직접 인스타그램에서 편집하고 문구를 넣을 수 있습니다.</div>
            <div class="guide-item">* 게시글 업로드 시, 인스타그램 로그인 연동 후 해당 계정에 바로 게시물을 업로드합니다.</div>
          </div>
        </div>
      </div>

      <!-- 오른쪽 영역: 인스타 게시글 미리보기 -->
      <div class="final-right">
        <div class="result-card insta-preview-vertical">
          <!-- 헤더 -->
          <div class="insta-header">
            <div class="insta-user">
              <img class="insta-profile" :src="snsStore.instagram.profileImage || defaultAvatar" alt="프로필" />
              <span>{{ snsStore.instagram.username || 'username' }}</span>
              <span class="preview-tag">(미리보기)</span>
            </div>
            <div class="insta-options">
              <i class="fa-solid fa-ellipsis"></i>
            </div>
          </div>

          <!-- 게시글 이미지 (슬라이드 가능) -->
          <div class="insta-image">
            <img
              v-if="uploadedImages.length > 0"
              :src="uploadedImages[currentImageIndex].previewUrl"
              alt="게시글 이미지"
            />
            <div v-else class="image-placeholder">사진 없음</div>
            <button
              v-if="uploadedImages.length > 1"
              class="img-prev"
              @click="prevImage"
            >
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <button
              v-if="uploadedImages.length > 1"
              class="img-next"
              @click="nextImage"
            >
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <!-- 좋아요, 댓글, 전송 아이콘 -->
          <div class="insta-actions">
            <i class="fa-regular fa-heart"></i>
            <i class="fa-regular fa-comment"></i>
            <i class="fa-regular fa-paper-plane"></i>
            <i class="fa-regular fa-bookmark insta-bookmark"></i>
          </div>

          <!-- 좋아요 수 -->
          <div class="insta-likes">좋아요 1,230개</div>

          <!-- 캡션 (AI 첫 줄 + ...더보기) -->
          <div class="insta-caption">
            <span class="insta-username">{{ snsStore.instagram.username || 'username' }}</span>
            <span v-if="!showFullCaption">
              {{ firstLineAI }}
              <span v-if="hasMoreLines" class="more-btn" @click="showFullCaption = true">...더보기</span>
            </span>
            <span v-else>
              {{ props.generatedText }}
            </span>
          </div>

          <!-- 댓글 -->
          <div class="insta-comments">
            댓글 12개 모두 보기
          </div>

          <!-- 시간 정보 -->
          <div class="insta-time">1시간 전</div>
        </div>

        <!-- Instagram 로그인 모달 -->
        <InstagramLoginModal
          ref="instagramLoginModal"
          :visible="showInstagramModal"
          @close="showInstagramModal = false"
          @login-success="handleInstagramLoginSuccess"
        />

        <!-- 업로드 완료 모달 -->
        <div v-if="showUploadCompleteModal" class="modal-overlay">
  <div class="upload-complete-modal">
    <div class="modal-content-center">
      <div class="success-icon">
        <i class="fa-solid fa-check"></i>
      </div>
      <h3 class="modal-title">인스타 업로드 완료!</h3>
      <p class="upload-message">
        <strong>{{ snsStore.instagram.username }}</strong> 계정에<br>
        게시물이 업로드되었습니다. <br>
        지금 바로 확인해보세요!
      </p>
    </div>
  </div>
</div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import InstagramLoginModal from '../sns/insta/InstagramLoginModal.vue';
import { useSnsStore } from '@/stores/useSnsStore';
import { useToastStore } from '@/stores/useToastStore';
import defaultAvatar from '@/assets/default_avatar.png';

const props = defineProps({
  uploadedImages: { type: Array, default: () => [] },
  userCaption: { type: String, default: '' },
  generatedText: { type: String, default: '' },
  generatedHashtags: { type: Array, default: () => [] },
  generatedBestTime: { type: String, default: '' },
  generatedImpact: { type: String, default: '' },
});

const emit = defineEmits(['copy-to-clipboard', 'post-to-instagram', 'start-over']);

const snsStore = useSnsStore();
const toastStore = useToastStore();
const showInstagramModal = ref(false);
const showUploadCompleteModal = ref(false);
const instagramLoginModal = ref(null);
const showFullCaption = ref(false);

// 이미지 슬라이드
const currentImageIndex = ref(0);
const nextImage = () => {
  if (props.uploadedImages.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % props.uploadedImages.length;
  }
};
const prevImage = () => {
  if (props.uploadedImages.length > 1) {
    currentImageIndex.value =
      (currentImageIndex.value - 1 + props.uploadedImages.length) % props.uploadedImages.length;
  }
};

// AI 캡션 첫 줄만 보여주기
const firstLineAI = computed(() => {
  if (!props.generatedText) return '';
  const lines = props.generatedText.split('\n');
  return lines[0];
});
const hasMoreLines = computed(() => {
  if (!props.generatedText) return false;
  return props.generatedText.includes('\n') || props.generatedText.length > firstLineAI.value.length;
});

// 인스타 업로드 함수
const uploadToInstagram = () => {
  if (snsStore.instagram.connected) {
    showUploadCompleteModal.value = true;
  } else {
    showInstagramModal.value = true;
  }
};

const handleInstagramLoginSuccess = (username) => {
  showInstagramModal.value = false;
  showUploadCompleteModal.value = true;
};

// 자동 닫기
watch(showUploadCompleteModal, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      showUploadCompleteModal.value = false;
    }, 3000);
  }
});

</script>

<style scoped>
/* 기존 스타일 그대로 유지 */
.preview-tag {
  color: #999;
  font-size: 14px;
  margin-left: 4px;
  font-weight: 500;
}

.step4 {
  width: 100%;
  display: flex;
  justify-content: center;
}
.step4__grid {
  width: 940px;
  max-width: calc(100% - 48px);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: start;
}

.final-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.final-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
.insta-preview-vertical {
  border: 1px solid #dbdbdb;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  width: 400px;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
}

.insta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  font-weight: 700;
  font-size: 14px;
}

.insta-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.insta-user i {
  font-size: 28px;
}

.insta-options i {
  cursor: pointer;
}

.insta-image {
  width: 100%;
  aspect-ratio: 1;
  position: relative;
  overflow: hidden;
}

.insta-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 슬라이드 버튼 */
.img-prev,
.img-next {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}
.img-prev { left: 8px; }
.img-next { right: 8px; }

/* 이미지 개수 표시 */
.image-counter {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0,0,0,0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  z-index: 10;
}

/* 점 인디케이터 */
.image-dots {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 10;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dot.active {
  background: rgba(255,255,255,0.9);
  transform: scale(1.2);
}

.dot:hover {
  background: rgba(255,255,255,0.7);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
}

.insta-actions {
  padding: 8px 12px;
  display: flex;
  gap: 16px;
  font-size: 22px;
  position: relative;
}

.insta-bookmark {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.insta-likes {
  padding: 0 12px;
  font-weight: 700;
  margin-bottom: 6px;
  font-size: 13px;
}

.insta-caption {
  padding: 0 12px;
  margin-bottom: 6px;
  line-height: 1.4;
  font-size: 13px;
}

.insta-username {
  font-weight: 700;
  margin-right: 6px;
  font-size: 13px;
}

.insta-comments {
  padding: 0 12px;
  color: #8e8e8e;
  font-size: 12px;
  margin-bottom: 6px;
}

.insta-time {
  padding: 0 12px 12px 12px;
  font-size: 10px;
  color: #999;
}

/* Action Buttons Section */
.action-buttons {
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
  gap: 8px;
}

.download-btn {
  border: none;
  background: var(--color-sub);
  color: #fff;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 13px;
}

.download-btn:hover {
  filter: brightness(0.95);
}

/* 안내 문구 스타일 */
.action-guide {
  margin-top: 8px;
}

.guide-item {
  color: #999;
  font-size: 13px;
  line-height: 1.4;
  margin: 4px 0;
  word-break: keep-all;
}

.insta-profile {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ddd;
}

.more-btn {
  cursor: pointer;
  color: #555;
  font-weight: 500;
}

.more-btn:hover {
  color: #000;
}

/* 업로드 완료 모달 스타일 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.upload-complete-modal {
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  width: 300px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: modalSlideUp 0.3s ease-out;
}

.modal-content-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #E1306C;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon i {
  font-size: 28px;
  color: white;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
}

.upload-message {
  font-size: 14px;
  color: #333;
  text-align: center;
}

@keyframes modalSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>
