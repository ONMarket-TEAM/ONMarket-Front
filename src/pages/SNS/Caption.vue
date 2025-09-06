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
    <h1 class="title" v-else-if="currentStep === 3">3단계: AI가 생성한 문구를 확인하고 편집해보세요</h1>
    <h1 class="title" v-else-if="currentStep === 4">4단계: 완성된 콘텐츠를 확인하세요</h1>

    <!-- STEP 1: 업로드 -->
    <section class="upload-section" v-if="currentStep === 1">
      <div class="upload-drop" :class="{ 'has-image': uploadedImageUrl }" @drop.prevent="handleDrop" @dragover.prevent>
        <input
          type="file"
          ref="fileInput"
          accept="image/jpeg,image/png"
          @change="handleFileChange"
          hidden
        />

        <!-- 이미지가 업로드된 경우 -->
        <div v-if="uploadedImageUrl" class="uploaded-preview">
          <img :src="uploadedImageUrl" alt="업로드된 이미지" class="preview-img" />
          <div class="upload-overlay">
            <div class="upload-actions">
              <button class="change-btn" type="button" @click="openPicker" :disabled="isUploading">
                <span v-if="isUploading">업로드 중...</span>
                <span v-else>다른 사진 선택</span>
              </button>
            </div>
            <div class="upload-status">
              <p v-if="isUploading">새 이미지 업로드 중...</p>
              <p v-else>업로드 완료! 다른 사진을 선택하거나 다음 단계로 진행하세요.</p>
            </div>
          </div>
        </div>

        <!-- 이미지가 업로드되지 않은 경우 -->
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
          <p class="upload-text-2" v-if="!isUploading">JPG, PNG 파일 지원 (최대 10MB)</p>
          <p class="upload-text-3" v-if="!isUploading">제품, 음식, 풍경, 인물 등 모든 사진 가능</p>
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
              <div class="thumb" v-if="uploadedImageUrl">
                <img :src="uploadedImageUrl" alt="업로드된 사진" />
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
                placeholder="어떤 내용을 담고 싶으신가요? (예: 오늘 만든 특별한 요리, 새로 출시한 제품 소개 등)"
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
              <span class="agree"><span class="dot" /> 내용은 AI가 자동으로 다듬어집니다</span>
              <span class="count">{{ userCaption.length }}/100</span>
            </div>
          </div>

          <div class="tips">
            <div class="tips__title">작성 팁</div>
            <ul class="tips__list">
              <li>꼭 들어갔으면 하는 문구, 키워드를 입력해주세요</li>
              <li>상호명/지역/이벤트/가격/URL 등을 입력해보세요</li>
              <li>너무 길지 않게 핵심만 담아주세요</li>
              <li>AI가 문구를 다듬어 더 매력적으로 만듭니다</li>
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
              <div class="preview-image" v-if="uploadedImageUrl">
                <img :src="uploadedImageUrl" alt="미리보기" />
              </div>
            </div>
            <div class="preview-footer">
              <div class="preview-label">입력한 문구:</div>
              <div class="preview-text">{{ userCaption || '문구를 입력해주세요' }}</div>
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
            <div class="thumb" v-if="uploadedImageUrl">
              <img :src="uploadedImageUrl" alt="업로드된 사진" />
            </div>
            <div class="thumb thumb--ph" v-else>썸네일</div>
            <div class="meta"><div class="meta-title">업로드된 사진</div></div>
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

      <div class="ai-card-wrapper">
        <button class="back-fab" type="button" @click="currentStep = 2" aria-label="go back">
          ‹
        </button>
        <div class="ai-card">
          <div class="ai-card__header">
            <div class="title">
              <span class="red-dot" />
              {{ isGenerating ? 'AI 문구 생성 중...' : 'AI 생성 문구' }}
            </div>
            <div class="actions" v-if="!isGenerating && generatedText">
              <button class="btn-edit" type="button" @click="openEditModal">편집하기</button>
              <button class="btn-restore" type="button" @click="restoreOriginal">
                원본으로 복원
              </button>
            </div>
          </div>
          <div class="ai-card__body">
            <div v-if="isGenerating" class="generating-state">
              <div class="loading-spinner"></div>
              <p>AI가 이미지를 분석하고 매력적인 문구를 작성하고 있습니다...</p>
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
                  <div class="final-caption__text">
                    {{ generatedText || '캡션이 생성되지 않았습니다.' }}
                  </div>
                </div>
              </div>

              <div class="final-hashtags" v-if="generatedHashtags && generatedHashtags.length > 0">
                <div class="hash-title"><span class="hash-icon" /> 추천 해시태그</div>
                <div class="hash-bubble">
                  {{ generatedHashtags.join(' ') }}
                </div>
              </div>

              <div class="final-metrics" v-if="generatedBestTime || generatedImpact">
                <div class="metric" v-if="generatedBestTime">
                  <div class="metric-label"><span class="clock-icon" /> 최적 게시 시간</div>
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
            <div class="result-card__title"><span class="eye" /> 최종 결과물</div>
            <div class="result-canvas">
              <div class="result-image" v-if="uploadedImageUrl">
                <img :src="uploadedImageUrl" alt="최종 결과" />
              </div>
              <div class="canvas-ph" v-else></div>
            </div>
            <div class="result-footer">
              <div class="orig-label">원본 문구:</div>
              <div class="orig-value link">{{ userCaption || '입력된 문구 없음' }}</div>
              <div class="result-note">
                <span class="info-icon" /> 이제 소셜미디어에 게시할 준비가 완료되었습니다
              </div>
            </div>
          </div>

          <div class="download-row">
            <div class="download-left"><span class="dl-icon" /> 콘텐츠 활용</div>
            <button class="download-btn" type="button" @click="copyToClipboard">
              <span class="btn-icon" /> 텍스트 복사
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 하단 버튼 -->
    <div class="footer">
      <button v-if="currentStep === 1" class="next-btn" @click="goToStep2" :disabled="!uploadedS3Key">다음</button>
      <button v-else-if="currentStep === 2" class="next-btn" @click="goToStep3" :disabled="!userCaption.trim()">다음</button>
      <button v-else-if="currentStep === 3" class="next-btn" @click="goToStep4" :disabled="!generatedText">다음</button>
      <button v-else class="next-btn" @click="startOver">새로 시작</button>
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
            <img v-if="uploadedImageUrl" :src="uploadedImageUrl" alt="미리보기" />
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
import { useToastStore } from '@/stores/useToastStore';
import axios from 'axios';

// 상태
const currentStep = ref(1);
const fileInput = ref(null);
const userCaption = ref('');

// 업로드 관련
const isUploading = ref(false);
const uploadedS3Key = ref('');
const uploadedImageUrl = ref('');

// AI 생성 관련
const isGenerating = ref(false);
const generatedText = ref('');
const originalGeneratedText = ref('');
const generatedHashtags = ref([]);
const generatedBestTime = ref('');
const generatedImpact = ref('');

// 편집 모달
const showEditModal = ref(false);
const editBuffer = ref('');

// 색상
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
  if (!isUploading.value) {
    fileInput.value?.click();
  }
}

function handleFileChange(e) {
  const file = e.target.files?.[0];
  if (file) uploadFile(file);
  e.target.value = '';
}

function handleDrop(e) {
  const file = e.dataTransfer.files?.[0];
  if (file) uploadFile(file);
}

// 파일 업로드 함수 (수정된 버전)
async function uploadFile(file) {
  try {
    // 파일 검증
    if (!/image\/(jpeg|png)/.test(file.type)) {
      return toastWarn('JPG, PNG만 업로드할 수 있어요.');
    }
    if (file.size > 10 * 1024 * 1024) {
      return toastWarn('최대 10MB까지 업로드할 수 있어요.');
    }

    isUploading.value = true;

    // 파일명과 contentType 유효성 확인 및 정리
    const sanitizeFilename = (name) => {
      if (!name || !name.trim()) return `image_${Date.now()}.jpg`;
      return name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100);
    };

    const normalizeContentType = (type) => {
      if (!type || !type.trim()) return 'image/jpeg';
      if (type.includes('jpeg') || type.includes('jpg')) return 'image/jpeg';
      if (type.includes('png')) return 'image/png';
      return 'image/jpeg';
    };

    const filename = sanitizeFilename(file.name);
    const contentType = normalizeContentType(file.type);

    // 1. presigned URL 요청
    console.log('presigned URL 요청 중...', {
      filename: filename,
      contentType: contentType,
      originalName: file.name,
      originalType: file.type
    });

    const requestData = {
      filename: filename,
      contentType: contentType,
    };

    console.log('실제 요청 데이터:', requestData);

    const response = await fetch('/api/captions/presign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('서버 응답 오류:', errorText);
      throw new Error(`presigned URL 요청 실패: ${response.status}`);
    }

    const presignData = await response.json();
    console.log('presigned URL 응답:', presignData);

    if (!presignData.key) {
      throw new Error('presigned URL 응답에 key가 없습니다');
    }

    // 2. S3에 실제 파일 업로드 (이 부분이 누락되어 있었음!)
    console.log('S3 업로드 시작:', presignData.url);

    const uploadResponse = await fetch(presignData.url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      console.error('S3 업로드 실패:', uploadResponse.status, uploadResponse.statusText);
      throw new Error(`S3 업로드 실패: ${uploadResponse.status}`);
    }

    console.log('S3 업로드 성공');

    // 3. 업로드 성공 처리
    uploadedS3Key.value = presignData.key;
    uploadedImageUrl.value = presignData.publicUrl || presignData.url.split('?')[0];

    console.log('저장된 S3 키:', uploadedS3Key.value);
    console.log('이미지 URL:', uploadedImageUrl.value);

    toastSuccess('이미지가 성공적으로 업로드되었어요.');

  } catch (error) {
    console.error('업로드 오류:', error);

    if (error.response) {
      console.error('서버 응답 상태:', error.response.status);
      console.error('서버 응답 헤더:', error.response.headers);
      console.error('서버 응답 데이터:', error.response.data);
    } else if (error.request) {
      console.error('요청이 전송되었지만 응답이 없음:', error.request);
    } else {
      console.error('요청 설정 중 오류:', error.message);
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('네트워크 오류 또는 서버 연결 실패');
      toastError('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.');
    } else {
      toastError(error.response?.data?.message || error.message || '업로드 중 문제가 발생했어요.');
    }
  } finally {
    isUploading.value = false;
  }
}

// AI 캡션 생성 (수정된 버전 - try-catch 추가)
async function generateCaption() {
  console.log('AI 캡션 생성 시작');
  console.log('업로드된 S3 키:', uploadedS3Key.value);
  console.log('사용자 캡션:', userCaption.value);

  if (!uploadedS3Key.value || !userCaption.value.trim()) {
    toastWarn('이미지와 문구를 모두 입력해주세요.');
    return;
  }

  try {
    isGenerating.value = true;

    const requestData = {
      s3Key: String(uploadedS3Key.value), // 명시적 형변환
      prompt: userCaption.value.trim(),
    };

    console.log('전송할 요청 데이터:', requestData);

    const response = await fetch('/api/captions/generate-from-s3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    console.log('캡션 생성 응답 상태:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('캡션 생성 서버 응답 오류:', errorText);
      throw new Error(`캡션 생성 요청 실패: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('AI 응답 데이터:', data);

    // 생성된 데이터 저장
    generatedText.value = data.caption || '';
    originalGeneratedText.value = data.caption || '';
    generatedHashtags.value = data.hashtags || [];
    generatedBestTime.value = data.bestPostTime || '';
    generatedImpact.value = data.impactNote || '';

    if (data.sourceDeleted) {
      toastInfo('임시 이미지가 자동으로 삭제되었습니다.');
    }

    toastSuccess('AI 캡션이 성공적으로 생성되었어요!');

  } catch (error) {
    console.error('캡션 생성 오류:', error);
    toastError(error.message || '캡션 생성 중 문제가 발생했어요.');
  } finally {
    isGenerating.value = false;
  }
}

// 네비게이션
function goToStep2() {
  console.log('Step 2로 이동 - S3 키 확인:', uploadedS3Key.value);

  if (!uploadedS3Key.value) {
    toastWarn('이미지를 먼저 업로드해주세요.');
    return;
  }
  currentStep.value = 2;
}

function backToUpload() {
  currentStep.value = 1;
}

async function goToStep3() {
  console.log('Step 3로 이동 - 데이터 확인');
  console.log('S3 키:', uploadedS3Key.value);
  console.log('사용자 캡션:', userCaption.value);

  if (!uploadedS3Key.value || !userCaption.value.trim()) {
    toastWarn('이미지와 문구를 모두 입력해주세요.');
    return;
  }

  currentStep.value = 3;

  // AI 캡션 생성
  if (!generatedText.value) {
    await generateCaption();
  }
}

function goToStep4() {
  if (!generatedText.value) {
    toastWarn('AI 캡션이 생성되지 않았습니다.');
    return;
  }
  currentStep.value = 4;
}

function startOver() {
  // blob URL 메모리 정리
  if (uploadedImageUrl.value && uploadedImageUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(uploadedImageUrl.value);
  }

  // 모든 상태 초기화
  currentStep.value = 1;
  uploadedS3Key.value = '';
  uploadedImageUrl.value = '';
  userCaption.value = '';
  generatedText.value = '';
  originalGeneratedText.value = '';
  generatedHashtags.value = [];
  generatedBestTime.value = '';
  generatedImpact.value = '';
  isUploading.value = false;
  isGenerating.value = false;
}

// 편집 모달
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

// 클립보드 복사
async function copyToClipboard() {
  try {
    const content = generatedText.value + '\n\n' + generatedHashtags.value.join(' ');
    await navigator.clipboard.writeText(content);
    toastSuccess('텍스트가 클립보드에 복사되었어요!');
  } catch (error) {
    toastError('복사 중 오류가 발생했어요.');
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
  font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Noto Sans KR', system-ui, sans-serif;
  color: #202124;
}

/* 로딩 스피너 */
.loading-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 생성 중 상태 */
.generating-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.generating-state p {
  margin-top: 16px;
  font-size: 14px;
}

/* AI 플레이스홀더 */
.ai-placeholder {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-style: italic;
}

/* 미리보기 이미지 */
.preview-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
  overflow: hidden;
  opacity: 0.3;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-canvas {
  position: relative;
  height: 420px;
  background: var(--bg-2);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

/* 결과 이미지 */
.result-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.upload-drop.has-image {
  border: 2px solid var(--accent);
  background: #f8f9fa;
}

.uploaded-preview {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.uploaded-preview:hover .upload-overlay {
  opacity: 1;
}

.upload-actions {
  margin-bottom: 20px;
}

.change-btn {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.change-btn:hover {
  background: var(--accent-weak);
  transform: translateY(-1px);
}

.change-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.upload-status {
  text-align: center;
  color: white;
}

.upload-status p {
  margin-top: 12px;
  font-size: 14px;
}

.upload-inner {
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: center;
}

.upload-inner:disabled {
  cursor: not-allowed;
  opacity: 0.7;
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

.preview-badge {
  font-size: 20px;
  letter-spacing: 4px;
  padding: 6px 10px;
  border: 2px solid var(--accent-weak);
  color: var(--accent);
  border-radius: 4px;
  z-index: 2;
  position: relative;
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
  background: var(--accent);
  cursor: pointer;
  transition: all 0.2s ease;
}

.next-btn:disabled {
  background: #bfc3c7;
  cursor: not-allowed;
}

.next-btn:not(:disabled):hover {
  filter: brightness(0.95);
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

.step3-topbox .upload-mini {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step3-topbox .thumb--ph {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa0a6;
  font-size: 12px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--accent);
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

.btn-edit:hover {
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

.btn-restore:hover {
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
  height: 432px;
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
  display: flex;
  align-items: center;
}

.download-btn:hover {
  filter: brightness(0.95);
}

.btn-icon {
  width: 10px;
  height: 10px;
  background: var(--white);
  border-radius: 999px;
  display: inline-block;
  margin-right: 6px;
}

/* 편집 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--white);
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--bg-1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 20px;
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
}

.modal-img {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--bg-1);
}

.modal-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-img-ph {
  width: 100%;
  height: 100%;
  background: var(--bg-2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
}

.modal-textarea {
  width: 100%;
  height: 120px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  resize: vertical;
  font-family: inherit;
}

.modal-actions {
  padding: 16px 20px;
  border-top: 1px solid var(--bg-1);
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  filter: brightness(0.95);
}

.btn-secondary {
  background: var(--white);
  color: #666;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
