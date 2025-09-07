<template>
  <div class="step-content">
    <div class="step-header">
      <h1 class="step-title">기본정보 입력</h1>
      <p class="step-subtitle">회원가입을 위한 기본 정보를 입력해주세요</p>
    </div>

    <form @submit.prevent="handleNext" class="step-form" novalidate>
      <div class="form-group">
        <label for="username" class="form-label">이름</label>
        <div class="form-control">
          <input
            id="username"
            v-model="signupForm.username"
            type="text"
            class="form-input"
            :class="{ readonly: isSocialSignup }"
            placeholder="이름을 입력하세요"
            :readonly="isSocialSignup"
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
            :disabled="smsVerificationStatus.isVerified || isSocialSignup"
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
              :class="{
                'input-success': emailCheck.isChecked && emailCheck.isAvailable,
                'input-error': emailCheck.isChecked && !emailCheck.isAvailable,
                readonly: isSocialSignup,
              }"
              placeholder="이메일을 입력하세요"
              :readonly="isSocialSignup"
              @input="onEmailInput"
              required
            />
            <button
              type="button"
              class="check-button"
              @click="checkEmailDuplicate"
              :disabled="!canCheckEmail || emailCheck.isChecking || isSocialSignup"
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
            :class="{ readonly: isSocialSignup }"
            placeholder="비밀번호를 입력하세요"
            :readonly="isSocialSignup"
            :required="!isSocialSignup"
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
            :class="{ readonly: isSocialSignup }"
            placeholder="비밀번호를 다시 입력하세요"
            :readonly="isSocialSignup"
            :required="!isSocialSignup"
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
            :class="{ readonly: isSocialSignup }"
            min="1900-01-01"
            :max="new Date().toISOString().split('T')[0]"
            :readonly="isSocialSignup"
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
                :disabled="isSocialSignup"
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
                :disabled="isSocialSignup"
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

      <div class="button-wrapper">
        <button type="submit" class="next-button" :class="{ active: isFormValid }">
          회원가입 완료
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SmsVerification from '@/components/signup/SmsVerification.vue';
import { validationAPI } from '@/api/validation';
import { useToastStore } from '@/stores/useToastStore';
import { s3API } from '@/api/s3';
import { snsAPI } from '@/api/social';

const router = useRouter();
const toastStore = useToastStore();

const props = defineProps({
  userData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['next', 'complete']);

// 소셜 회원가입 관련
const isSocialSignup = ref(false);
const pendingMemberId = ref(null);

// 폼 유효성 검사 (소셜 회원가입과 일반 회원가입 구분)
const isFormValid = computed(() => {
  const baseValidation =
    signupForm.username.trim() &&
    signupForm.nickname.trim() &&
    isValidNickname(signupForm.nickname) &&
    nicknameCheck.value.isChecked &&
    nicknameCheck.value.isAvailable &&
    signupForm.birthDate &&
    signupForm.gender;

  if (isSocialSignup.value) {
    // 소셜 회원가입: 이메일 중복 체크와 SMS 인증 제외
    return baseValidation;
  } else {
    // 일반 회원가입: 모든 검증 필요
    return (
      baseValidation &&
      signupForm.email.trim() &&
      isValidEmail(signupForm.email) &&
      emailCheck.value.isChecked &&
      emailCheck.value.isAvailable &&
      smsVerificationStatus.value.isVerified &&
      signupForm.password &&
      isValidPassword(signupForm.password) &&
      signupForm.password === signupForm.confirmPassword
    );
  }
});

const smsVerificationRef = ref(null);

const smsVerificationStatus = ref({
  isVerified: false,
  phone: '',
  codeSent: false,
});

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
  profileImageKey: '',
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

    // 소셜 회원가입의 경우 전용 API 사용
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('memberId');

    const result = await validationAPI.checkNickname(signupForm.nickname, memberId);
    nicknameCheck.value.isChecked = true;
    nicknameCheck.value.isAvailable = result.isAvailable;

    if (result.isAvailable) {
      nicknameCheck.value.message = '사용 가능한 닉네임입니다.';
    } else {
      nicknameCheck.value.message = '이미 사용중인 닉네임입니다.';
    }
  } catch (error) {
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
const handleProfileImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    toastStore.error('파일 크기는 5MB 이하여야 합니다.');
    event.target.value = '';
    return;
  }

  if (!file.type.startsWith('image/')) {
    toastStore.error('이미지 파일만 업로드 가능합니다.');
    event.target.value = '';
    return;
  }

  try {
    const presign = await s3API.getPresignedPutUrl('user-uploads', file.name, file.type);
    await s3API.uploadToS3(presign.uploadUrl, file, file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      signupForm.profileImage = e.target.result;
    };
    reader.readAsDataURL(file);

    signupForm.profileImageKey = presign.key;
    toastStore.success('프로필 이미지가 업로드되었습니다.');
  } catch (error) {
    toastStore.error('이미지 업로드 중 오류가 발생했습니다.');
    event.target.value = '';
  }
};

const removeProfileImage = () => {
  signupForm.profileImage = '';
  signupForm.profileImageKey = '';
  const fileInput = document.getElementById('profileImage');
  if (fileInput) fileInput.value = '';
};

// 소셜 회원가입 완료
const completeSocialSignup = async () => {
  try {
    const result = await snsAPI.completeSocialSignup(pendingMemberId.value, {
      nickname: signupForm.nickname,
      profileImageKey: signupForm.profileImageKey,
    });

    if (result.success) {
      // 토큰 저장
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('refreshToken', result.data.refreshToken);

      toastStore.success(result.message);
      router.push('/');
    } else {
      toastStore.error(result.message);
    }
  } catch (error) {
    toastStore.error('회원가입 완료 중 오류가 발생했습니다.');
  }
};
// 폼 제출 처리
const handleNext = () => {
  const validationErrors = [];

  if (!signupForm.username.trim()) {
    validationErrors.push('이름을 입력해주세요.');
  }

  if (!signupForm.nickname.trim()) {
    validationErrors.push('닉네임을 입력해주세요.');
  } else if (!isValidNickname(signupForm.nickname)) {
    validationErrors.push('닉네임은 2-20자 사이여야 합니다.');
  } else if (!nicknameCheck.value.isChecked) {
    validationErrors.push('닉네임 중복확인을 해주세요.');
  } else if (!nicknameCheck.value.isAvailable) {
    validationErrors.push('사용할 수 없는 닉네임입니다. 다른 닉네임을 선택해주세요.');
  }

  if (!signupForm.birthDate) {
    validationErrors.push('생년월일을 선택해주세요.');
  }

  if (!signupForm.gender) {
    validationErrors.push('성별을 선택해주세요.');
  }

  // 소셜 회원가입과 일반 회원가입 구분 검증
  if (isSocialSignup.value) {
    // 소셜 회원가입: 닉네임만 체크하면 됨
    if (validationErrors.length > 0) {
      toastStore.error(validationErrors[0]);
      return;
    }
    completeSocialSignup();
  } else {
    // 일반 회원가입: 모든 필드 검증
    if (!signupForm.email.trim()) {
      validationErrors.push('이메일을 입력해주세요.');
    } else if (!isValidEmail(signupForm.email)) {
      validationErrors.push('올바른 이메일 형식으로 입력해주세요.');
    } else if (!emailCheck.value.isChecked) {
      validationErrors.push('이메일 중복확인을 해주세요.');
    } else if (!emailCheck.value.isAvailable) {
      validationErrors.push('사용할 수 없는 이메일입니다. 다른 이메일을 입력해주세요.');
    }

    if (!smsVerificationStatus.value.isVerified) {
      validationErrors.push('휴대폰 번호 인증을 완료해주세요.');
    }

    if (!signupForm.password) {
      validationErrors.push('비밀번호를 입력해주세요.');
    } else if (!isValidPassword(signupForm.password)) {
      validationErrors.push('비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.');
    }

    if (!signupForm.confirmPassword) {
      validationErrors.push('비밀번호 확인을 입력해주세요.');
    } else if (signupForm.password !== signupForm.confirmPassword) {
      validationErrors.push('비밀번호가 일치하지 않습니다.');
    }

    if (validationErrors.length > 0) {
      toastStore.error(validationErrors[0]);
      return;
    }
    // 일반 회원가입 완료 처리
    emit('complete', {
      ...signupForm,
      phoneVerified: smsVerificationStatus.value.isVerified,
      profileImage: undefined,
      profileImageKey: signupForm.profileImageKey,
    });
  }
};

// 소셜 회원 정보 로드
const loadSocialMemberInfo = async (memberId) => {
  try {
    const result = await snsAPI.getPendingMemberInfo(memberId);

    if (result.success) {
      const memberData = result.data;

      // 폼에 소셜 정보 미리 채우기
      signupForm.username = memberData.username || '';
      signupForm.nickname = memberData.nickname || '';
      signupForm.email = memberData.email || '';
      signupForm.phone = memberData.phone || '';
      signupForm.birthDate = memberData.birthDate || '';
      signupForm.gender = memberData.gender || '';

      // 소셜 로그인 플래그 설정
      isSocialSignup.value = true;
      pendingMemberId.value = memberId;

      // 소셜 회원가입의 경우 이메일 중복 체크 필요 없음
      if (memberData.email) {
        emailCheck.value = {
          isChecked: true,
          isAvailable: true,
          isChecking: false,
        };
      }

      // 소셜 회원가입의 경우 휴대폰 번호 인증 필요 없음
      if (memberData.phone) {
        smsVerificationStatus.value = {
          isVerified: true,
          phone: memberData.phone,
          codeSent: true,
        };
      }
    } else {
      toastStore.error(result.message);
      router.push('/login');
    }
  } catch (error) {
    toastStore.error('회원 정보 조회 중 오류가 발생했습니다.');
    router.push('/login');
  }
};

// 컴포넌트 마운트
onMounted(async () => {
  // URL에서 memberId 확인
  const urlParams = new URLSearchParams(window.location.search);
  const memberId = urlParams.get('memberId');

  if (memberId) {
    // 소셜 로그인 회원 정보 로드
    await loadSocialMemberInfo(memberId);
  } else if (props.userData) {
    // 일반 회원가입에서 이전 단계 데이터 복원 (소셜 로그인 아닌 경우)
    Object.assign(signupForm, props.userData);

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
.next-button.active {
  background-color: var(--color-sub);
}

.readonly {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

.readonly-hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.social-info-display {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  text-align: center;
}

.social-profile-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 8px;
}

.social-email {
  font-weight: 500;
  color: #333;
}

.radio-input:disabled + .radio-text {
  color: #999;
  cursor: not-allowed;
}
</style>

