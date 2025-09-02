<template>
  <div class="step-content">
    <!-- 헤더 -->
    <div class="step-header">
      <h1 class="step-title">아이디 찾기</h1>
      <p class="step-subtitle">
        가입 시 등록한 <b>이름</b>과 <b>휴대폰 번호</b>로 아이디를 찾을 수 있습니다
      </p>
    </div>

    <!-- 폼 화면 -->
    <div v-if="!isResultPage">
      <form @submit.prevent="handleFindId" class="step-form">
        <div class="form-group">
          <label for="name" class="form-label">이름</label>
          <div class="form-control">
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
        </div>

        <!-- SMS 인증 -->
        <div class="form-group">
          <label for="phone" class="form-label">휴대폰 번호</label>
          <div class="form-control">
            <SmsVerification
              ref="smsVerificationRef"
              id="phone"
              v-model="findForm.phone"
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

        <!-- 찾기 버튼 -->
        <div class="button-wrapper">
          <button
            type="submit"
            class="find-button"
            :disabled="!smsVerificationStatus.isVerified || isLoading"
          >
            <span v-if="isLoading">찾는 중...</span>
            <span v-else>아이디 찾기</span>
          </button>
        </div>
      </form>

      <!-- 안내사항 -->
      <div class="help-section">
        <h3 class="help-title">안내사항</h3>
        <ul class="help-list">
          <li>가입 시 입력한 이름과 휴대폰 번호와 정확히 일치해야 합니다</li>
          <li>인증번호는 5분 내에 입력해주세요</li>
          <li>개인정보 보호를 위해 이메일 일부는 마스킹되어 표시됩니다</li>
          <li>휴대폰 번호가 변경되었다면 고객센터로 문의해주세요</li>
          <li>문제가 지속되면 고객센터(1588-0000)로 연락해주세요</li>
        </ul>
      </div>
    </div>

    <!-- 결과 화면 -->
    <div v-else class="result-content">
      <div v-if="foundEmails.length > 0" class="email-list">
        <div v-for="email in foundEmails" :key="email.id" class="email-item">
          <div class="email-info">
            <span class="masked-email">{{ email.maskedEmail }}</span>
            <span class="join-date">가입일: {{ formatDate(email.joinDate) }}</span>
          </div>
        </div>
      </div>

      <div v-else class="no-result">
        <h3 class="no-result-title">계정을 찾을 수 없습니다</h3>
        <p class="no-result-text">입력하신 정보와 일치하는 계정이 없습니다.</p>
      </div>

      <div class="result-actions">
        <router-link to="/login" class="login-button">로그인하러 가기</router-link>
        <router-link to="/login/find-password" class="forgot-button">비밀번호 찾기</router-link>
        <button @click="resetForm" class="retry-button">다시 찾기</button>
      </div>
    </div>

    <!-- 돌아가기 링크 -->
    <div class="back-to-login">
      <router-link to="/login" class="back-link">← 로그인 페이지로 돌아가기</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import SmsVerification from '@/components/signup/SmsVerification.vue';

const authStore = useAuthStore();

// 상태
const smsVerificationRef = ref(null);
const isLoading = ref(false);
const message = ref('');
const messageType = ref('');
const foundEmails = ref([]);
const isResultPage = ref(false);

// 폼 데이터
const findForm = reactive({
  name: '',
  phone: '',
});

// SMS 인증 상태
const smsVerificationStatus = ref({
  isVerified: false,
  phone: '',
  codeSent: false,
});

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

const onCodeSent = (data) => {
  console.log('인증번호 발송 완료:', data);
};

// 날짜 포맷
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

    if (result.success && result.emails?.length > 0) {
      foundEmails.value = result.emails;
    } else {
      message.value = result.message || '일치하는 계정을 찾을 수 없습니다.';
      messageType.value = 'error';
    }

    isResultPage.value = true;
  } catch (error) {
    console.error('Find ID error:', error);
    message.value = '아이디 찾기 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    messageType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

// 초기화 (다시 찾기 버튼)
const resetForm = () => {
  findForm.name = '';
  findForm.phone = '';
  foundEmails.value = [];
  message.value = '';
  smsVerificationStatus.value = { isVerified: false, phone: '', codeSent: false };
  isResultPage.value = false;

  if (smsVerificationRef.value) {
    smsVerificationRef.value.reset();
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

.find-button {
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

.find-button:hover:not(:disabled) {
  box-shadow: 0 15px 35px var(--color-light-3);
  transform: translateY(-2px);
}

.find-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

/* 결과 화면 */
.result-content {
  margin-bottom: 2rem;
}

.email-list {
  margin-bottom: 2rem;
}

.email-item {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 0.8rem;
  border: 2px solid var(--color-light-1);
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
  font-weight: 600;
  font-size: 1rem;
  color: #333;
}

.join-date {
  color: #666;
  font-size: 0.85rem;
}

.no-result {
  text-align: center;
  padding: 2rem 1rem;
  margin-bottom: 2rem;
}

.no-result-title {
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.no-result-text {
  color: #666;
  font-size: 0.9rem;
}

.result-actions {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.login-button,
.forgot-button,
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

.forgot-button {
  background: white;
  color: var(--color-main);
  border: 2px solid var(--color-main);
}

.forgot-button:hover {
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
