<template>
  <div class="step-content">
    <!-- 헤더 -->
    <div class="step-header">
      <h1 class="step-title">비밀번호 찾기</h1>
      <p class="step-subtitle">가입 시 등록한 정보로 인증하여 비밀번호를 재설정할 수 있습니다</p>
    </div>

    <!-- 인증 방법 선택 화면 -->
    <div v-if="currentStep === 'method'">
      <div class="method-selection">
        <h3 class="method-title">인증 방법을 선택해주세요</h3>

        <div class="method-options">
          <div
            class="method-option"
            :class="{ active: selectedMethod === 'sms' }"
            @click="selectMethod('sms')"
          >
            <div class="method-icon"><i class="fas fa-mobile-alt"></i></div>
            <div class="method-content">
              <h4 class="method-name">SMS 인증</h4>
              <p class="method-desc">가입 시 등록한 이름과 휴대폰 번호로 인증</p>
            </div>
          </div>

          <div
            class="method-option"
            :class="{ active: selectedMethod === 'email' }"
            @click="selectMethod('email')"
          >
            <div class="method-icon"><i class="fas fa-envelope"></i></div>
            <div class="method-content">
              <h4 class="method-name">이메일 인증</h4>
              <p class="method-desc">가입 시 등록한 이메일로 인증코드 받기</p>
            </div>
          </div>
        </div>

        <div class="button-wrapper">
          <button class="next-button" :disabled="!selectedMethod" @click="goToAuthStep">
            다음 단계
          </button>
        </div>
      </div>
    </div>

    <!-- SMS 인증 화면 -->
    <div v-else-if="currentStep === 'sms-auth'">
      <form @submit.prevent="handleSmsAuth" class="step-form">
        <div class="auth-header">
          <h3 class="auth-title">SMS 인증</h3>
        </div>

        <div class="form-group">
          <label for="smsName" class="form-label">이름</label>
          <div class="form-control">
            <input
              id="smsName"
              v-model="smsForm.name"
              type="text"
              class="form-input"
              placeholder="가입 시 입력한 이름을 입력하세요"
              :disabled="smsVerificationStatus.isVerified"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="smsPhone" class="form-label">휴대폰 번호</label>
          <div class="form-control">
            <SmsVerification
              ref="smsVerificationRef"
              id="smsPhone"
              v-model="smsForm.phone"
              :disabled="smsVerificationStatus.isVerified"
              @verified="onSmsVerified"
              @error="onSmsError"
              @code-sent="onCodeSent"
            />
          </div>
        </div>

        <!-- 메시지 표시 -->
        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>

        <!-- 인증 완료 버튼 -->
        <div class="button-wrapper">
          <button
            type="submit"
            class="auth-button"
            :disabled="!smsVerificationStatus.isVerified || isLoading"
          >
            <span v-if="isLoading">확인 중...</span>
            <span v-else>계정 확인</span>
          </button>
        </div>
      </form>
    </div>

    <!-- 이메일 인증 화면 -->
    <div v-else-if="currentStep === 'email-auth'">
      <div class="step-form">
        <div class="auth-header">
          <h3 class="auth-title">이메일 인증</h3>
          <p class="auth-description">가입 시 등록한 이름과 이메일 주소를 입력해주세요</p>
        </div>

        <div class="form-group">
          <label for="emailName" class="form-label">이름</label>
          <div class="form-control">
            <input
              id="emailName"
              v-model="emailForm.name"
              type="text"
              class="form-input"
              placeholder="가입 시 입력한 이름을 입력하세요"
              :disabled="emailVerificationStatus.isVerified"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label for="emailAddress" class="form-label">이메일 주소</label>
          <div class="form-control">
            <EmailVerification
              ref="emailVerificationRef"
              id="emailAddress"
              v-model="emailForm.email"
              :disabled="emailVerificationStatus.isVerified"
              @verified="onEmailVerified"
              @error="onSmsError"
              @code-sent="onCodeSent"
            />
          </div>
        </div>

        <!-- 메시지 표시 -->
        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>

        <!-- 다음 단계 버튼 -->
        <div v-if="emailVerificationStatus.isVerified" class="button-wrapper">
          <button
            type="button"
            class="auth-button"
            :disabled="!emailForm.name.trim() || isLoading"
            @click="goToPasswordReset"
          >
            <span v-if="isLoading">확인 중...</span>
            <span v-else>비밀번호 재설정하기</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 새 비밀번호 설정 화면 -->
    <div v-else-if="currentStep === 'reset-password'">
      <form @submit.prevent="handlePasswordReset" class="step-form">
        <div class="auth-header">
          <h3 class="auth-title">새 비밀번호 설정</h3>
          <div class="verified-email">
            <span class="email-label">계정:</span>
            <span class="email-value">{{ verifiedEmail }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="newPassword" class="form-label">새 비밀번호</label>
          <div class="form-control">
            <input
              id="newPassword"
              v-model="passwordForm.newPassword"
              type="password"
              class="form-input"
              placeholder="새 비밀번호를 입력하세요"
              required
            />
            <div class="input-hint">최소 8자 이상, 영문, 숫자, 특수문자 포함(@$!%*?&)</div>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">비밀번호 확인</label>
          <div class="form-control">
            <input
              id="confirmPassword"
              v-model="passwordForm.confirmNewPassword"
              type="password"
              class="form-input"
              placeholder="새 비밀번호를 다시 입력하세요"
              required
            />
            <div v-if="passwordMismatchMessage" class="check-message error">
              {{ passwordMismatchMessage }}
            </div>
          </div>
        </div>

        <!-- 메시지 표시 -->
        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>

        <!-- 비밀번호 변경 버튼 -->
        <div class="button-wrapper">
          <!-- 버튼 클릭시 로그인 페이지로 -->
          <button
            type="submit"
            class="auth-button"
            :disabled="!isPasswordFormValid || isLoading"
            @click="goToLogin"
          >
            <span v-if="isLoading">변경 중...</span>
            <span v-else>비밀번호 변경</span>
          </button>
        </div>
      </form>
    </div>

    <!-- 안내사항 (방법 선택 화면에서만 표시) -->
    <div v-if="currentStep === 'method'" class="help-section">
      <h3 class="help-title">안내사항</h3>
      <ul class="help-list">
        <li>가입 시 입력한 정보와 정확히 일치해야 합니다</li>
        <li>SMS 인증 시 휴대폰 번호로 계정을 찾습니다</li>
        <li>인증 완료 후 즉시 새 비밀번호를 설정할 수 있습니다</li>
        <li>문제가 지속되면 고객센터(1588-0000)로 연락해주세요</li>
      </ul>
    </div>

    <!-- 돌아가기 링크 -->
    <div class="back-to-login">
      <router-link to="/login" class="back-link">← 로그인 페이지로 돌아가기</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import SmsVerification from '@/components/signup/SmsVerification.vue';
import EmailVerification from '@/components/signup/EmailVerification.vue';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// 상태
const currentStep = ref('method'); // method, sms-auth, email-auth, reset-password, result
const selectedMethod = ref('');
const smsVerificationRef = ref(null);
const emailVerificationRef = ref(null); // 수정: 별도 ref 생성
const isLoading = ref(false);
const message = ref('');
const messageType = ref('');
const passwordResetSuccess = ref(false);
const verifiedEmail = ref('');
const errorTitle = ref('');
const errorMessage = ref('');

// 폼 데이터
const smsForm = reactive({
  name: '',
  phone: '',
});

const emailForm = reactive({
  name: '', // 수정: name 필드 추가
  email: '',
  code: '',
});

const passwordForm = reactive({
  newPassword: '',
  confirmNewPassword: '',
});

// SMS 인증 상태
const smsVerificationStatus = ref({
  isVerified: false,
  phone: '',
  codeSent: false,
});

// 이메일 인증 상태
const emailVerificationStatus = ref({
  codeSent: false,
  isVerified: false,
  email: '',
});

// 유효성 검증
const isValidPassword = (password) =>
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

const passwordMismatchMessage = computed(() => {
  if (!passwordForm.confirmNewPassword) return '';
  return passwordForm.newPassword === passwordForm.confirmNewPassword
    ? ''
    : '비밀번호가 일치하지 않습니다.';
});

const isPasswordFormValid = computed(() => {
  return (
    passwordForm.newPassword &&
    passwordForm.confirmNewPassword &&
    isValidPassword(passwordForm.newPassword) &&
    passwordForm.newPassword === passwordForm.confirmNewPassword
  );
});

// 인증 방법 선택
const selectMethod = (method) => {
  selectedMethod.value = method;
};

const goToAuthStep = () => {
  if (selectedMethod.value === 'sms') {
    currentStep.value = 'sms-auth';
  } else if (selectedMethod.value === 'email') {
    currentStep.value = 'email-auth';
  }
  message.value = '';
};

// SMS 인증 이벤트들
const onSmsVerified = (data) => {
  smsVerificationStatus.value = {
    isVerified: true,
    phone: data.phone,
    codeSent: true,
  };
  message.value = '휴대폰 인증이 완료되었습니다.';
  messageType.value = 'success';
};

const onSmsError = (error) => {
  message.value = error.message || '인증 중 오류가 발생했습니다.';
  messageType.value = 'error';
};

const onCodeSent = () => {
  message.value = '인증번호가 발송되었습니다.';
  messageType.value = 'success';
};

// 수정: 이메일 인증 완료 처리
const onEmailVerified = (data) => {
  emailVerificationStatus.value = {
    isVerified: true,
    email: data.email,
    codeSent: true,
  };

  message.value = '이메일 인증이 완료되었습니다. 이제 비밀번호를 재설정할 수 있습니다.';
  messageType.value = 'success';
};

// SMS 인증 처리
const handleSmsAuth = async () => {
  if (!smsVerificationStatus.value.isVerified) {
    message.value = '휴대폰 인증을 완료해주세요.';
    messageType.value = 'error';
    return;
  }

  try {
    isLoading.value = true;
    message.value = '';

    // findIdByPhone API로 계정 확인 및 이메일 획득
    const result = await authStore.findIdByPhone({
      name: smsForm.name.trim(),
      phone: smsForm.phone,
    });

    if (result.success && result.emails?.length > 0) {
      verifiedEmail.value = result.emails[0].actualEmail || result.emails[0].maskedEmail;
      currentStep.value = 'reset-password';
      message.value = '';
    } else {
      errorTitle.value = '계정을 찾을 수 없습니다';
      errorMessage.value = '입력하신 정보와 일치하는 계정이 없습니다.';
      currentStep.value = 'result';
    }
  } catch (error) {
    console.error('SMS auth error:', error);
    errorTitle.value = '인증 중 오류 발생';
    errorMessage.value = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    currentStep.value = 'result';
  } finally {
    isLoading.value = false;
  }
};

// 수정: 비밀번호 재설정 화면으로 이동 (단순화)
const goToPasswordReset = () => {
  if (!emailVerificationStatus.value.isVerified) {
    message.value = '이메일 인증을 완료해주세요.';
    messageType.value = 'error';
    return;
  }

  if (!emailForm.name.trim()) {
    message.value = '이름을 입력해주세요.';
    messageType.value = 'error';
    return;
  }

  // 이메일 인증이 성공했다는 것은 해당 이메일이 등록된 계정이라는 의미
  verifiedEmail.value = emailForm.email;
  currentStep.value = 'reset-password';
  message.value = '';
};

// 수정: 비밀번호 재설정 처리 (이름 정보도 함께 전송)
const handlePasswordReset = async () => {
  if (!isPasswordFormValid.value) {
    message.value = '비밀번호를 올바르게 입력해주세요.';
    messageType.value = 'error';
    return;
  }

  try {
    isLoading.value = true;
    message.value = '';

    // 이메일과 이름 정보를 함께 전송
    const resetData = {
      email: verifiedEmail.value,
      newPassword: passwordForm.newPassword,
      confirmNewPassword: passwordForm.confirmNewPassword,
    };

    // 선택적으로 이름 정보도 전송 (서버에서 추가 검증용)
    if (selectedMethod.value === 'email' && emailForm.name) {
      resetData.name = emailForm.name;
    } else if (selectedMethod.value === 'sms' && smsForm.name) {
      resetData.name = smsForm.name;
    }

    const result = await authStore.resetPasswordByEmail(resetData);

    passwordResetSuccess.value = result.success;
    currentStep.value = 'result';

    if (!result.success) {
      errorTitle.value = '비밀번호 변경 실패';
      errorMessage.value = result.message || '비밀번호 변경 중 오류가 발생했습니다.';
    }
  } catch (error) {
    console.error('Password reset error:', error);
    passwordResetSuccess.value = false;
    errorTitle.value = '비밀번호 변경 실패';
    errorMessage.value = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    currentStep.value = 'result';
  } finally {
    isLoading.value = false;
  }
};

const goToLogin = () => {
  router.push('/login');
};

// 수정: 초기화
const resetForm = () => {
  currentStep.value = 'method';
  selectedMethod.value = '';
  smsForm.name = '';
  smsForm.phone = '';
  emailForm.name = ''; // 수정: name 필드 추가
  emailForm.email = '';
  emailForm.code = '';
  passwordForm.newPassword = '';
  passwordForm.confirmNewPassword = '';
  message.value = '';
  verifiedEmail.value = '';
  passwordResetSuccess.value = false;
  errorTitle.value = '';
  errorMessage.value = '';
  smsVerificationStatus.value = { isVerified: false, phone: '', codeSent: false };
  emailVerificationStatus.value = { codeSent: false, isVerified: false, email: '' };

  if (smsVerificationRef.value) {
    smsVerificationRef.value.reset();
  }
  // 수정: 이메일 ref도 초기화
  if (emailVerificationRef.value) {
    emailVerificationRef.value.reset();
  }
};
</script>

<style scoped>
.step-content {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.step-header {
  text-align: center;
  margin-bottom: 2rem;
}

.step-title {
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.step-subtitle {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
}

.step-form {
  width: 100%;
}

/* 인증 방법 선택 */
.method-selection {
  margin-bottom: 2rem;
}

.method-title {
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-align: center;
}

.method-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.method-option {
  display: flex;
  align-items: center;
  padding: 1.2rem;
  border: 2px solid var(--color-light-1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.method-option:hover {
  border-color: var(--color-main);
  transform: translateY(-2px);
}

.method-option.active {
  border-color: var(--color-main);
  background: var(--color-light-3);
}

.method-icon {
  font-size: 2rem;
  margin-right: 1rem;
  flex-shrink: 0;
  color: var(--color-main);
}

.method-content {
  flex: 1;
}

.method-name {
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.method-desc {
  color: #666;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* 인증 헤더 */
.auth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.auth-title {
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
}

.verified-email {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.email-label {
  color: #666;
  font-size: 0.85rem;
}

.email-value {
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
}

/* 폼 그룹 - 일관된 정렬 */
.form-group {
  display: grid;
  grid-template-columns: 140px 1fr;
  align-items: flex-start;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

/* 라벨 스타일 */
.form-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  text-align: left;
  padding-top: 0.9rem;
  line-height: 1.2;
}

/* 폼 컨트롤 컨테이너 */
.form-control {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  border: none;
}

/* 입력창 기본 스타일 */
.form-input {
  width: 100%;
  padding: 0.9rem 1rem;
  border: 2px solid var(--color-light-1);
  border-radius: 12px;
  font-size: 1rem;
  background: var(--color-white);
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-main);
  background: white;
  box-shadow: 0 0 0 3px var(--color-light-3);
}

.form-input:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.65;
}

/* 힌트 및 메시지 */
.input-hint {
  font-size: 0.85rem;
  color: #999;
  font-weight: 500;
}

.check-message {
  font-size: 0.85rem;
  font-weight: 500;
}

.check-message.error {
  color: #dc3545;
}

/* 메시지 박스 */
.message {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  text-align: center;
  font-weight: 500;
}

.message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* 버튼 */
.button-wrapper {
  margin-top: 2rem;
}

.next-button,
.auth-button {
  width: 100%;
  padding: 1rem;
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.next-button:hover:not(:disabled),
.auth-button:hover:not(:disabled) {
  box-shadow: 0 15px 35px var(--color-light-3);
  transform: translateY(-2px);
}

.next-button:disabled,
.auth-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 결과 화면 */
.result-content {
  margin-bottom: 2rem;
  text-align: center;
}

.result-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.result-title {
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.result-info {
  margin-bottom: 2rem;
}

.result-text {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.success-result .result-icon {
  color: #28a745;
}

.error-result .result-icon {
  color: #dc3545;
}

.result-actions {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.login-button,
.find-id-button,
.retry-button {
  flex: 1;
  padding: 0.9rem 1.2rem;
  text-align: center;
  border-radius: 12px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 100px;
  border: none;
  cursor: pointer;
}

.login-button {
  background: var(--color-main);
  color: white;
}

.login-button:hover {
  box-shadow: 0 10px 30px var(--color-light-3);
  transform: translateY(-2px);
}

.find-id-button {
  background: white;
  color: var(--color-main);
  border: 2px solid var(--color-main);
}

.find-id-button:hover {
  box-shadow: 0 10px 30px var(--color-light-3);
  transform: translateY(-2px);
}

.retry-button {
  background: #6c757d;
  color: white;
}

.retry-button:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

/* 안내사항 */
.help-section {
  margin-top: 3rem;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
}

.help-title {
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.help-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.help-list li {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 0.8rem;
  padding-left: 1rem;
  position: relative;
  line-height: 1.5;
}

.help-list li:last-child {
  margin-bottom: 0;
}

.help-list li::before {
  content: '•';
  color: #999;
  position: absolute;
  left: 0;
  font-weight: bold;
}

/* 돌아가기 링크 */
.back-to-login {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.back-link {
  color: #999;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #666;
  text-decoration: underline;
}
</style>
