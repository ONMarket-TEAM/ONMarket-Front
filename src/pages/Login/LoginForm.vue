<template>
  <div class="section container login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">로그인</h1>
        <p class="login-subtitle">계정에 로그인하세요</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">이메일</label>
          <input
            id="email"
            v-model="loginForm.email"
            type="email"
            class="form-input"
            placeholder="이메일을 입력하세요"
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">비밀번호</label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            class="form-input"
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>

        <div class="form-options">
          <label class="checkbox-label">
            <input v-model="loginForm.rememberMe" type="checkbox" class="checkbox" />
            <span class="checkmark"></span>
            로그인 상태 유지
          </label>
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="isLoading">로그인 중...</span>
          <span v-else>로그인</span>
        </button>
      </form>

      <div class="auth-links">
        <div class="signup-link">
          <p>
            계정이 없으신가요?
            <router-link to="/login/signup" class="signup-text">회원가입</router-link>
          </p>
        </div>

        <div class="find-links">
          <div class="find-id-link">
            <router-link to="/login/find-id" class="find-link">아이디 찾기</router-link>
          </div>
          <div class="find-id-link">
            <router-link to="/login/find-password" class="find-link"> 비밀번호 찾기 </router-link>
          </div>
        </div>
      </div>

      <!-- 로그인 성공/실패 메시지 -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const isLoading = ref(false);
const message = ref('');
const messageType = ref('');

const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false,
});

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const handleLogin = async () => {
  if (!loginForm.email || !loginForm.password) {
    message.value = '이메일과 비밀번호를 입력하세요.';
    messageType.value = 'error';
    return;
  }

  if (!isValidEmail(loginForm.email)) {
    message.value = '올바른 이메일 형식이 아닙니다.';
    messageType.value = 'error';
    return;
  }

  try {
    isLoading.value = true;
    const result = await authStore.login(loginForm.email, loginForm.password);

    if (result.success) {
      message.value = '로그인 성공!';
      messageType.value = 'success';
      const redirectTo = router.currentRoute.value.query.redirect || '/';
      await router.push(redirectTo);
    } else {
      message.value = result.message;
      messageType.value = 'error';
    }
  } catch (error) {
    message.value = error.message || '로그인 중 오류가 발생했습니다.';
    messageType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100%;
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.login-card {
  position: relative;
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  width: 100%;
  border: 1px solid #ccc;
  max-width: 550px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  color: #333;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #666;
  font-size: 0.95rem;
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
  box-shadow: 0 0 0 3px var(--color-light-3);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
}

.checkbox {
  margin-right: 0.5rem;
}

.forgot-password {
  color: var(--color-main);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: var(--color-main);
  text-decoration: underline;
}

.login-button {
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
  margin-bottom: 1.5rem;
}

.login-button:hover:not(:disabled) {
  box-shadow: 0 10px 30px var(--color-light-3);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.auth-links {
  text-align: center;
}

.signup-link {
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.signup-text {
  color: var(--color-main);
  text-decoration: none;
  font-weight: 600;
}

.signup-text:hover {
  text-decoration: underline;
}

.find-links {
  justify-content: center;
  margin-top: 1rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.find-id-link {
  margin-bottom: 1rem;
}

.find-link {
  color: #999;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.find-link:hover {
  color: var(--color-main);
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

