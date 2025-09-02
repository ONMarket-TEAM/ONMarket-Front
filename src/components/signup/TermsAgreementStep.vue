<template>
  <div class="step-content">
    <!-- 헤더 -->
    <div class="step-header">
      <h1 class="step-title">약관 동의</h1>
      <p class="step-subtitle">서비스 이용을 위해 아래 약관을 확인하고 동의해주세요</p>
    </div>

    <form @submit.prevent="handleNext" class="step-form">
      <!-- 약관 전문 (스크롤 영역) -->
      <div class="terms-full" ref="termsBox">
        <h3 id="terms">1. 이용약관</h3>
        <div class="terms-content">
          <p>
            제1조 (목적) 본 약관은 회사와 이용자 간의 서비스 이용 조건 및 절차, 권리와 의무를
            규정합니다.
          </p>
          <p>
            제2조 (서비스의 제공) 회사는 안정적인 서비스 제공을 위해 최선을 다하며 필요 시 내용을
            변경할 수 있습니다.
          </p>
          <p>
            제3조 (이용자의 의무) 이용자는 관련 법령과 본 약관을 준수해야 하며, 타인의 권리를
            침해해서는 안 됩니다.
          </p>
        </div>

        <h3 id="privacy">2. 개인정보 처리방침</h3>
        <div class="terms-content">
          <p>① 수집 항목: 이름, 이메일, 휴대폰 번호 등</p>
          <p>② 이용 목적: 서비스 제공, 고객 상담, 이벤트 안내 등</p>
          <p>③ 보유 기간: 회원 탈퇴 시 즉시 파기</p>
          <p>④ 제3자 제공: 법령에 의거하거나 이용자 동의 시</p>
        </div>

        <h3 id="marketing">3. 마케팅 정보 수신 동의</h3>
        <div class="terms-content">
          <p>이벤트, 쿠폰, 신규 서비스 출시 소식을 이메일과 SMS로 안내드립니다.</p>
          <p>수신 동의 여부는 언제든지 마이페이지에서 변경할 수 있습니다.</p>
        </div>
      </div>

      <!-- 약관 이동 버튼 -->
      <div class="terms-nav">
        <button type="button" @click="scrollTo('terms')">이용약관 보기</button>
        <button type="button" @click="scrollTo('privacy')">개인정보 처리방침 보기</button>
        <button type="button" @click="scrollTo('marketing')">마케팅 정보 보기</button>
      </div>

      <!-- 체크박스 -->
      <div class="terms-check-section">
        <label class="checkbox-label">
          <input v-model="signupForm.agreeTerms" type="checkbox" required />
          이용약관에 동의합니다 (필수)
        </label>

        <label class="checkbox-label">
          <input v-model="signupForm.agreePrivacy" type="checkbox" required />
          개인정보 처리방침에 동의합니다 (필수)
        </label>

        <label class="checkbox-label">
          <input v-model="signupForm.agreeMarketing" type="checkbox" />
          마케팅 정보 수신에 동의합니다 (선택)
        </label>
      </div>

      <!-- 메시지 -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>

      <!-- 버튼 -->
      <div class="button-wrapper">
        <button type="submit" class="next-button" :disabled="!isFormValid">다음 단계</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';

const emit = defineEmits(['next']);

// 메시지
const message = ref('');
const messageType = ref('');

// 폼 데이터
const signupForm = reactive({
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketing: false,
});

// 유효성 검증
const isFormValid = computed(() => {
  return signupForm.agreeTerms && signupForm.agreePrivacy;
});

// 약관 박스
const termsBox = ref(null);

// 스크롤 이동 (
const scrollTo = (id) => {
  const box = termsBox.value;
  if (!box) return;
  const target = box.querySelector(`#${id}`);
  if (target) {
    box.scrollTo({
      top: target.offsetTop - box.offsetTop,
      behavior: 'smooth',
    });
  }
};

// 다음 단계
const handleNext = () => {
  if (!isFormValid.value) {
    message.value = '필수 약관에 동의해주세요.';
    messageType.value = 'error';
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

/* 약관 전문 */
.terms-full {
  max-height: 300px;
  overflow-y: auto;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fafafa;
  margin-bottom: 1.5rem;
}

.terms-full h3 {
  margin-top: 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.terms-content {
  font-size: 0.85rem;
  color: #555;
  line-height: 1.5;
  margin-bottom: 1rem;
}

/* 약관 바로가기 버튼 */
.terms-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.terms-nav button {
  flex: 1;
  padding: 0.6rem;
  font-size: 0.85rem;
  border-radius: 8px;
  border: 1px solid var(--color-main);
  background: white;
  color: var(--color-main);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.terms-nav button:hover {
  background: var(--color-main);
  color: white;
}

/* 체크박스 */
.terms-check-section {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  font-size: 0.9rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 메시지 */
.message {
  margin-bottom: 1rem;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

/* 버튼 */
.button-wrapper {
  margin-top: 1rem;
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
}

.next-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
