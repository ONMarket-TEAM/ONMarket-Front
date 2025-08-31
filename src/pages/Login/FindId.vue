<template>
  <div class="section container find-id-container">
    <div class="find-id-card">
      <div class="find-id-header">
        <h1 class="find-id-title">아이디 찾기</h1>
        <p class="find-id-subtitle">
          가입 시 등록한 이름과 휴대폰 번호 인증으로<br />
          아이디를 찾을 수 있습니다
        </p>
      </div>

      <!-- 아이디 찾기 폼 -->
      <div class="find-method">
        <form @submit.prevent="handleFindId" class="find-form">
          <div class="form-group">
            <label for="name" class="form-label">이름</label>
            <input
              id="name"
              v-model="findForm.name"
              type="text"
              class="form-input"
              placeholder="가입 시 입력한 이름을 입력하세요"
              :disabled="isVerified"
              required
            />
          </div>

          <div class="form-group">
            <label for="phone" class="form-label">휴대폰 번호</label>
            <div class="phone-input-group">
              <input
                id="phone"
                v-model="findForm.phone"
                type="tel"
                class="form-input"
                placeholder="010-0000-0000"
                maxlength="13"
                :disabled="isVerified"
                required
                @input="formatPhoneNumber"
              />
              <button
                type="button"
                class="send-code-button"
                @click="sendVerificationCode"
                :disabled="!canSendCode || isVerified"
              >
                <span v-if="isSendingCode">발송중...</span>
                <span v-else-if="timer > 0">{{ formatTime(timer) }}</span>
                <span v-else>{{ codeSent ? '재발송' : '인증번호 발송' }}</span>
              </button>
            </div>
            <div class="input-hint">'-' 없이 입력하셔도 자동으로 형식이 맞춰집니다</div>
          </div>

          <!-- 인증번호 입력 -->
          <div v-if="codeSent" class="form-group">
            <label for="verification-code" class="form-label">인증번호</label>
            <div class="verification-input-group">
              <input
                id="verification-code"
                v-model="findForm.verificationCode"
                type="text"
                class="form-input"
                placeholder="인증번호 6자리를 입력하세요"
                maxlength="6"
                :disabled="isVerified"
                @input="filterNumbers"
              />
              <button
                type="button"
                class="verify-button"
                @click="verifyCode"
                :disabled="!canVerifyCode || isVerified"
              >
                <span v-if="isVerifying">확인중...</span>
                <span v-else>확인</span>
              </button>
            </div>
            <div v-if="timer > 0" class="timer-text">남은 시간: {{ formatTime(timer) }}</div>
            <div v-if="timer === 0" class="expired-text">
              인증번호가 만료되었습니다. 재발송해주세요.
            </div>
          </div>

          <!-- 인증 완료 표시 -->
          <div v-if="isVerified" class="verification-success">
            <div class="success-icon">✓</div>
            <span>휴대폰 인증이 완료되었습니다</span>
          </div>

          <button type="submit" class="find-button" :disabled="!isVerified || isLoading">
            <span v-if="isLoading">찾는 중...</span>
            <span v-else>아이디 찾기</span>
          </button>
        </form>
      </div>

      <!-- 결과 표시 -->
      <div v-if="foundEmails.length > 0" class="result-section">
        <h3 class="result-title">찾은 아이디</h3>
        <div class="email-list">
          <div v-for="email in foundEmails" :key="email.id" class="email-item">
            <div class="email-info">
              <span class="masked-email">{{ email.maskedEmail }}</span>
              <span class="join-date">가입일: {{ formatDate(email.joinDate) }}</span>
            </div>
          </div>
        </div>

        <div class="result-actions">
          <router-link to="/login" class="login-button">로그인하러 가기</router-link>
          <router-link to="/login/find-password" class="forgot-button">비밀번호 찾기</router-link>
        </div>
      </div>

      <div class="back-to-login">
        <router-link to="/login" class="back-link"> ← 로그인 페이지로 돌아가기 </router-link>
      </div>

      <!-- 안내사항 -->
      <div class="help-text">
        <h3>안내사항</h3>
        <ul>
          <li>가입 시 입력한 이름과 휴대폰 번호와 정확히 일치해야 합니다</li>
          <li>인증번호는 5분 내에 입력해주세요</li>
          <li>개인정보 보호를 위해 이메일 일부는 마스킹되어 표시됩니다</li>
          <li>휴대폰 번호가 변경되었다면 고객센터로 문의해주세요</li>
          <li>문제가 지속되면 고객센터(1588-0000)로 연락해주세요</li>
        </ul>
      </div>

      <!-- 메시지 -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { smsAPI } from '@/api/sms';

const authStore = useAuthStore();

const isLoading = ref(false);
const isSendingCode = ref(false);
const isVerifying = ref(false);
const message = ref('');
const messageType = ref('');
const foundEmails = ref([]);
const codeSent = ref(false);
const isVerified = ref(true);
const timer = ref(0);
const timerInterval = ref(null);

const findForm = reactive({
  name: '강영광',
  phone: '010-8228-4615',
  verificationCode: '',
});

// 인증번호 발송 가능 여부
const canSendCode = computed(() => {
  const validation = smsAPI.validatePhoneNumber(findForm.phone);
  return findForm.name.trim().length >= 2 && validation.isValid && !isSendingCode.value;
});

// 인증번호 확인 가능 여부
const canVerifyCode = computed(() => {
  return findForm.verificationCode.length === 6 && timer.value > 0 && !isVerifying.value;
});

// 전화번호 자동 포맷팅
const formatPhoneNumber = () => {
  let phone = findForm.phone.replace(/[^0-9]/g, '');

  if (phone.length <= 3) {
    findForm.phone = phone;
  } else if (phone.length <= 7) {
    findForm.phone = `${phone.slice(0, 3)}-${phone.slice(3)}`;
  } else if (phone.length <= 11) {
    findForm.phone = `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  }
};

// 숫자만 입력 허용
const filterNumbers = () => {
  findForm.verificationCode = findForm.verificationCode.replace(/[^0-9]/g, '');
};

// 시간 포맷팅 (mm:ss)
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 타이머 시작
const startTimer = () => {
  timer.value = 300; // 5분
  timerInterval.value = setInterval(() => {
    timer.value--;
    if (timer.value <= 0) {
      clearInterval(timerInterval.value);
    }
  }, 1000);
};

// 타이머 정지
const stopTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
};

// 인증번호 발송
const sendVerificationCode = async () => {
  if (!canSendCode.value) return;

  const validation = smsAPI.validatePhoneNumber(findForm.phone);

  try {
    isSendingCode.value = true;
    message.value = '';

    const result = await smsAPI.sendVerificationCode(validation.cleanNumber);

    if (result.success) {
      codeSent.value = true;
      isVerified.value = false;
      findForm.verificationCode = '';
      message.value = '인증번호가 발송되었습니다.';
      messageType.value = 'success';

      // 기존 타이머가 있다면 정지
      stopTimer();
      startTimer();
    } else {
      message.value = result.message;
      messageType.value = 'error';
    }
  } catch (error) {
    console.error('SMS send error:', error);
    message.value = '인증번호 발송 중 오류가 발생했습니다.';
    messageType.value = 'error';
  } finally {
    isSendingCode.value = false;
  }
};

// 인증번호 확인
const verifyCode = async () => {
  if (!canVerifyCode.value) return;

  const validation = smsAPI.validatePhoneNumber(findForm.phone);

  try {
    isVerifying.value = true;
    message.value = '';

    const result = await smsAPI.confirmVerificationCode(
      validation.cleanNumber,
      findForm.verificationCode
    );

    if (result.success) {
      isVerified.value = true;
      message.value = '휴대폰 인증이 완료되었습니다.';
      messageType.value = 'success';
      stopTimer();
    } else {
      message.value = result.message;
      messageType.value = 'error';
    }
  } catch (error) {
    console.error('SMS verification error:', error);
    message.value = '인증번호 확인 중 오류가 발생했습니다.';
    messageType.value = 'error';
  } finally {
    isVerifying.value = false;
  }
};

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// 아이디 찾기 실행
const handleFindId = async () => {
  if (!isVerified.value) {
    message.value = '휴대폰 인증을 완료해주세요.';
    messageType.value = 'error';
    console.log('휴대폰 인증을 완료해주세요.');
    return;
  }

  try {
    isLoading.value = true;
    foundEmails.value = [];
    message.value = '';

    // DB와 매칭을 위해 하이픈 포함 형식으로 전송
    const result = await authStore.findIdByPhone({
      name: findForm.name.trim(),
      phone: findForm.phone, // 하이픈 포함된 형식 그대로 전송
    });
    console.log('result', result);
    if (result.success && result.emails && result.emails.length > 0) {
      foundEmails.value = result.emails;
      message.value = `${result.emails.length}개의 계정을 찾았습니다.`;
      messageType.value = 'success';
    } else {
      message.value = result.message || '일치하는 계정을 찾을 수 없습니다.';
      messageType.value = 'error';
    }
  } catch (error) {
    console.error('Find ID error:', error);
    message.value = '아이디 찾기 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    messageType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

// 컴포넌트 언마운트 시 타이머 정리
onUnmounted(() => {
  stopTimer();
});
</script>

<style scoped>
.find-id-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.find-id-card {
  position: relative;
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  width: 100%;
  border: 1px solid #ccc;
  max-width: 550px;
}

.find-id-header {
  text-align: center;
  margin-bottom: 2rem;
}

.find-id-title {
  color: #333;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.find-id-subtitle {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
}

.find-method {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--color-light-1, #e5e7eb);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--color-white, #ffffff);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-main, #3b82f6);
  background: white;
  box-shadow: 0 0 0 3px var(--color-light-3, #dbeafe);
}

.form-input:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.phone-input-group,
.verification-input-group {
  display: flex;
  gap: 0.8rem;
}

.phone-input-group .form-input,
.verification-input-group .form-input {
  flex: 1;
}

.send-code-button,
.verify-button {
  padding: 1rem 1.2rem;
  background-color: var(--color-main, #3b82f6);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 100px;
}

.send-code-button:hover:not(:disabled),
.verify-button:hover:not(:disabled) {
  background-color: var(--color-main-hover, #2563eb);
}

.send-code-button:disabled,
.verify-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.input-hint {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.3rem;
}

.timer-text {
  font-size: 0.85rem;
  color: var(--color-main, #3b82f6);
  margin-top: 0.5rem;
  font-weight: 600;
}

.expired-text {
  font-size: 0.85rem;
  color: #dc3545;
  margin-top: 0.5rem;
  font-weight: 600;
}

.verification-success {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.success-icon {
  width: 24px;
  height: 24px;
  background-color: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.find-button {
  width: 100%;
  padding: 1rem;
  background-color: var(--color-main, #3b82f6);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.find-button:hover:not(:disabled) {
  background-color: var(--color-main-hover, #2563eb);
  box-shadow: 0 10px 30px var(--color-light-3, #dbeafe);
}

.find-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.result-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.result-title {
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.email-list {
  margin-bottom: 1.5rem;
}

.email-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 0.8rem;
  border: 1px solid #e9ecef;
}

.email-item:last-child {
  margin-bottom: 0;
}

.email-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.masked-email {
  color: var(--color-main, #3b82f6);
  font-weight: 600;
  font-size: 1rem;
}

.join-date {
  color: #666;
  font-size: 0.85rem;
}

.result-actions {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.login-button,
.forgot-button {
  flex: 1;
  padding: 0.8rem 1.5rem;
  text-align: center;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 120px;
}

.login-button {
  background: var(--color-main, #3b82f6);
  color: white;
}

.login-button:hover {
  background: var(--color-main-hover, #2563eb);
}

.forgot-button {
  background: white;
  color: var(--color-main, #3b82f6);
  border: 2px solid var(--color-main, #3b82f6);
}

.forgot-button:hover {
  background: var(--color-main, #3b82f6);
  color: white;
}

.back-to-login {
  text-align: center;
  margin-bottom: 2rem;
}

.back-link {
  color: var(--color-main, #3b82f6);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.back-link:hover {
  text-decoration: underline;
}

.help-text {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.help-text h3 {
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.help-text ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.help-text li {
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 0.8rem;
  padding-left: 1rem;
  position: relative;
  line-height: 1.5;
}

.help-text li:last-child {
  margin-bottom: 0;
}

.help-text li::before {
  content: '•';
  color: var(--color-main, #3b82f6);
  position: absolute;
  left: 0;
  font-weight: bold;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
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

@media (max-width: 640px) {
  .find-id-card {
    padding: 2rem;
  }

  .phone-input-group,
  .verification-input-group {
    flex-direction: column;
  }

  .send-code-button,
  .verify-button {
    width: 100%;
    min-width: unset;
  }

  .result-actions {
    flex-direction: column;
  }

  .login-button,
  .forgot-button {
    min-width: 100%;
  }

  .email-info {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
