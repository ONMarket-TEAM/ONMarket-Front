<template>
  <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <!-- 모달 헤더 -->
      <div class="modal-header">
        <button @click="closeModal" class="close-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <!-- 로그인 폼 -->
      <div class="login-form">
        <!-- 인스타그램 로고 -->
        <div class="logo-container">
          <img :src="instagramLogo" alt="Instagram Logo" class="instagram-logo" />
        </div>

        <!-- 로그인 입력 필드 -->
        <form @submit.prevent="handleLogin" class="login-inputs">
          <div class="input-group">
            <input
              v-model="loginForm.username"
              type="text"
              placeholder=" "
              class="form-input"
              id="username"
              :class="{ 'has-error': errors.username }"
            />
            <label for="username" class="form-label">전화번호, 사용자 이름 또는 이메일</label>
            <div v-if="errors.username" class="error-message">{{ errors.username }}</div>
          </div>

          <div class="input-group">
            <input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder=" "
              class="form-input"
              id="password"
              :class="{ 'has-error': errors.password }"
            />
            <label for="password" class="form-label">비밀번호</label>
            <button
              type="button"
              @click="togglePassword"
              class="password-toggle"
              v-if="loginForm.password"
            >
              {{ showPassword ? '숨기기' : '보기' }}
            </button>
            <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
          </div>

          <!-- 로그인 버튼 -->
          <button
            type="submit"
            class="login-button"
            :disabled="!isFormValid || isLoading"
            :class="{ loading: isLoading }"
          >
            <span v-if="!isLoading">로그인</span>
            <div v-else class="loading-spinner"></div>
          </button>

          <!-- 또는 구분선 -->
          <div class="divider">
            <div class="divider-line"></div>
            <span class="divider-text">또는</span>
            <div class="divider-line"></div>
          </div>

          <!-- 비밀번호 찾기 -->
          <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
            비밀번호를 잊으셨나요?
          </a>
        </form>

        <!-- 회원가입 링크 -->
        <div class="signup-link">
          계정이 없으신가요?
          <a href="#" @click.prevent="handleSignup">가입하기</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useToastStore } from '@/stores/useToastStore';
import { useSnsStore } from '@/stores/useSnsStore';
import instagramLogo from '@/assets/Instagram_logo.png';

const props = defineProps({
  visible: { type: Boolean, default: false },
  closeOnOverlayClick: { type: Boolean, default: true },
});

const emit = defineEmits(['close', 'login-success', 'forgot-password', 'signup']);

const loginForm = ref({
  username: '',
  password: '',
});
const showPassword = ref(false);
const isLoading = ref(false);
const errors = ref({});
const toastStore = useToastStore();
const snsStore = useSnsStore();

const isFormValid = computed(() => {
  return loginForm.value.username.length > 0 && loginForm.value.password.length > 5;
});

function closeModal() {
  emit('close');
  resetForm();
}

function handleOverlayClick() {
  if (props.closeOnOverlayClick) {
    closeModal();
  }
}

function togglePassword() {
  showPassword.value = !showPassword.value;
}

function validateForm() {
  errors.value = {};
  if (!loginForm.value.username) {
    errors.value.username = '사용자 이름을 입력해주세요.';
  }
  if (!loginForm.value.password) {
    errors.value.password = '비밀번호를 입력해주세요.';
  } else if (loginForm.value.password.length < 6) {
    errors.value.password = '비밀번호는 6자 이상이어야 합니다.';
  }
  return Object.keys(errors.value).length === 0;
}

async function handleLogin() {
  if (!validateForm()) return;

  isLoading.value = true;
  errors.value = {};

  try {
    const res = await snsStore.loginInstagram({
      username: loginForm.value.username,
      password: loginForm.value.password,
    });
    toastStore.success(res.message || 'Instagram 로그인 성공하였습니다.');
  } catch (error) {
    toastStore.error(error.message || 'Instagram 로그인 실패하였습니다.');
  } finally {
    isLoading.value = false;
    closeModal();
  }
}
function handleForgotPassword() {
  emit('forgot-password');
  window.location.href = 'https://www.instagram.com/accounts/password/reset/';
}

function handleSignup() {
  emit('signup');
  window.location.href = 'https://www.instagram.com/accounts/emailsignup/';
}

function resetForm() {
  loginForm.value = { username: '', password: '' };
  showPassword.value = false;
  isLoading.value = false;
  errors.value = {};
}

watch(
  () => props.visible,
  (newVal) => {
    document.body.style.overflow = newVal ? 'hidden' : '';
  }
);

onBeforeUnmount(() => {
  document.body.style.overflow = '';
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: flex-end;
  padding: 16px 16px 0;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #8e8e8e;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f5f5f5;
  color: #262626;
}

.login-form {
  padding: 0px 40px 40px;
}

.logo-container {
  text-align: center;
  margin-bottom: 32px;
}

.instagram-logo {
  width: 200px;
  height: auto;
}

.login-inputs {
  margin-bottom: 12px;
}

.input-group {
  position: relative;
  margin-bottom: 16px;
}

.form-input {
  width: 100%;
  padding: 14px 12px 6px;
  border: 1px solid #dbdbdb;
  border-radius: 4px;
  background: #fafafa;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #a8a8a8;
  background: white;
}

.form-input.has-error {
  border-color: #ed4956;
}

.form-label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #8e8e8e;
  font-size: 14px;
  pointer-events: none;
  transition: all 0.2s ease;
  background: transparent;
  padding: 0 4px;
}

.form-input:focus + .form-label,
.form-input:not(:placeholder-shown) + .form-label {
  top: 8px;
  font-size: 10px;
  color: #8e8e8e;
  transform: translateY(0);
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #262626;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.error-message {
  color: #ed4956;
  font-size: 12px;
  margin-top: 4px;
}

.login-button {
  width: 100%;
  background: #0095f6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.login-button:hover:not(:disabled) {
  background: #1877f2;
}

.login-button:disabled {
  background: #b2dffc;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #dbdbdb;
}

.divider-text {
  margin: 0 16px;
  color: #8e8e8e;
  font-size: 13px;
  font-weight: 600;
}

.facebook-login {
  width: 100%;
  background: none;
  border: none;
  color: #385185;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  transition: opacity 0.2s ease;
}

.facebook-login:hover {
  opacity: 0.7;
}

.facebook-icon {
  margin-right: 8px;
}

.forgot-password {
  color: #00376b;
  font-size: 12px;
  text-decoration: none;
  text-align: center;
  display: block;
}

.forgot-password:hover {
  text-decoration: underline;
}

.signup-link {
  text-align: center;
  padding: 24px 0;
  font-size: 14px;
  color: #262626;
}

.signup-link a {
  color: #0095f6;
  font-weight: 600;
  text-decoration: none;
}

.signup-link a:hover {
  text-decoration: underline;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
