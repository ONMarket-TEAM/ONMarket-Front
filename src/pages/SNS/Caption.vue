<template>
  <div class="page">
    <!-- 진행 스텝 -->
    <section class="stepper" aria-label="progress">
      <div class="stepper__item" :class="{ 'is-active': currentStep >= 1 }">
        <div class="dot">1</div>
        <div class="label">사진 업로드</div>
      </div>
      <div class="connector"></div>
      <div class="stepper__item" :class="{ 'is-active': currentStep >= 2 }">
        <div class="dot">2</div>
        <div class="label">문구 입력</div>
      </div>
      <div class="connector"></div>
      <div class="stepper__item" :class="{ 'is-active': currentStep >= 3 }">
        <div class="dot">3</div>
        <div class="label">스타일 선택</div>
      </div>
      <div class="connector"></div>
      <div class="stepper__item" :class="{ 'is-active': currentStep >= 4 }">
        <div class="dot">4</div>
        <div class="label">콘텐츠 생성</div>
      </div>
    </section>

    <!-- 타이틀 -->
    <h1 class="title" v-if="currentStep === 1">1단계: 사진을 업로드해주세요</h1>
    <h1 class="title" v-else-if="currentStep === 2">2단계: 표현하고 싶은 문구를 입력해주세요</h1>
    <h1 class="title" v-else-if="currentStep === 3">3단계: 업로드 전에 편집해주세요</h1>
    <h1 class="title" v-else-if="currentStep === 4">4단계: 완성된걸 업로드하세요</h1>

    <!-- STEP 1: 업로드 -->
    <section class="upload-section" v-if="currentStep === 1">
      <div class="upload-drop" @drop.prevent="handleDrop" @dragover.prevent>
        <input
          type="file"
          ref="fileInput"
          accept="image/jpeg,image/png"
          @change="handleFileChange"
          hidden
        />
        <button class="upload-inner" type="button" @click="openPicker">
          <svg
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
          <p class="upload-text-1">사진을 드래그하거나 클릭해서 업로드하세요</p>
          <p class="upload-text-2">JPG, PNG 파일 지원 (최대 10MB)</p>
          <p class="upload-text-3">제품, 음식, 풍경, 인물 등 모든 사진 가능</p>
        </button>
      </div>
    </section>

    <!-- STEP 2: 입력 + 미리보기 -->
    <section class="step2" v-if="currentStep === 2">
      <div class="step2__grid">
        <!-- 왼쪽 -->
        <div class="col-left">
          <div class="uploaded-box">
            <div class="uploaded-box__header">
              <span class="check-dot" aria-hidden>•</span>
              <strong>1단계 완료: 사진 업로드됨</strong>
            </div>
            <div class="uploaded-box__body">
              <div class="thumb" v-if="uploadedUrls[0]">
                <img :src="uploadedUrls[0]" alt="업로드된 사진" />
              </div>
              <div class="thumb-placeholder" v-else>썸네일</div>
              <div class="meta">
                <div class="meta-title">업로드된 사진</div>
                <button type="button" class="link-change" @click="backToUpload">
                  사진 변경하기
                </button>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="field__label">문구 입력 <span class="required">*</span></label>
            <div class="textarea-wrap">
              <textarea
                v-model="userCaption"
                class="textarea"
                :maxlength="100"
                placeholder="입력해주세요"
              ></textarea>
              <button
                class="clear-btn"
                type="button"
                v-if="userCaption"
                @click="userCaption = ''"
                aria-label="clear"
              >
                ×
              </button>
            </div>
            <div class="field__meta">
              <span class="agree"><span class="dot" /> 숨습니다</span>
              <span class="count">{{ userCaption.length }}/100</span>
            </div>
          </div>

          <div class="tips">
            <div class="tips__title">작성 팁</div>
            <ul class="tips__list">
              <li>감정이나 상황을 간단히 표현해보세요</li>
              <li>너무 길지 않게 핵심만 담아주세요</li>
              <li>AI가 문구를 다듬어 더 매력적으로 만듭니다</li>
              <li>개인적인 취향이나 느낌을 포함하면 더 좋아요</li>
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
            </div>
            <div class="preview-footer">
              <div class="preview-label">입력한 문구:</div>
              <div class="preview-text">{{ userCaption || '안녕하세요!!!!!' }}</div>
              <p class="preview-help">AI가 이 문구를 바탕으로 매력적인 콘텐츠를 생성합니다</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- STEP 3: AI 문구 확인/편집 -->
    <section class="step3" v-if="currentStep === 3">
      <div class="step3-topbox">
        <div class="left">
          <div class="badge-line">
            <span class="check-dot">•</span>
            <strong>1-2단계 완료</strong>
          </div>
          <div class="upload-mini">
            <div class="thumb" v-if="uploadedUrls[0]">
              <img :src="uploadedUrls[0]" alt="업로드된 사진" />
            </div>
            <div class="thumb thumb--ph" v-else>썸네일</div>
            <div class="meta"><div class="meta-title">업로드된 사진</div></div>
          </div>
        </div>
        <div class="right">
          <div class="input-preview">
            <div class="label">입력 문구</div>
            <div class="bubble">{{ userCaption || '오늘의 특별한 순간' }}</div>
          </div>
        </div>
      </div>

      <h2 class="h3">3단계: AI가 생성한 문구를 확인하고 편집해보세요</h2>

      <div class="ai-card-wrapper">
        <button class="back-fab" type="button" @click="currentStep = 2" aria-label="go back">
          ‹
        </button>
        <div class="ai-card">
          <div class="ai-card__header">
            <div class="title"><span class="red-dot" /> AI 생성 문구</div>
            <div class="actions">
              <button class="btn-edit" type="button" @click="openEditModal">편집하기</button>
              <button class="btn-restore" type="button" @click="restoreOriginal">
                원본으로 복원
              </button>
            </div>
          </div>
          <div class="ai-card__body">
            <div class="ai-output">{{ generatedText }}</div>
          </div>
          <div class="ai-card__foot">
            <span class="warn-dot" /> 마음에 들지 않으면 편집하기 버튼을 눌러 수정해주세요
          </div>
        </div>
      </div>
    </section>

    <!-- STEP 4: 최종 결과 -->
    <section class="step4" v-if="currentStep === 4">
      <div class="step4__grid">
        <div class="final-left">
          <div class="final-box">
            <div class="final-box__title"><span class="red-icon" /> 최종 생성된 콘텐츠</div>
            <div class="final-box__body">
              <div class="final-caption">
                <div class="final-caption__header"><span class="green-dot" /> 완성된 캡션</div>
                <div class="final-caption__inner">
                  <div class="final-caption__title">✨ 오늘의 특별한 순간 ✒️</div>
                  <div class="final-caption__text">
                    {{ generatedText || buildAiText(userCaption) }}
                  </div>
                </div>
              </div>

              <div class="final-hashtags">
                <div class="hash-title"><span class="hash-icon" /> 추천 해시태그</div>
                <div class="hash-bubble">
                  #오늘의특별한순간 #일상 #소중한순간 #행복 #감사 #일상스타그램 #데일리 #좋은하루
                </div>
              </div>

              <div class="final-metrics">
                <div class="metric">
                  <div class="metric-label"><span class="clock-icon" /> 최적 게시 시간</div>
                  <div class="metric-value">오후 7-9시 (한국시간대)</div>
                </div>
                <div class="metric">
                  <div class="metric-label"><span class="spark-icon" /> 예상 효과</div>
                  <div class="metric-value">예상 도달률: 85% 향상</div>
                </div>
              </div>
            </div>
          </div>
          <div class="other-style"><span class="star">★</span> 다른 스타일 버전</div>
        </div>

        <div class="final-right">
          <div class="result-card">
            <div class="result-card__title"><span class="eye" /> 최종 결과물</div>
            <div class="result-canvas"><div class="canvas-ph"></div></div>
            <div class="result-footer">
              <div class="orig-label">원본 문구:</div>
              <div class="orig-value link">{{ userCaption || '오늘의 특별한 순간' }}</div>
              <div class="result-note">
                <span class="info-icon" /> 이미지를 클릭하면 인스타그램 미리보기를 볼 수 있어요
              </div>
            </div>
          </div>

          <div class="download-row">
            <div class="download-left"><span class="dl-icon" /> 다운로드 & 공유</div>
            <button class="download-btn" type="button">
              <span class="btn-icon" /> 이미지 다운로드
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 하단 버튼 -->
    <div class="footer">
      <button v-if="currentStep === 1" class="next-btn" @click="goToStep2">다음</button>
      <button v-else-if="currentStep === 2" class="next-btn" @click="goToStep3">다음</button>
      <button v-else-if="currentStep === 3" class="next-btn" @click="goToStep4">다음</button>
      <button v-else class="next-btn" disabled>업로드하기</button>
    </div>

    <!-- 편집 모달 -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal">
        <div class="modal-header">
          <strong>문구 편집</strong>
          <button class="modal-close" type="button" @click="closeEditModal">×</button>
        </div>
        <div class="modal-body">
          <div class="modal-img">
            <img v-if="uploadedUrls[0]" :src="uploadedUrls[0]" alt="미리보기" />
            <div v-else class="modal-img-ph">이미지 없음</div>
          </div>
          <div class="modal-form">
            <textarea v-model="editBuffer" class="modal-textarea"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-primary" type="button" @click="saveEdit">저장</button>
          <button class="btn-secondary" type="button" @click="closeEditModal">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToastStore } from '@/stores/useToastStore'; // Pinia 토스트 스토어

// 상태
const currentStep = ref(1);
const uploadedUrls = ref([]);
const fileInput = ref(null);
const userCaption = ref('안녕하세요!!!!!');
const generatedText = ref('');
const originalGeneratedText = ref('');
const showEditModal = ref(false);
const editBuffer = ref('');

// 색상: main.css 변수에서 회색값만 읽어와 아이콘 선색에 사용
const gray600 = ref('#9AA0A6');
onMounted(() => {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--color-gray-600');
  if (v) gray600.value = v.trim();
});

// 토스트
const toast = useToastStore();
const toastSuccess = (message, title = '완료') =>
  toast.addToast({ type: 'success', message, title, duration: 2400 });
const toastWarn = (message, title = '안내') =>
  toast.addToast({ type: 'warning', message, title, duration: 2600 });
const toastError = (message, title = '오류') =>
  toast.addToast({ type: 'error', message, title, duration: 3000 });
const toastInfo = (message, title = '안내') =>
  toast.addToast({ type: 'info', message, title, duration: 2400 });

// 파일 선택/드래그
function openPicker() {
  fileInput.value?.click();
}
function handleFileChange(e) {
  const file = e.target.files?.[0];
  if (file) uploadTemp(file);
  e.target.value = '';
}
function handleDrop(e) {
  const file = e.dataTransfer.files?.[0];
  if (file) uploadTemp(file);
}

// presign / 생성 API 훅(프로젝트 내 실제 함수로 대체)
async function getTempPresign(name, type) {
  if (typeof window.$presign !== 'function') throw new Error('presign 함수가 정의되지 않았어요.');
  return window.$presign(name, type); // { url, publicUrl }
}
async function createCaptionsFromUrls(payload) {
  if (typeof window.$createCaptions !== 'function')
    throw new Error('캡션 생성 함수가 정의되지 않았어요.');
  return window.$createCaptions(payload);
}

// 업로드
async function uploadTemp(file) {
  try {
    if (!/image\/(jpeg|png)/.test(file.type)) return toastWarn('JPG, PNG만 업로드할 수 있어요.');
    if (file.size > 10 * 1024 * 1024) return toastWarn('최대 10MB까지 업로드할 수 있어요.');

    const presign = await getTempPresign(file.name, file.type);
    const res = await fetch(presign.url, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!res.ok) throw new Error(`S3 업로드 실패 (${res.status})`);

    const finalUrl = presign.publicUrl ?? presign.url.split('?')[0];
    uploadedUrls.value.push(finalUrl);
    toastSuccess('이미지가 임시 저장되었어요.');
  } catch (err) {
    toastError(err?.message || '업로드 중 문제가 발생했어요.');
  }
}

// 네비게이션
function goToStep2() {
  if (!uploadedUrls.value.length) {
    toastWarn('이미지를 먼저 올려주세요.');
    return;
  }
  currentStep.value = 2;
}
function backToUpload() {
  currentStep.value = 1;
}
function goToStep3() {
  currentStep.value = 3;
  if (!generatedText.value) {
    const t = buildAiText(userCaption.value);
    generatedText.value = t;
    originalGeneratedText.value = t;
    toastInfo('AI 초안이 준비됐어요.');
  }
}
function goToStep4() {
  currentStep.value = 4;
}

// 텍스트 유틸
function buildAiText(caption) {
  const seed = caption && caption.trim() ? caption.trim() : '오늘의 특별한 순간';
  return `✨ ${seed} ✨

매일 반복되는 일상 속에서도 이런 특별한 순간들이 있어서 참 감사해요! 작은 것에서 행복을 찾는 하루하루가 소중하다는 걸 다시 한번 느껴봅니다😊

여러분도 오늘 어떤 특별한 순간을 만났나요? 댓글로 공유해주세요!

#오늘의특별한순간 #일상 #소중한순간 #행복 #감사 #데일리 #좋은하루`;
}

// 모달
function openEditModal() {
  editBuffer.value = generatedText.value;
  showEditModal.value = true;
}
function closeEditModal() {
  showEditModal.value = false;
}
function saveEdit() {
  generatedText.value = editBuffer.value;
  showEditModal.value = false;
  toastSuccess('수정 내용을 저장했어요.');
}
function restoreOriginal() {
  generatedText.value = originalGeneratedText.value;
  toastInfo('원본으로 되돌렸어요.');
}

// (선택) 실제 생성 호출
async function generate() {
  if (!uploadedUrls.value.length) return toastWarn('이미지를 먼저 올려주세요.');
  try {
    await createCaptionsFromUrls({
      s3Urls: uploadedUrls.value,
      options: {
        language: 'ko',
        withHashtags: true,
        withEmojis: false,
        variations: 3,
        maxChars: 200,
      },
    });
    toastSuccess('캡션 생성이 완료됐어요.');
  } catch {
    toastError('캡션 생성에 실패했어요.');
  }
}
</script>

<style scoped>
/* 페이지 루트: main.css 변수만 참조 → 로컬 별칭으로 매핑 */
.page {
  --accent: var(--color-sub);
  --accent-weak: var(--color-main);
  --bg-1: var(--color-light-1);
  --bg-2: var(--color-light-2);
  --bg-3: var(--color-light-3);
  --white: var(--color-white);

  width: 100%;
  min-height: 100vh;
  background: var(--white);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', system-ui, sans-serif;
  color: #202124;
}

/* 스텝퍼 */
.stepper {
  margin-top: 40px;
  display: grid;
  grid-template-columns: auto 80px auto 80px auto 80px auto;
  align-items: center;
}
.stepper .connector {
  height: 2px;
  background: #d6d9dc;
  width: 80px;
}
.stepper__item {
  text-align: center;
}
.stepper__item .dot {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: #e5e7eb;
  color: #555;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}
.stepper__item .label {
  margin-top: 8px;
  font-size: 14px;
  color: #6f7275;
}
.stepper__item.is-active .dot {
  background: var(--accent);
  color: #fff;
}

/* 타이틀 */
.title {
  margin-top: 36px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

/* 업로드 */
.upload-section {
  width: 940px;
  max-width: calc(100% - 48px);
  margin-top: 24px;
}
.upload-drop {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
}
.upload-inner {
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: center;
}
.cloud {
  display: block;
  margin: 0 auto 16px;
}
.upload-text-1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #3c4043;
}
.upload-text-2 {
  margin: 10px 0 0 0;
  font-size: 14px;
  color: #6f7275;
}
.upload-text-3 {
  margin: 12px 0 0 0;
  font-size: 14px;
  color: var(--accent);
}

/* STEP2 */
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
  border: 1px solid var(--bg-1);
  background: var(--bg-3);
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
  background: var(--accent);
  color: #fff;
  font-weight: 700;
}
.uploaded-box__body {
  display: flex;
  gap: 12px;
  align-items: center;
}
.thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--bg-1);
  background: var(--white);
  flex: 0 0 auto;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-placeholder {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa0a6;
  font-size: 12px;
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
  color: var(--accent);
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
  color: var(--accent);
}
.textarea-wrap {
  position: relative;
}
.textarea {
  width: 100%;
  height: 140px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 36px 12px 12px;
  font-size: 14px;
  resize: none;
}
.clear-btn {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: var(--white);
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
  background: var(--accent);
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
  border: 1px solid var(--bg-1);
  background: var(--bg-3);
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
  border: 1px solid var(--bg-1);
  background: var(--white);
  border-radius: 8px;
  overflow: hidden;
}
.preview-card__title {
  padding: 10px 12px;
  border-bottom: 1px solid var(--bg-1);
  background: var(--bg-3);
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}
.preview-canvas {
  height: 420px;
  background: var(--bg-2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-badge {
  font-size: 20px;
  letter-spacing: 4px;
  padding: 6px 10px;
  border: 2px solid var(--accent-weak);
  color: var(--accent);
  border-radius: 4px;
}
.preview-footer {
  padding: 12px;
  border-top: 1px solid var(--bg-1);
}
.preview-label {
  font-size: 12px;
  color: #6f7275;
  margin-bottom: 6px;
}
.preview-text {
  font-weight: 700;
  color: var(--accent);
}
.preview-help {
  margin-top: 6px;
  font-size: 11px;
  color: #9aa0a6;
}

/* 하단 버튼 */
.footer {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 28px 0 60px;
}
.next-btn {
  width: 360px;
  height: 48px;
  border-radius: 999px;
  border: none;
  font-weight: 600;
  font-size: 16px;
  color: #fff;
  background: #bfc3c7;
}
.next-btn:disabled {
  opacity: 1;
  cursor: not-allowed;
}

/* STEP3 */
.step3 {
  width: 940px;
  max-width: calc(100% - 48px);
  margin-top: 16px;
}
.step3-topbox {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border: 1.2px solid var(--accent-weak);
  background: var(--bg-3);
  border-radius: 12px;
  padding: 20px;
}
.step3-topbox .badge-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.step3-topbox .check-dot {
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
}
.step3-topbox .upload-mini {
  display: flex;
  align-items: center;
  gap: 12px;
}
.step3-topbox .thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--bg-1);
  background: var(--white);
  flex: 0 0 auto;
}
.step3-topbox .thumb--ph {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa0a6;
  font-size: 12px;
}
.step3-topbox .meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.step3-topbox .meta-title {
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
  background: var(--white);
  border: 1.2px solid var(--accent);
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: 600;
  color: var(--accent);
  line-height: 1.5;
}
.h3 {
  margin: 18px 0;
  font-size: 18px;
  font-weight: 700;
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
  border: 1.2px solid var(--accent-weak);
  background: var(--white);
  cursor: pointer;
}
.ai-card {
  border: 1.2px solid #eaeaea;
  border-radius: 12px;
  background: var(--white);
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.ai-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--bg-1);
  background: var(--white);
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
  background: var(--accent);
  display: inline-block;
  border-radius: 999px;
}
.actions {
  display: flex;
  gap: 8px;
}
.btn-edit {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  padding: 6px 12px;
  font-weight: 500;
  cursor: pointer;
}
.btn-edit:hover,
.btn-edit:focus {
  filter: brightness(0.95);
}
.btn-restore {
  background: var(--white);
  border: 1px solid #ccc;
  color: #666;
  border-radius: 6px;
  font-size: 13px;
  padding: 6px 12px;
  font-weight: 500;
  cursor: pointer;
}
.btn-restore:hover,
.btn-restore:focus {
  border-color: var(--accent);
  color: var(--accent);
}
.ai-card__body {
  padding: 18px;
}
.ai-output {
  background: var(--white);
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 18px;
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
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
  background: var(--accent);
  display: inline-block;
  border-radius: 999px;
}

/* STEP4 */
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
.final-box {
  border: 1.2px solid var(--accent-weak);
  border-radius: 12px;
  background: var(--white);
  overflow: hidden;
}
.final-box__title {
  padding: 12px 16px;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #f3d9cf;
  background: var(--white);
}
.red-icon {
  width: 10px;
  height: 10px;
  background: var(--accent);
  border-radius: 999px;
  display: inline-block;
}
.final-box__body {
  padding: 14px;
}
.final-caption {
  border: 1px solid #f3d9cf;
  background: var(--bg-3);
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
  background: var(--accent-weak);
  border-radius: 999px;
  display: inline-block;
}
.final-caption__inner {
  padding: 12px;
}
.final-caption__title {
  font-weight: 700;
  margin-bottom: 8px;
  color: #333;
}
.final-caption__text {
  white-space: pre-wrap;
  line-height: 1.8;
  color: #333;
  font-size: 14px;
}
.final-hashtags {
  margin-top: 12px;
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
  background: var(--accent);
  display: inline-block;
  border-radius: 999px;
}
.hash-bubble {
  border: 1px solid #f3d9cf;
  background: var(--white);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #444;
}
.final-metrics {
  margin-top: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.metric {
  border: 1px solid #f3d9cf;
  background: var(--bg-3);
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
  background: var(--accent);
  display: inline-block;
  border-radius: 999px;
}
.other-style {
  margin-top: 14px;
  color: #222;
  font-size: 14px;
}
.other-style .star {
  color: var(--accent);
  margin-right: 6px;
}
.result-card {
  border: 1px solid #f3d9cf;
  border-radius: 12px;
  background: var(--white);
  overflow: hidden;
}
.result-card__title {
  padding: 10px 12px;
  border-bottom: 1px solid #f3d9cf;
  background: var(--white);
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.result-canvas {
  padding: 12px;
}
.canvas-ph {
  width: 100%;
  height: 420px;
  background: #000;
  border-radius: 8px;
}
.result-footer {
  padding: 12px;
  border-top: 1px solid #f3d9cf;
  background: var(--bg-2);
}
.orig-label {
  font-size: 12px;
  color: #6f7275;
}
.orig-value {
  margin-top: 4px;
  color: var(--accent);
  font-weight: 700;
}
.orig-value.link {
  text-decoration: none;
}
.result-note {
  margin-top: 6px;
  font-size: 11px;
  color: #9aa0a6;
  display: flex;
  align-items: center;
  gap: 6px;
}
.info-icon {
  width: 10px;
  height: 10px;
  background: var(--accent-weak);
  border-radius: 999px;
  display: inline-block;
}
.download-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
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
  background: var(--accent);
  border-radius: 999px;
  display: inline-block;
}
.download-btn {
  border: none;
  background: var(--accent);
  color: #fff;
  border-radius: 10px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
}
.download-btn .btn-icon {
  width: 10px;
  height: 10px;
  background: var(--white);
  border-radius: 999px;
  display: inline-block;
  margin-right: 6px;
}
</style>

