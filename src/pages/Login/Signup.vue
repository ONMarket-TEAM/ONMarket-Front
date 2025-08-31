<template>
  <div class="section container signup-container">
    <div class="signup-card">
      <div class="signup-header">
        <h1 class="signup-title">회원가입</h1>
        <p class="signup-subtitle">새 계정을 만드세요</p>
      </div>

      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="form-group">
          <label for="name" class="form-label">이름</label>
          <input
            id="name"
            v-model="signupForm.name"
            type="text"
            class="form-input"
            placeholder="이름을 입력하세요"
            required
          />
        </div>

        <div class="form-group">
          <label for="email" class="form-label">이메일</label>
          <input
            id="email"
            v-model="signupForm.email"
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
            v-model="signupForm.password"
            type="password"
            class="form-input"
            placeholder="비밀번호를 입력하세요"
            required
          />
          <div class="password-hint">최소 8자 이상, 영문, 숫자, 특수문자 포함</div>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">비밀번호 확인</label>
          <input
            id="confirmPassword"
            v-model="signupForm.confirmPassword"
            type="password"
            class="form-input"
            placeholder="비밀번호를 다시 입력하세요"
            required
          />
        </div>

        <div class="form-group">
          <label for="phone" class="form-label">전화번호 (선택)</label>
          <input
            id="phone"
            v-model="signupForm.phone"
            type="tel"
            class="form-input"
            placeholder="전화번호를 입력하세요"
          />
        </div>

        <div class="terms-group">
          <label class="checkbox-label">
            <input v-model="signupForm.agreeTerms" type="checkbox" class="checkbox" required />
            <span class="checkmark"></span>
            <span class="terms-text">
              <a href="#" class="terms-link">이용약관</a>에 동의합니다
            </span>
          </label>

          <label class="checkbox-label">
            <input v-model="signupForm.agreePrivacy" type="checkbox" class="checkbox" required />
            <span class="checkmark"></span>
            <span class="terms-text">
              <a href="#" class="terms-link">개인정보 처리방침</a>에 동의합니다
            </span>
          </label>

          <label class="checkbox-label">
            <input v-model="signupForm.agreeMarketing" type="checkbox" class="checkbox" />
            <span class="checkmark"></span>
            <span class="terms-text">마케팅 정보 수신에 동의합니다 (선택)</span>
          </label>
        </div>

        <button type="submit" class="signup-button" :disabled="isLoading || !isFormValid">
          <span v-if="isLoading">가입 중...</span>
          <span v-else>회원가입</span>
        </button>
      </form>

      <div class="login-link">
        <p>
          이미 계정이 있으신가요?
          <router-link to="/login" class="login-text">로그인</router-link>
        </p>
      </div>

      <!-- 회원가입 성공/실패 메시지 -->
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const isLoading = ref(false);
const message = ref('');
const messageType = ref('');

const signupForm = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketing: false,
});

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) =>
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

const isFormValid = computed(() => {
  return (
    signupForm.name &&
    signupForm.email &&
    signupForm.password &&
    signupForm.confirmPassword &&
    signupForm.agreeTerms &&
    signupForm.agreePrivacy &&
    signupForm.password === signupForm.confirmPassword
  );
});

const handleSignup = async () => {
  // 유효성 검증
  if (!isValidEmail(signupForm.email)) {
    message.value = '올바른 이메일 형식이 아닙니다.';
    messageType.value = 'error';
    return;
  }

  if (!isValidPassword(signupForm.password)) {
    message.value = '비밀번호는 최소 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.';
    messageType.value = 'error';
    return;
  }

  if (signupForm.password !== signupForm.confirmPassword) {
    message.value = '비밀번호가 일치하지 않습니다.';
    messageType.value = 'error';
    return;
  }

  try {
    isLoading.value = true;
    const result = await authStore.signup({
      name: signupForm.name,
      email: signupForm.email,
      password: signupForm.password,
      phone: signupForm.phone,
      agreeMarketing: signupForm.agreeMarketing,
    });

    if (result.success) {
      message.value = '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.';
      messageType.value = 'success';
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else {
      message.value = result.message;
      messageType.value = 'error';
    }
  } catch (error) {
    message.value = error.message || '회원가입 중 오류가 발생했습니다.';
    messageType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.signup-card {
  position: relative;
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  width: 100%;
  border: 1px solid #ccc;
  max-width: 550px;
}

.signup-header {
  text-align: center;
  margin-bottom: 2rem;
}

.signup-title {
  color: #333;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.signup-subtitle {
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

.password-hint {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.3rem;
}

.terms-group {
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.8rem;
}

.checkbox-label:last-child {
  margin-bottom: 0;
}

.checkbox {
  margin-right: 0.8rem;
  margin-top: 0.1rem;
}

.terms-text {
  line-height: 1.4;
}

.terms-link {
  color: var(--color-main);
  text-decoration: none;
  font-weight: 600;
}

.terms-link:hover {
  text-decoration: underline;
}

.signup-button {
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

.signup-button:hover:not(:disabled) {
  box-shadow: 0 10px 30px var(--color-light-3);
}

.signup-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.login-text {
  color: var(--color-main);
  text-decoration: none;
  font-weight: 600;
}

.login-text:hover {
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
