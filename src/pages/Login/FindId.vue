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
              :disabled="smsVerificationStatus.isVerified"
              required
            />
          </div>

          <!-- SMS 인증 컴포넌트 -->
          <SmsVerification
            ref="smsVerificationRef"
            v-model="findForm.phone"
            :disabled="smsVerificationStatus.isVerified"
            @verified="onSmsVerified"
            @error="onSmsError"
            @code-sent="onCodeSent"
          />

          <button
            type="submit"
            class="find-button"
            :disabled="!smsVerificationStatus.isVerified || isLoading"
          >
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
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import SmsVerification from '@/components/signup/SmsVerification .vue';

const authStore = useAuthStore();

// Refs
const smsVerificationRef = ref(null);
const isLoading = ref(false);
const message = ref('');
const messageType = ref('');
const foundEmails = ref([]);

// Form data
const findForm = reactive({
  name: '강영광',
  phone: '010-8228-4615',
});

// SMS 인증 상태 추적
const smsVerificationStatus = ref({
  isVerified: false,
  phone: '',
  codeSent: false,
});

// SMS 인증 완료 핸들러
const onSmsVerified = (data) => {
  smsVerificationStatus.value = {
    isVerified: true,
    phone: data.phone,
    codeSent: true,
  };

  message.value = '휴대폰 인증이 완료되었습니다.';
  messageType.value = 'success';

  console.log('SMS 인증 완료:', data);
};

// SMS 에러 핸들러
const onSmsError = (error) => {
  message.value = error.message || '인증 중 오류가 발생했습니다.';
  messageType.value = 'error';

  console.error('SMS 인증 에러:', error);
};

// 인증번호 발송 완료 핸들러
const onCodeSent = (data) => {
  console.log('인증번호 발송 완료:', data);
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
  if (!smsVerificationStatus.value.isVerified) {
    message.value = '휴대폰 인증을 완료해주세요.';
    messageType.value = 'error';
    return;
  }

  try {
    isLoading.value = true;
    foundEmails.value = [];
    message.value = '';

    const result = await authStore.findIdByPhone({
      name: findForm.name.trim(),
      phone: findForm.phone,
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

// 초기화 메소드 (필요 시 사용)
const resetForm = () => {
  findForm.name = '';
  findForm.phone = '';
  foundEmails.value = [];
  message.value = '';
  smsVerificationStatus.value = {
    isVerified: false,
    phone: '',
    codeSent: false,
  };

  // SMS 인증 컴포넌트 초기화
  if (smsVerificationRef.value) {
    smsVerificationRef.value.reset();
  }
};
</script>

<style scoped>
.find-id-container {
  min-height: 100%;
  display: flex;
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
