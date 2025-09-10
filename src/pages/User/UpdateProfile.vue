<template>
  <div class="container section">
    <h1>내 정보 수정하기</h1>
    <hr />

    <!-- 회원정보 변경 -->
    <div class="edit-profile" v-if="meLoaded">
      <div class="form-wrap">
        <!-- 닉네임 -->
        <label class="label">닉네임 변경</label>
        <input
          type="text"
          class="input"
          v-model.trim="nickname"
          :placeholder="me?.nickname ? me.nickname : '원하는 닉네임을 입력해주세요.'"
        />

        <!-- 새 비밀번호 -->
        <div>
          <label class="label">변경할 비밀번호</label>
          <div class="input-pwd">
            <input
              class="input"
              :type="showPassword ? 'text' : 'password'"
              v-model="newPassword"
              placeholder="변경할 비밀번호를 입력해주세요."
              @input="
                validatePassword();
                validatePasswordConfirm();
              "
            />
            <button type="button" class="icon-btn" @click="togglePassword">
              <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
            </button>
          </div>
          <small class="text-danger hint" v-if="passwordError">{{ passwordError }}</small>
        </div>

        <!-- 새 비밀번호 확인 -->
        <div>
          <label class="label mt-4">변경할 비밀번호 확인</label>
          <div class="input-pwd">
            <input
              class="input"
              :type="showPasswordConfirm ? 'text' : 'password'"
              v-model="confirmNewPassword"
              placeholder="변경할 비밀번호를 다시 한 번 입력해주세요."
              @input="validatePasswordConfirm()"
            />
            <button type="button" class="icon-btn" @click="togglePasswordConfirm">
              <i :class="showPasswordConfirm ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
            </button>
          </div>
          <small class="text-danger hint" v-if="passwordConfirmError">
            {{ passwordConfirmError }}
          </small>
        </div>

        <!-- 버튼 -->
        <div class="actions">
          <button class="btn primary" :disabled="submitDisabled || loading" @click="onSubmit">
            {{ loading ? '수정 중...' : '회원정보 수정하기' }}
          </button>
          <button class="btn ghost" @click="goBack">취소하기</button>
        </div>
      </div>
    </div>

    <div v-else class="loading">로딩 중...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/stores/useToastStore';
import member from '@/api/member';
import { useAuthStore } from '@/stores/useAuthStore';

// 상태
const router = useRouter();
const toast = useToastStore();
const authStore = useAuthStore();
const me = ref(null);
const meLoaded = ref(false);
const loading = ref(false);

// 폼
const nickname = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');

// 비밀번호
const showPassword = ref(false);
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
const passwordError = ref('');
const validatePassword = () => {
  if (newPassword.value === '') {
    passwordError.value = '';
    return;
  }

  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;

  if (!passwordRegex.test(newPassword.value)) {
    passwordError.value = '영문, 숫자, 특수문자를 모두 포함하여 8~20자로 입력해주세요.';
  } else {
    passwordError.value = '';
  }
};
const showPasswordConfirm = ref(false);
const togglePasswordConfirm = () => {
  showPasswordConfirm.value = !showPasswordConfirm.value;
};
const passwordConfirmError = ref('');
const validatePasswordConfirm = () => {
  if (confirmNewPassword.value === '') {
    passwordConfirmError.value = '';
    return;
  }

  if (confirmNewPassword.value !== newPassword.value) {
    passwordConfirmError.value = '비밀번호가 일치하지 않습니다.';
  } else {
    passwordConfirmError.value = '';
  }
};

// 유효성 검사 computed
const isPasswordValid = computed(() => {
  if (newPassword.value === '') return true; // 비밀번호 변경하지 않는 경우
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;
  return passwordRegex.test(newPassword.value);
});

const isPasswordMatch = computed(() => {
  if (newPassword.value === '') return true;
  return newPassword.value === confirmNewPassword.value;
});

// 제출 비활성화 조건
const submitDisabled = computed(() => {
  // 아무것도 안 바뀌면 비활성화
  const nothingChanged =
    (!nickname.value || nickname.value === me.value?.nickname) &&
    newPassword.value === '' &&
    confirmNewPassword.value === '';

  const passwordInvalid = !isPasswordValid.value || !isPasswordMatch.value;

  return nothingChanged || passwordInvalid;
});

// 제출
const onSubmit = async () => {
  if (submitDisabled.value) return;

  // payload 구성
  const payload = {};

  // 닉네임 변경
  if (nickname.value && nickname.value !== me.value?.nickname) {
    payload.nickname = nickname.value.trim();
  }

  // 비밀번호 변경 요청 시, 현재 비밀번호 동봉 (모달에서 세션으로 전달)
  if (newPassword.value || confirmNewPassword.value) {
    payload.newPassword = newPassword.value;
    payload.confirmNewPassword = confirmNewPassword.value;
  }

  loading.value = true;

  try {
    const updated = await member.updateMember(payload);

    /** AuthStore 동기화: 다른 페이지(Navbar/MyPage 등)에서도 즉시 반영 */
    if (updated) {
      authStore.updateUserProfile({
        nickname: updated.nickname,
        username: updated.username,
        email: updated.email,
        phone: updated.phone,
        birthDate: updated.birthDate,
        // profileImage는 이번 폼에서 바꾸지 않으므로 그대로 둠
      });
    }

    // 닉네임 즉시 반영 (로컬)
    me.value = updated || me.value;
    // 비밀번호 관련 폼 초기화
    newPassword.value = '';
    confirmNewPassword.value = '';
    passwordError.value = '';
    passwordConfirmError.value = '';

    toast.success('회원정보가 성공적으로 수정되었습니다.');

    // 1초 후 마이페이지로 이동
    setTimeout(() => {
      router.push('/user/mypage');
    }, 1000);
  } catch (e) {
    const errorMessage = e?.response?.data?.header?.message || '회원정보 수정에 실패했습니다.';
    const errorCode = e?.response?.data?.body?.data?.code;

    if (errorCode === 'SAME_AS_CURRENT_PASSWORD') {
      toast.error('변경하려는 비밀번호가 현재 비밀번호와 동일합니다.');
    } else {
      toast.error(errorMessage);
    }
  } finally {
    loading.value = false;
  }
};

// 뒤로가기
const goBack = () => {
  router.back();
};

// 초기 로딩
onMounted(async () => {
  try {
    me.value = await member.getMemberInfo();

    /** 최초 진입 시에도 스토어 하이드레이션 */
    if (me.value) {
      authStore.updateUserProfile({
        nickname: me.value.nickname,
        username: me.value.username,
        email: me.value.email,
        phone: me.value.phone,
        birthDate: me.value.birthDate,
      });
    }
  } catch (e) {
    toast.error('회원정보를 불러오는데 실패했습니다.');
    router.push('/login');
    return;
  } finally {
    meLoaded.value = true;
  }
});
</script>

<style scoped>
.form-wrap {
  width: 520px; /* 데스크탑 */
  max-width: 82vw; /* 모바일 */
  margin: 0 auto;
}

/* 폼 */
.label {
  display: block;
  font-size: 18px;
  color: #222;
  margin: 90px 4px 8px;
}
.input-pwd {
  position: relative;
  display: flex;
  align-items: center;
}
.input {
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border: 1px solid #ddd;
  border-radius: 14px;
  background: #fff;
  font-size: 18px;
  outline: none;
  transition: border-color 0.2s ease;
}
.input:focus {
  border-color: #999;
}
.icon-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #666;
}
.icon-btn:hover {
  color: #111;
}

.hint {
  margin: 8px 4px 90px;
  font-size: 13px;
  color: #888;
}

/* 상태 메시지 */
.error {
  color: #c21;
  margin: 12px 4px 0;
  font-size: 14px;
}
.success {
  color: #157347;
  margin: 12px 4px 0;
  font-size: 14px;
}

/* 버튼 */
.actions {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 22px;
  align-items: center;
}
.btn {
  width: min(520px, 84%);
  height: 56px;
  border-radius: 18px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.05s ease,
    box-shadow 0.15s ease,
    opacity 0.15s;
}
.btn.primary {
  background: #111;
  color: #fff;
  border: none;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}
.btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}
.btn.ghost {
  background: #fff;
  color: #111;
  border: 1px solid #ddd;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.06);
}
.btn:hover {
  transform: translateY(-1px);
}

.loading {
  padding: 40px;
  color: #666;
}
</style>

