<template>
  <div class="page">
    <StepperComponent :current-step="currentStep" />

    <TitleComponent :current-step="currentStep" />

    <UploadSection
      v-if="currentStep === 1"
      :uploaded-images="uploadedImages"
      :is-uploading="isUploading"
      @upload-files="handleMultipleUpload"
      @remove-image="removeImage"
    />

    <Step2Component
      v-if="currentStep === 2"
      :uploaded-images="uploadedImages"
      :user-caption="userCaption"
      @update-caption="userCaption = $event"
      @back-to-upload="currentStep = 1"
    />

    <Step3Component
      v-if="currentStep === 3"
      :uploaded-images="uploadedImages"
      :user-caption="userCaption"
      :generated-text="generatedText"
      :original-generated-text="originalGeneratedText"
      :is-generating="isGenerating"
      @update-generated-text="generatedText = $event"
      @restore-original="restoreOriginal"
      @back-to-step2="currentStep = 2"
      @open-edit-modal="openEditModal"
    />

    <Step4Component
      v-if="currentStep === 4"
      :uploaded-images="uploadedImages"
      :user-caption="userCaption"
      :generated-text="generatedText"
      :generated-hashtags="generatedHashtags"
      :generated-best-time="generatedBestTime"
      :generated-impact="generatedImpact"
      @copy-to-clipboard="copyToClipboard"
      @start-over="startOver"
    />

    <FooterButtons
      :current-step="currentStep"
      :can-proceed="canProceed"
      @next="handleNext"
      @start-over="startOver"
    />

    <EditModal
      v-if="showEditModal"
      :show="showEditModal"
      :edit-buffer="editBuffer"
      :uploaded-images="uploadedImages"
      @close="closeEditModal"
      @save="saveEdit"
      @update-buffer="updateBuffer"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToastStore } from '@/stores/useToastStore';
import StepperComponent from '@/components/promote/StepperComponent.vue';
import TitleComponent from '@/components/promote/TitleComponent.vue';
import UploadSection from '@/components/promote/UploadSection.vue';
import Step2Component from '@/components/promote/Step2Component.vue';
import Step3Component from '@/components/promote/Step3Component.vue';
import Step4Component from '@/components/promote/Step4Component.vue';
import FooterButtons from '@/components/promote/FooterButtons.vue';
import EditModal from '@/components/promote/EditModal.vue';

// 상태
const currentStep = ref(1);
const userCaption = ref('');

// 업로드 관련 (다중 이미지 지원)
const isUploading = ref(false);
const uploadedImages = ref([]); // { s3Key: string, imageUrl: string, id: string }

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

// 진행 가능 조건
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1: return uploadedImages.value.length > 0;
    case 2: return userCaption.value.trim();
    case 3: return generatedText.value;
    default: return true;
  }
});

// 다중 파일 업로드 처리
async function handleMultipleUpload(files) {
  if (files.length === 0) return;

  // 최대 20개 제한
  const totalImages = uploadedImages.value.length + files.length;
  if (totalImages > 20) {
    toastWarn(`최대 20개의 이미지만 업로드할 수 있습니다. (현재: ${uploadedImages.value.length}개)`);
    return;
  }

  isUploading.value = true;

  try {
    for (const file of files) {
      await uploadSingleFile(file);
    }
    toastSuccess(`${files.length}개의 이미지가 성공적으로 업로드되었어요.`);
  } catch (error) {
    console.error('업로드 오류:', error);
    toastError('일부 이미지 업로드에 실패했습니다.');
  } finally {
    isUploading.value = false;
  }
}

// 단일 파일 업로드
async function uploadSingleFile(file) {
  try {
    // 파일 검증
    if (!/image\/(jpeg|png)/.test(file.type)) {
      throw new Error('JPG, PNG만 업로드할 수 있어요.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('최대 10MB까지 업로드할 수 있어요.');
    }

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
    const response = await fetch('/api/captions/presign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        filename: filename,
        contentType: contentType,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`presigned URL 요청 실패: ${response.status}`);
    }

    const presignData = await response.json();

    // 2. S3에 실제 파일 업로드
    const uploadResponse = await fetch(presignData.url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`S3 업로드 실패: ${uploadResponse.status}`);
    }

    // 3. 업로드된 이미지 정보 저장
    const imageData = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      s3Key: presignData.key,
      imageUrl: presignData.publicUrl || presignData.url.split('?')[0],
      filename: file.name
    };

    uploadedImages.value.push(imageData);

  } catch (error) {
    console.error('개별 파일 업로드 오류:', error);
    throw error;
  }
}

// 이미지 제거
function removeImage(imageId) {
  uploadedImages.value = uploadedImages.value.filter(img => img.id !== imageId);
  toastInfo('이미지가 제거되었습니다.');
}

// AI 캡션 생성 (첫 3장 이미지만 사용)
async function generateCaption() {
  if (uploadedImages.value.length === 0 || !userCaption.value.trim()) {
    toastWarn('이미지와 문구를 모두 입력해주세요.');
    return;
  }

  try {
    isGenerating.value = true;

    // 앞의 3장 이미지만 선택
    const imagesToAnalyze = uploadedImages.value.slice(0, 3);

    const requestData = {
      s3Keys: imagesToAnalyze.map(img => img.s3Key),
      prompt: userCaption.value.trim(),
    };

    const response = await fetch('/api/captions/generate-from-multiple-s3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`캡션 생성 요청 실패: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // 생성된 데이터 저장
    generatedText.value = data.caption || '';
    originalGeneratedText.value = data.caption || '';
    generatedHashtags.value = data.hashtags || [];
    generatedBestTime.value = data.bestPostTime || '';
    generatedImpact.value = data.impactNote || '';

    toastSuccess('AI 캡션이 성공적으로 생성되었어요!');

  } catch (error) {
    console.error('캡션 생성 오류:', error);
    toastError(error.message || '캡션 생성 중 문제가 발생했어요.');
  } finally {
    isGenerating.value = false;
  }
}

// 네비게이션
async function handleNext() {
  switch (currentStep.value) {
    case 1:
      if (uploadedImages.value.length === 0) {
        toastWarn('이미지를 먼저 업로드해주세요.');
        return;
      }
      currentStep.value = 2;
      break;

    case 2:
      if (!userCaption.value.trim()) {
        toastWarn('문구를 입력해주세요.');
        return;
      }
      currentStep.value = 3;
      // AI 캡션 생성
      if (!generatedText.value) {
        await generateCaption();
      }
      break;

    case 3:
      if (!generatedText.value) {
        toastWarn('AI 캡션이 생성되지 않았습니다.');
        return;
      }
      currentStep.value = 4;
      break;

    default:
      startOver();
  }
}

function startOver() {
  // blob URL 메모리 정리
  uploadedImages.value.forEach(img => {
    if (img.imageUrl && img.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(img.imageUrl);
    }
  });

  // 모든 상태 초기화
  currentStep.value = 1;
  uploadedImages.value = [];
  userCaption.value = '';
  generatedText.value = '';
  originalGeneratedText.value = '';
  generatedHashtags.value = [];
  generatedBestTime.value = '';
  generatedImpact.value = '';
  isUploading.value = false;
  isGenerating.value = false;
}

// 편집 모달 관련 함수들
function openEditModal() {
  editBuffer.value = generatedText.value;
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
}

function updateBuffer(newText) {
  editBuffer.value = newText;
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
</style>
