<template>
  <div class="section container signup-container">
    <div class="signup-card">
      <div class="signup-header">
        <h1 class="signup-title">회원가입</h1>
        <p class="signup-subtitle">새 계정을 만드세요</p>
      </div>

      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="form-group">
          <label for="username" class="form-label">이름</label>
          <input
            id="username"
            v-model="signupForm.username"
            type="text"
            class="form-input"
            placeholder="이름을 입력하세요"
            required
          />
        </div>
        <div class="form-group">
          <SmsVerification
            ref="smsVerificationRef"
            v-model="signupForm.phone"
            :disabled="smsVerificationStatus.isVerified"
            @verified="onSmsVerified"
            @error="onSmsError"
            @code-sent="onCodeSent"
          />
        </div>

        <div class="form-group">
          <label for="nickname" class="form-label">닉네임</label>
          <div class="input-with-button">
            <input
              id="nickname"
              v-model="signupForm.nickname"
              type="text"
              class="form-input"
              placeholder="닉네임을 입력하세요"
              :class="{
                'input-success': nicknameCheck.isChecked && nicknameCheck.isAvailable,
                'input-error': nicknameCheck.isChecked && !nicknameCheck.isAvailable,
              }"
              @input="onNicknameInput"
              required
            />
            <button
              type="button"
              class="check-button"
              @click="checkNicknameDuplicate"
              :disabled="!canCheckNickname || nicknameCheck.isChecking"
            >
              <span v-if="nicknameCheck.isChecking">확인중...</span>
              <span v-else>중복확인</span>
            </button>
          </div>
          <div
            v-if="nicknameCheck.message"
            :class="['check-message', nicknameCheck.isAvailable ? 'success' : 'error']"
          >
            {{ nicknameCheck.message }}
          </div>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">이메일</label>
          <div class="input-with-button">
            <input
              id="email"
              v-model="signupForm.email"
              type="email"
              class="form-input"
              placeholder="이메일을 입력하세요"
              :class="{
                'input-success': emailCheck.isChecked && emailCheck.isAvailable,
                'input-error': emailCheck.isChecked && !emailCheck.isAvailable,
              }"
              @input="onEmailInput"
              required
            />
            <button
              type="button"
              class="check-button"
              @click="checkEmailDuplicate"
              :disabled="!canCheckEmail || emailCheck.isChecking"
            >
              <span v-if="emailCheck.isChecking">확인중...</span>
              <span v-else>중복확인</span>
            </button>
          </div>
          <div
            v-if="emailCheck.message"
            :class="['check-message', emailCheck.isAvailable ? 'success' : 'error']"
          >
            {{ emailCheck.message }}
          </div>
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
          <div v-if="confirmPasswordMessage" class="check-message error">
            {{ confirmPasswordMessage }}
          </div>
        </div>

        <div class="form-group">
          <label for="birthDate" class="form-label">생년월일</label>
          <input
            id="birthDate"
            v-model="signupForm.birthDate"
            type="date"
            class="form-input"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">성별</label>
          <div class="radio-group">
            <label class="radio-label">
              <input
                v-model="signupForm.gender"
                type="radio"
                value="MALE"
                class="radio-input"
                required
              />
              <span class="radio-text">남성</span>
            </label>
            <label class="radio-label">
              <input
                v-model="signupForm.gender"
                type="radio"
                value="FEMALE"
                class="radio-input"
                required
              />
              <span class="radio-text">여성</span>
            </label>
          </div>
        </div>

        <div class="form-group">
          <label for="mainBusinessId" class="form-label">주요 업종</label>
          <select
            id="mainBusinessId"
            v-model="signupForm.mainBusinessId"
            class="form-select"
            required
          >
            <option value="" disabled>업종을 선택하세요</option>
            <option v-for="business in businessTypes" :key="business.id" :value="business.id">
              {{ business.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="profileImage" class="form-label">프로필 이미지 (선택)</label>
          <div class="file-upload-wrapper">
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              class="file-input"
              @change="handleProfileImageUpload"
            />
            <label for="profileImage" class="file-upload-button">
              <span v-if="signupForm.profileImage">이미지 변경</span>
              <span v-else>이미지 선택</span>
            </label>
          </div>
          <div v-if="signupForm.profileImage" class="image-preview">
            <img :src="signupForm.profileImage" alt="프로필 미리보기" class="preview-image" />
            <button type="button" @click="removeProfileImage" class="remove-image-btn">✕</button>
          </div>
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';
import SmsVerification from '@/components/signup/SmsVerification .vue';
import { validationAPI } from '@/api/validation';

const authStore = useAuthStore();
const router = useRouter();

// Refs
const smsVerificationRef = ref(null);
const isLoading = ref(false);
const message = ref('');
const messageType = ref('');

// SMS 인증 상태
const smsVerificationStatus = ref({
  isVerified: false,
  phone: '',
  codeSent: false,
});

// 중복 체크 상태
const nicknameCheck = ref({
  isChecked: false,
  isAvailable: false,
  isChecking: false,
  message: '',
});

const emailCheck = ref({
  isChecked: false,
  isAvailable: false,
  isChecking: false,
  message: '',
});

// 업종 목록 (실제로는 API에서 가져와야 함)
const businessTypes = ref([
  { id: 1, name: 'IT/소프트웨어' },
  { id: 2, name: '제조업' },
  { id: 3, name: '서비스업' },
  { id: 4, name: '유통/판매' },
  { id: 5, name: '교육' },
  { id: 6, name: '의료/헬스케어' },
  { id: 7, name: '금융' },
  { id: 8, name: '건설/부동산' },
  { id: 9, name: '미디어/광고' },
  { id: 10, name: '기타' },
]);

const signupForm = reactive({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  profileImage: '',
  birthDate: '',
  gender: '',
  mainBusinessId: '',
  agreeTerms: false,
  agreePrivacy: false,
  agreeMarketing: false,
});

// 유효성 검증 함수들
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPassword = (password) =>
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
const isValidNickname = (nickname) => nickname.length >= 2 && nickname.length <= 20;

// 중복 체크 가능 여부
const canCheckNickname = computed(() => {
  return (
    signupForm.nickname && isValidNickname(signupForm.nickname) && !nicknameCheck.value.isChecking
  );
});

const canCheckEmail = computed(() => {
  return signupForm.email && isValidEmail(signupForm.email) && !emailCheck.value.isChecking;
});

const isFormValid = computed(() => {
  return (
    signupForm.username &&
    signupForm.nickname &&
    signupForm.email &&
    signupForm.password &&
    signupForm.confirmPassword &&
    signupForm.birthDate &&
    signupForm.gender &&
    signupForm.mainBusinessId &&
    signupForm.agreeTerms &&
    signupForm.agreePrivacy &&
    signupForm.password === signupForm.confirmPassword &&
    smsVerificationStatus.value.isVerified && // SMS 인증 필수
    nicknameCheck.value.isChecked &&
    nicknameCheck.value.isAvailable && // 닉네임 중복체크 필수
    emailCheck.value.isChecked &&
    emailCheck.value.isAvailable // 이메일 중복체크 필수
  );
});

// 입력값 변경 시 중복체크 상태 초기화
const onNicknameInput = () => {
  nicknameCheck.value = {
    isChecked: false,
    isAvailable: false,
    isChecking: false,
    message: '',
  };
};

const onEmailInput = () => {
  emailCheck.value = {
    isChecked: false,
    isAvailable: false,
    isChecking: false,
    message: '',
  };
};

// 닉네임 중복 확인
const checkNicknameDuplicate = async () => {
  if (!canCheckNickname.value) return;

  try {
    nicknameCheck.value.isChecking = true;
    nicknameCheck.value.message = '';

    // API 호출 (실제 API 엔드포인트로 변경 필요)
    const result = await validationAPI.checkNickname(signupForm.nickname);

    nicknameCheck.value.isChecked = true;
    nicknameCheck.value.isAvailable = result.isAvailable;

    if (result.isAvailable) {
      nicknameCheck.value.message = '사용 가능한 닉네임입니다.';
    } else {
      nicknameCheck.value.message = '이미 사용중인 닉네임입니다.';
    }
  } catch (error) {
    console.error('닉네임 중복 확인 오류:', error);
    nicknameCheck.value.message = '중복 확인 중 오류가 발생했습니다.';
    nicknameCheck.value.isAvailable = false;
  } finally {
    nicknameCheck.value.isChecking = false;
  }
};

// 이메일 중복 확인
const checkEmailDuplicate = async () => {
  if (!canCheckEmail.value) return;

  try {
    emailCheck.value.isChecking = true;
    emailCheck.value.message = '';

    // API 호출 (실제 API 엔드포인트로 변경 필요)
    const result = await validationAPI.checkEmail(signupForm.email);

    emailCheck.value.isChecked = true;
    emailCheck.value.isAvailable = result.isAvailable;

    if (result.isAvailable) {
      emailCheck.value.message = '사용 가능한 이메일입니다.';
    } else {
      emailCheck.value.message = '이미 사용중인 이메일입니다.';
    }
  } catch (error) {
    console.error('이메일 중복 확인 오류:', error);
    emailCheck.value.message = '중복 확인 중 오류가 발생했습니다.';
    emailCheck.value.isAvailable = false;
  } finally {
    emailCheck.value.isChecking = false;
  }
};
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

const onSmsError = (error) => {
  message.value = error.message || '인증 중 오류가 발생했습니다.';
  messageType.value = 'error';

  console.error('SMS 인증 에러:', error);
};

const onCodeSent = (data) => {
  message.value = '인증번호가 발송되었습니다.';
  messageType.value = 'success';

  console.log('인증번호 발송 완료:', data);
};

const confirmPasswordMessage = computed(() => {
  if (!signupForm.confirmPassword) return '';
  return signupForm.password === signupForm.confirmPassword ? '' : '비밀번호가 일치하지 않습니다.';
});

// 프로필 이미지 업로드 처리
const handleProfileImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 파일 크기 체크 (5MB 제한)
  if (file.size > 5 * 1024 * 1024) {
    message.value = '파일 크기는 5MB 이하여야 합니다.';
    messageType.value = 'error';
    return;
  }

  // 이미지 파일 체크
  if (!file.type.startsWith('image/')) {
    message.value = '이미지 파일만 업로드 가능합니다.';
    messageType.value = 'error';
    return;
  }

  // 파일을 base64로 변환하여 미리보기 표시
  const reader = new FileReader();
  reader.onload = (e) => {
    signupForm.profileImage = e.target.result;
  };
  reader.readAsDataURL(file);
};

// 프로필 이미지 제거
const removeProfileImage = () => {
  signupForm.profileImage = '';
  const fileInput = document.getElementById('profileImage');
  if (fileInput) fileInput.value = '';
};

const handleSignup = async () => {
  // 기본 유효성 검증
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

  // SMS 인증 확인
  if (!smsVerificationStatus.value.isVerified) {
    message.value = '휴대폰 인증을 완료해주세요.';
    messageType.value = 'error';
    return;
  }

  // 닉네임 중복 체크 확인
  if (!nicknameCheck.value.isChecked || !nicknameCheck.value.isAvailable) {
    message.value = '닉네임 중복 확인을 완료해주세요.';
    messageType.value = 'error';
    return;
  }

  // 이메일 중복 체크 확인
  if (!emailCheck.value.isChecked || !emailCheck.value.isAvailable) {
    message.value = '이메일 중복 확인을 완료해주세요.';
    messageType.value = 'error';
    return;
  }

  try {
    isLoading.value = true;
    message.value = '';

    const result = await authStore.signup({
      username: signupForm.username,
      password: signupForm.password,
      nickname: signupForm.nickname,
      email: signupForm.email,
      phone: signupForm.phone, // 인증된 휴대폰 번호
      profileImage: signupForm.profileImage,
      birthDate: signupForm.birthDate,
      gender: signupForm.gender,
      mainBusinessId: parseInt(signupForm.mainBusinessId),
      agreeMarketing: signupForm.agreeMarketing,
      phoneVerified: true, // 인증 완료 표시
    });

    if (result.success) {
      message.value = '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.';
      messageType.value = 'success';

      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } else {
      message.value = result.message;
      messageType.value = 'error';
    }
  } catch (error) {
    console.error('회원가입 오류:', error);
    message.value = error.message || '회원가입 중 오류가 발생했습니다.';
    messageType.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

// 폼 초기화 (필요 시 사용)
const resetForm = () => {
  Object.assign(signupForm, {
    username: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    profileImage: '',
    birthDate: '',
    gender: '',
    mainBusinessId: '',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });

  // 중복 체크 상태 초기화
  nicknameCheck.value = {
    isChecked: false,
    isAvailable: false,
    isChecking: false,
    message: '',
  };

  emailCheck.value = {
    isChecked: false,
    isAvailable: false,
    isChecking: false,
    message: '',
  };

  smsVerificationStatus.value = {
    isVerified: false,
    phone: '',
    codeSent: false,
  };

  message.value = '';

  if (smsVerificationRef.value) {
    smsVerificationRef.value.reset();
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

.form-input,
.form-select {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--color-light-1);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--color-white);
}

.form-input:focus,
.form-select:focus {
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

/* 중복 확인 관련 스타일 */
.input-with-button {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
}

.input-with-button .form-input {
  flex: 1;
}

.check-button {
  padding: 1rem 1.2rem;
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 100px;
  height: fit-content;
}

.check-button:hover:not(:disabled) {
  box-shadow: 0 10px 30px var(--color-light-3);
}

.check-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.input-success {
  border-color: var(--color-main) !important;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1) !important;
}

.input-error {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
}

.check-message {
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-weight: 500;
}

.check-message.success {
  color: #28a745;
}

.check-message.error {
  color: #dc3545;
}
.radio-group {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1rem;
  color: #333;
}

.radio-input {
  margin-right: 0.5rem;
  width: 18px;
  height: 18px;
  accent-color: var(--color-main);
}

.radio-text {
  user-select: none;
}

/* 파일 업로드 */
.file-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-input {
  display: none;
}

.file-upload-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
}

.file-upload-button:hover {
  box-shadow: 0 10px 30px var(--color-light-3);
}

.image-preview {
  position: relative;
  margin-top: 1rem;
  display: inline-block;
}

.preview-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 2px solid var(--color-light-1);
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-image-btn:hover {
  background-color: #c82333;
}

/* SMS 인증 섹션 스타일 */
.sms-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid #e9ecef;
}

.sms-section-title {
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.sms-section-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  line-height: 1.4;
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
