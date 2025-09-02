<template>
  <div class="section container find-id-container">
    <div class="find-id-card">
      <!-- 헤더는 그대로 -->
      <div class="find-id-header">
        <h1 class="find-id-title">아이디 찾기</h1>
        <p class="find-id-subtitle">
          가입 시 등록한 이름과 휴대폰 번호 인증으로<br />
          아이디를 찾을 수 있습니다
        </p>
      </div>

      <!-- 폼 화면 -->
      <div v-if="!isResultPage" class="find-method">
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

          <!-- SMS 인증 -->
          <div class="form-group">
            <label for="phone" class="form-label">휴대폰 번호</label>

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

      <!-- 결과 화면 -->
      <div v-else class="result-section">
        <div v-if="foundEmails.length > 0" class="email-list">
          <div v-for="email in foundEmails" :key="email.id" class="email-item">
            <div class="email-info">
              <span class="masked-email">{{ email.maskedEmail }}</span>
              <span class="join-date">가입일: {{ formatDate(email.joinDate) }}</span>
            </div>
          </div>
        </div>
        <div v-else>
          <p>일치하는 계정을 찾을 수 없습니다.</p>
        </div>

        <div class="result-actions">
          <router-link to="/login" class="login-button">로그인하러 가기</router-link>
          <router-link to="/login/find-password" class="forgot-button">비밀번호 찾기</router-link>
        </div>
      </div>

      <div class="back-to-login">
        <router-link to="/login" class="back-link"> ← 로그인 페이지로 돌아가기 </router-link>
      </div>

      <!-- 안내사항 (폼일 때만 보여주고 싶으면 v-if 붙이면 됨) -->
      <div class="help-text" v-if="!isResultPage">
        <h3>안내사항</h3>
        <ul>
          <li>가입 시 입력한 이름과 휴대폰 번호와 정확히 일치해야 합니다</li>
          <li>인증번호는 5분 내에 입력해주세요</li>
          <li>개인정보 보호를 위해 이메일 일부는 마스킹되어 표시됩니다</li>
          <li>휴대폰 번호가 변경되었다면 고객센터로 문의해주세요</li>
          <li>문제가 지속되면 고객센터(1588-0000)로 연락해주세요</li>
        </ul>
      </div>
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
const isResultPage = ref(false); // 👉 추가

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
      message.value = `${result.emails.length}개의 계정을 찾았습니다.`;
      messageType.value = 'success';
    } else {
      message.value = result.message || '일치하는 계정을 찾을 수 없습니다.';
      messageType.value = 'error';
    }

    isResultPage.value = true; // 👉 화면 전환
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
  border: 2px solid var(--color-light-1);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--color-white);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-main);
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
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.find-button:hover:not(:disabled) {
  box-shadow: 0 10px 30px var(--color-light-3);
}

.find-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.result-section {
  border-radius: 12px;
  margin-bottom: 2rem;
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
  background: var(--color-main,);
  color: white;
}

.login-button:hover {
  box-shadow: 0 10px 30px var(--color-light-3);
}

.forgot-button {
  background: white;
  color: var(--color-main);
  border: 2px solid var(--color-main);
}

.forgot-button:hover {
  box-shadow: 0 10px 30px var(--color-light-3);
}

.back-to-login {
  text-align: center;
  margin-bottom: 2rem;
}

.back-link {
  color: #999;
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
  color: #999;
  position: absolute;
  left: 0;
  font-weight: bold;
}
</style>
