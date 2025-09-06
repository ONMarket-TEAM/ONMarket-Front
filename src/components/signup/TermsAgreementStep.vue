<template>
  <div class="step-content">
    <!-- 헤더 -->
    <div class="step-header">
      <h1 class="step-title">약관 동의</h1>
      <p class="step-subtitle">서비스 이용을 위해 아래 약관을 확인하고 동의해주세요</p>
    </div>

    <form @submit.prevent="handleNext" class="step-form" novalidate>
      <!-- 전체 동의 체크박스 -->
      <div class="all-agree-section">
        <label class="all-agree-label">
          <input
            v-model="allAgree"
            type="checkbox"
            class="all-agree-checkbox"
            @change="toggleAllAgree"
          />
          <span class="checkmark"></span>
          <span class="all-agree-text">전체 약관에 동의합니다</span>
        </label>
      </div>

      <!-- 개별 약관 리스트 -->
      <div class="terms-list">
        <!-- 이용약관 -->
        <div class="terms-item">
          <div class="terms-header">
            <label class="checkbox-label">
              <input
                v-model="signupForm.agreeTerms"
                type="checkbox"
                class="terms-checkbox"
                @change="updateAllAgreeStatus"
                required
              />
              <span class="checkmark"></span>
              <span class="terms-title">이용약관 동의 <span class="required">(필수)</span></span>
            </label>
            <button
              type="button"
              class="view-button"
              :class="{ active: activeTerms === 'terms' }"
              @click="toggleTerms('terms')"
            >
              {{ activeTerms === 'terms' ? '접기' : '보기' }}
            </button>
          </div>
          <div v-if="activeTerms === 'terms'" class="terms-content-box">
            <div class="terms-content">
              <h4>제1조 (목적)</h4>
              <p>
                본 약관은 회사와 이용자 간의 서비스 이용 조건 및 절차, 권리와 의무를 규정합니다.
              </p>

              <h4>제2조 (서비스의 제공)</h4>
              <p>
                회사는 안정적인 서비스 제공을 위해 최선을 다하며 필요 시 내용을 변경할 수 있습니다.
              </p>

              <h4>제3조 (이용자의 의무)</h4>
              <p>
                이용자는 관련 법령과 본 약관을 준수해야 하며, 타인의 권리를 침해해서는 안 됩니다.
              </p>

              <h4>제4조 (서비스 이용)</h4>
              <p>
                서비스는 연중무휴, 1일 24시간 제공됩니다. 다만, 정기점검 및 긴급상황 시 서비스가
                일시 중단될 수 있습니다.
              </p>

              <h4>제5조 (계약 해지)</h4>
              <p>
                이용자는 언제든지 서비스 이용계약을 해지할 수 있으며, 회사는 관련 법령에 따라
                처리합니다.
              </p>
            </div>
          </div>
        </div>

        <!-- 개인정보 처리방침 -->
        <div class="terms-item">
          <div class="terms-header">
            <label class="checkbox-label">
              <input
                v-model="signupForm.agreePrivacy"
                type="checkbox"
                class="terms-checkbox"
                @change="updateAllAgreeStatus"
                required
              />
              <span class="checkmark"></span>
              <span class="terms-title"
                >개인정보 처리방침 동의 <span class="required">(필수)</span></span
              >
            </label>
            <button
              type="button"
              class="view-button"
              :class="{ active: activeTerms === 'privacy' }"
              @click="toggleTerms('privacy')"
            >
              {{ activeTerms === 'privacy' ? '접기' : '보기' }}
            </button>
          </div>
          <div v-if="activeTerms === 'privacy'" class="terms-content-box">
            <div class="terms-content">
              <h4>1. 개인정보 수집 항목</h4>
              <p>• 필수항목: 이름, 이메일, 휴대폰 번호, 생년월일, 성별</p>
              <p>• 선택항목: 프로필 이미지</p>

              <h4>2. 개인정보 이용 목적</h4>
              <p>• 서비스 제공 및 운영</p>
              <p>• 회원 가입 및 본인 확인</p>
              <p>• 고객 상담 및 서비스 개선</p>
              <p>• 이벤트 및 마케팅 정보 제공 (동의 시)</p>

              <h4>3. 개인정보 보유 및 이용기간</h4>
              <p>회원 탈퇴 시까지 보유하며, 탈퇴 즉시 지체없이 파기합니다.</p>

              <h4>4. 개인정보 제3자 제공</h4>
              <p>
                원칙적으로 제3자에게 제공하지 않으며, 법령에 의거하거나 이용자 동의 시에만
                제공합니다.
              </p>
            </div>
          </div>
        </div>

        <!-- 마케팅 정보 수신 동의 -->
        <div class="terms-item optional">
          <div class="terms-header">
            <label class="checkbox-label">
              <input
                v-model="signupForm.agreeMarketing"
                type="checkbox"
                class="terms-checkbox"
                @change="updateAllAgreeStatus"
              />
              <span class="checkmark"></span>
              <span class="terms-title"
                >마케팅 정보 수신 동의 <span class="optional">(선택)</span></span
              >
            </label>
            <button
              type="button"
              class="view-button"
              :class="{ active: activeTerms === 'marketing' }"
              @click="toggleTerms('marketing')"
            >
              {{ activeTerms === 'marketing' ? '접기' : '보기' }}
            </button>
          </div>
          <div v-if="activeTerms === 'marketing'" class="terms-content-box">
            <div class="terms-content">
              <h4>마케팅 정보 수신 내용</h4>
              <p>• 신규 서비스 및 기능 출시 소식</p>
              <p>• 이벤트 및 프로모션 안내</p>
              <p>• 쿠폰 및 할인 혜택 정보</p>

              <h4>수신 방법</h4>
              <p>• 이메일, SMS, 앱 푸시 알림</p>

              <h4>수신 동의 철회</h4>
              <p>언제든지 마이페이지에서 수신 동의를 철회할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="button-wrapper">
        <button type="submit" class="next-button">다음 단계</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useToastStore } from '@/stores/useToastStore';

const toastStore = useToastStore();
const emit = defineEmits(['next']);

// 폼 데이터
const signupForm = reactive({
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketing: false,
});

// 현재 열린 약관
const activeTerms = ref(null);

// 전체 동의 상태
const allAgree = ref(false);

// 약관 읽기 추적
const viewedTerms = ref(new Set());

// 약관 토글
const toggleTerms = (type) => {
  if (activeTerms.value === type) {
    activeTerms.value = null;
  } else {
    activeTerms.value = type;
    viewedTerms.value.add(type);
  }
};

// 전체 동의 토글
const toggleAllAgree = () => {
  if (allAgree.value) {
    signupForm.agreeTerms = true;
    signupForm.agreePrivacy = true;
    signupForm.agreeMarketing = true;
  } else {
    signupForm.agreeTerms = false;
    signupForm.agreePrivacy = false;
    signupForm.agreeMarketing = false;
  }
};

// 전체 동의 상태 업데이트
const updateAllAgreeStatus = () => {
  allAgree.value = signupForm.agreeTerms && signupForm.agreePrivacy && signupForm.agreeMarketing;
};

// 개별 체크박스 상태 변화 감지
watch(
  [() => signupForm.agreeTerms, () => signupForm.agreePrivacy, () => signupForm.agreeMarketing],
  () => {
    updateAllAgreeStatus();
  }
);

// 다음 단계
const handleNext = () => {
  const validationErrors = [];

  if (!signupForm.agreeTerms) {
    validationErrors.push('이용약관에 동의해주세요.');
  }

  if (!signupForm.agreePrivacy) {
    validationErrors.push('개인정보 처리방침에 동의해주세요.');
  }

  if (validationErrors.length > 0) {
    toastStore.error(validationErrors[0]);
    return;
  }

  emit('next', signupForm);
};
</script>

<style scoped>
.step-content {
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 2rem;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #333;
}

.step-subtitle {
  font-size: 0.9rem;
  color: #666;
}

/* 전체 동의 섹션 */
.all-agree-section {
  border: 2px solid var(--color-main);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.all-agree-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.all-agree-checkbox {
  display: none;
}

.all-agree-text {
  margin-left: 0.8rem;
}

/* 약관 리스트 */
.terms-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.terms-item {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.terms-item.optional {
  border-color: #d1d5db;
  background: #fafafa;
}

/* 약관 헤더 */
.terms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  flex: 1;
}

.terms-checkbox {
  display: none;
}

.terms-title {
  margin-left: 0.8rem;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
}

.required {
  color: #dc3545;
  font-size: 0.85rem;
  font-weight: 600;
}

.optional {
  color: #6c757d;
  font-size: 0.85rem;
  font-weight: 500;
}

/* 커스텀 체크박스 */
.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background: white;
  transition: all 0.3s ease;
  position: relative;
  flex-shrink: 0;
}

.terms-checkbox:checked + .checkmark,
.all-agree-checkbox:checked + .checkmark {
  background: var(--color-main);
  border-color: var(--color-main);
}

.terms-checkbox:checked + .checkmark::after,
.all-agree-checkbox:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* 보기/접기 버튼 */
.view-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-main);
  background: white;
  color: var(--color-main);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
}

.view-button:hover,
.view-button.active {
  background: var(--color-main);
  color: white;
}

/* 약관 내용 박스 */
.terms-content-box {
  border-top: 1px solid #e5e7eb;
  background: #fafafa;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.terms-content {
  padding: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #555;
}

.terms-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 1rem 0 0.5rem 0;
}

.terms-content h4:first-child {
  margin-top: 0;
}

.terms-content p {
  margin-bottom: 0.8rem;
}

/* 버튼 */
.button-wrapper {
  margin-top: 1.5rem;
}

.next-button {
  width: 100%;
  padding: 1rem;
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-button:hover {
  box-shadow: 0 15px 35px var(--color-light-3);
  transform: translateY(-2px);
}
</style>

