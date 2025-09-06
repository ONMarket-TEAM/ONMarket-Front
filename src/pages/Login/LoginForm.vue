<template>
  <div class="section container login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">로그인</h1>
        <p class="login-subtitle">계정에 로그인하세요</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form" novalidate>
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';
import { businessAPI } from '@/api/business';
import { useToastStore } from '@/stores/useToastStore';

const authStore = useAuthStore();
const toastStore = useToastStore();
const router = useRouter();

const isLoading = ref(false);

const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false,
});

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const handleLogin = async () => {
  // 상세한 검증 및 메시지 제공
  const validationErrors = [];

  // 1. 이메일 검증
  if (!loginForm.email.trim()) {
    validationErrors.push('이메일을 입력해주세요.');
  } else if (!isValidEmail(loginForm.email)) {
    validationErrors.push('올바른 이메일 형식으로 입력해주세요.');
  }

  // 2. 비밀번호 검증
  if (!loginForm.password) {
    validationErrors.push('비밀번호를 입력해주세요.');
  } else if (loginForm.password.length < 6) {
    validationErrors.push('비밀번호는 6자 이상이어야 합니다.');
  }

  // 검증 실패 시 첫 번째 오류 메시지 표시
  if (validationErrors.length > 0) {
    toastStore.error(validationErrors[0]);
    return;
  }

  try {
    isLoading.value = true;
    const result = await authStore.login(loginForm.email, loginForm.password, loginForm.rememberMe);
    if (result.success) {
      // 로그인 성공 직후 사업장 조회
      try {
        const businessResult = await businessAPI.getMyBusinessList();

        if (
          !businessResult.success &&
          businessResult.message.includes('사업장을 찾을 수 없습니다')
        ) {
          // 신규 사용자 → 사업장 등록 페이지로
          toastStore.info('사업장 정보를 등록해주세요.');
          router.push('/business/register');
        } else {
          // 기존 사용자 → 메인 페이지
          const redirectTo = router.currentRoute.value.query.redirect || '/';
          await router.push(redirectTo);
        }
      } catch (businessError) {
        console.error('사업장 조회 오류:', businessError);
        toastStore.error('사업장 정보를 불러오는 중 오류가 발생했습니다.');
        // 오류가 있어도 메인 페이지로 이동
        const redirectTo = router.currentRoute.value.query.redirect || '/';
        await router.push(redirectTo);
      }
    } else {
      // 로그인 실패 시 구체적인 오류 메시지
      if (result.message) {
        if (result.message.includes('이메일')) {
          toastStore.error('등록되지 않은 이메일입니다.');
        } else if (result.message.includes('비밀번호')) {
          toastStore.error('비밀번호가 일치하지 않습니다.');
        } else if (result.message.includes('계정')) {
          toastStore.error('계정이 비활성화되어 있습니다. 고객센터에 문의해주세요.');
        } else if (result.message.includes('잠금')) {
          toastStore.error('계정이 잠겨있습니다. 잠시 후 다시 시도해주세요.');
        } else {
          toastStore.error(result.message);
        }
      } else {
        toastStore.error('이메일 또는 비밀번호를 확인해주세요.');
      }
    }
  } catch (error) {
    console.error('로그인 오류:', error);

    // 네트워크 오류 등 구체적인 오류 유형별 메시지
    if (error.message && error.message.includes('Network')) {
      toastStore.error('네트워크 연결을 확인해주세요.');
    } else if (error.message && error.message.includes('timeout')) {
      toastStore.error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
    } else if (error.response && error.response.status === 429) {
      toastStore.error('너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.');
    } else if (error.response && error.response.status >= 500) {
      toastStore.error('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      toastStore.error('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
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

/* 체크박스 공통 스타일 */
.checkbox {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  background: white;
  transition: all 0.3s ease;
  position: relative;
  flex-shrink: 0;
  margin-right: 0.5rem;
}

.checkbox:checked + .checkmark {
  background: var(--color-main);
  border-color: var(--color-main);
}

.checkbox:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
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
</style>

