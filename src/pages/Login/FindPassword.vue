<template>
  <div class="section container forgot-password-container">
    <div class="forgot-password-card">
      <div class="forgot-password-header">
        <h1 class="forgot-password-title">비밀번호 찾기</h1>
        <p class="forgot-password-subtitle">
          가입하신 이메일 주소를 입력하시면<br />
          비밀번호 재설정 링크를 보내드립니다
        </p>
      </div>

      <form @submit.prevent="handleForgotPassword" class="forgot-password-form">
        <div class="form-group">
          <label for="email" class="form-label">이메일</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="가입하신 이메일을 입력하세요"
            required
          />
        </div>

        <button type="submit" class="forgot-password-button" :disabled="isLoading">
          <span v-if="isLoading">전송 중...</span>
          <span v-else>재설정 링크 보내기</span>
        </button>
      </form>

      <div class="back-to-login">
        <router-link to="/login" class="back-link"> ← 로그인 페이지로 돌아가기 </router-link>
      </div>

      <!-- 안내사항 -->
      <div class="help-text">
        <h3>도움말</h3>
        <ul>
          <li>이메일이 오지 않는다면 스팸함을 확인해주세요</li>
          <li>
            가입하신 이메일 주소가 기억나지 않는다면
            <router-link to="/find-id" class="help-link">아이디 찾기</router-link>를 이용해주세요
          </li>
          <li>그래도 문제가 해결되지 않는다면 고객센터로 문의해주세요</li>
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
import { ref } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';

const authStore = useAuthStore();

const email = ref('');
const isLoading = ref(false);
const message = ref('');
const messageType = ref('');

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const handleForgotPassword = async () => {
  if (!email.value) {
    message.value = '이메일을 입력하세요.';
    messageType.value = 'error';
    return;
  }

  if (!isValidEmail(email.value)) {
    message.value = '올바른 이메일 형식이 아닙니다.';
    messageType.value = 'error';
    return;
  }

  try {
    isLoading.value = true;
    const result = await authStore.forgotPassword(email.value);

    if (result.success) {
      message.value = '비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.';
      messageType.value = 'success';
      email.value = ''; // 성공 시 입력 필드 초기화
    } else {
      message.value = result.message || '등록되지 않은 이메일입니다.';
      messageType.value = 'error';
    }
  } catch (error) {
    message.value = error.message || '비밀번호 찾기 중 오류가 발생했습니다.';
    messageType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.forgot-password-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.forgot-password-card {
  position: relative;
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  width: 100%;
  border: 1px solid #ccc;
  max-width: 550px;
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 2rem;
}

.forgot-password-title {
  color: #333;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.forgot-password-subtitle {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 2rem;
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
  box-shadow: 0 0 0 3px var(--color-light-3);
}

.forgot-password-button {
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
  margin-bottom: 2rem;
}

.forgot-password-button:hover:not(:disabled) {
  box-shadow: 0 10px 30px var(--color-light-3);
}

.forgot-password-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.back-to-login {
  text-align: center;
  margin-bottom: 2rem;
}

.back-link {
  color: var(--color-main);
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
  color: var(--color-main);
  position: absolute;
  left: 0;
  font-weight: bold;
}

.help-link {
  color: var(--color-main);
  text-decoration: none;
  font-weight: 500;
}

.help-link:hover {
  text-decoration: underline;
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
</style>
