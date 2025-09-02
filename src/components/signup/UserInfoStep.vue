<template>
  <div class="step-content">
    <div class="step-header">
      <h1 class="step-title">기본정보 입력</h1>
      <p class="step-subtitle">회원가입을 위한 기본 정보를 입력해주세요</p>
    </div>

    <form @submit.prevent="handleNext" class="step-form">
      <div class="form-group">
        <label for="username" class="form-label">이름</label>
        <div class="form-control">
          <input
            id="username"
            v-model="signupForm.username"
            type="text"
            class="form-input"
            placeholder="이름을 입력하세요"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">휴대폰 번호</label>
        <div class="form-control">
          <SmsVerification
            ref="smsVerificationRef"
            v-model="signupForm.phone"
            :disabled="smsVerificationStatus.isVerified"
            @verified="onSmsVerified"
            @error="onSmsError"
            @code-sent="onCodeSent"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="nickname" class="form-label">닉네임</label>
        <div class="form-control">
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
      </div>

      <div class="form-group">
        <label for="email" class="form-label">이메일</label>
        <div class="form-control">
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
      </div>

      <div class="form-group">
        <label for="password" class="form-label">비밀번호</label>
        <div class="form-control">
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
      </div>

      <div class="form-group">
        <label for="confirmPassword" class="form-label">비밀번호 확인</label>
        <div class="form-control">
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
      </div>

      <div class="form-group">
        <label for="birthDate" class="form-label">생년월일</label>
        <div class="form-control">
          <input
            id="birthDate"
            v-model="signupForm.birthDate"
            type="date"
            class="form-input"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">성별</label>
        <div class="form-control">
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
      </div>

      <div class="form-group">
        <label for="profileImage" class="form-label">프로필 이미지</label>
        <div class="form-control">
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
            <span class="file-hint">(선택사항)</span>
          </div>
          <div v-if="signupForm.profileImage" class="image-preview">
            <img :src="signupForm.profileImage" alt="프로필 미리보기" class="preview-image" />
            <button type="button" @click="removeProfileImage" class="remove-image-btn">✕</button>
          </div>
        </div>
      </div>

      <!-- 다음 단계 버튼 -->
      <div class="button-wrapper">
        <button type="submit" class="next-button" :disabled="!isFormValid">회원가입 완료</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import SmsVerification from '@/components/signup/SmsVerification.vue';
import { validationAPI } from '@/api/validation';
import { useToastStore } from '@/stores/useToastStore';
const toastStore = useToastStore();

const props = defineProps({
  userData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['next', 'complete']);

// Refs
const smsVerificationRef = ref(null);

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
    isValidPassword(signupForm.password) &&
    signupForm.password === signupForm.confirmPassword &&
    smsVerificationStatus.value.isVerified &&
    nicknameCheck.value.isChecked &&
    nicknameCheck.value.isAvailable &&
    emailCheck.value.isChecked &&
    emailCheck.value.isAvailable
  );
});

const confirmPasswordMessage = computed(() => {
  if (!signupForm.confirmPassword) return '';
  return signupForm.password === signupForm.confirmPassword ? '' : '비밀번호가 일치하지 않습니다.';
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

// SMS 인증 관련
const onSmsVerified = (data) => {
  smsVerificationStatus.value = {
    isVerified: true,
    phone: data.phone,
    codeSent: true,
  };
  signupForm.phone = data.phone;
};

const onSmsError = (error) => {
  toastStore.error('인증 중 오류가 발생했습니다.');
};

const onCodeSent = () => {
  toastStore.success('인증번호가 발송되었습니다.');
};

// 프로필 이미지 업로드 처리
const handleProfileImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    toastStore.error('파일 크기는 5MB 이하여야 합니다.');
    return;
  }

  if (!file.type.startsWith('image/')) {
    toastStore.error('이미지 파일만 업로드 가능합니다.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    signupForm.profileImage = e.target.result;
  };
  reader.readAsDataURL(file);
};

const removeProfileImage = () => {
  signupForm.profileImage = '';
  const fileInput = document.getElementById('profileImage');
  if (fileInput) fileInput.value = '';
};

// 다음 단계로
const handleNext = () => {
  if (!isFormValid.value) {
    toastStore.error('모든 필수 항목을 입력해주세요.');
    return;
  }

  // 부모 컴포넌트로 데이터 전달
  emit('complete', {
    ...signupForm,
    phoneVerified: smsVerificationStatus.value.isVerified,
  });
};

// 컴포넌트 마운트 시 기존 데이터 복원
onMounted(() => {
  if (props.userData) {
    Object.assign(signupForm, props.userData);

    // SMS 인증 상태도 복원
    if (props.userData.phoneVerified) {
      smsVerificationStatus.value = {
        isVerified: true,
        phone: props.userData.phone,
        codeSent: true,
      };
    }
  }
});
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

/* 입력창과 버튼 조합 */
.input-with-button {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
}

.input-with-button .form-input {
  flex: 1;
}

/* 중복 확인 버튼 */
.check-button {
  padding: 0.9rem 1.2rem;
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
  flex-shrink: 0;
}

.check-button:hover:not(:disabled) {
  box-shadow: 0 10px 30px var(--color-light-3);
  transform: translateY(-2px);
}

.check-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 입력 상태 */
.input-success {
  border-color: #28a745 !important;
  box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1) !important;
}

.input-error {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
}

/* 메시지 & 힌트 */
.check-message,
.password-hint {
  font-size: 0.85rem;
  font-weight: 500;
}

.check-message.success {
  color: #28a745;
}

.check-message.error {
  color: #dc3545;
}

.password-hint {
  color: #999;
}

/* 라디오 버튼 그룹 */
.radio-group {
  display: flex;
  gap: 2rem;
  padding-top: 0.5rem;
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
  padding: 0.9rem 1.5rem;
  background-color: var(--color-main);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
}

.file-upload-button:hover {
  box-shadow: 0 10px 30px var(--color-light-3);
  transform: translateY(-2px);
}

.file-hint {
  font-size: 0.85rem;
  color: #999;
}

/* 이미지 미리보기 */
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.remove-image-btn:hover {
  background-color: #c82333;
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

.next-button {
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

.next-button:hover:not(:disabled) {
  box-shadow: 0 15px 35px var(--color-light-3);
  transform: translateY(-2px);
}
</style>
