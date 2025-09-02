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
        <label class="label">변경할 비밀번호</label>
        <div class="input-pwd">
          <input
            class="input"
            :type="showPassword ? 'text' : 'password'"
            v-model="newPassword"
            placeholder="비밀번호를 입력해주세요."
          />
          <button type="button" class="icon-btn" @click="togglePassword">
            <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
          </button>
        </div>

        <!-- 새 비밀번호 확인 -->
        <label class="label mt-4">변경할 비밀번호 확인</label>
        <div class="input-pwd">
          <input
            class="input"
            :type="showPasswordConfirm ? 'text' : 'password'"
            v-model="confirmNewPassword"
            placeholder="비밀번호를 다시 한 번 입력해주세요."
          />
          <button type="button" class="icon-btn" @click="togglePasswordConfirm">
            <i :class="showPasswordConfirm ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
          </button>
        </div>

        <!-- 안내문 -->
        <p class="hint">
          영문 대소문자, 숫자, 특수문자를 2가지 이상 조합해 8자 이상 20자 이하로 입력해주세요.
        </p>

        <!-- 에러/성공 -->
        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="success" class="success">{{ success }}</p>

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
import member from '@/api/member';

// 상태
const router = useRouter();
const me = ref(null);
const meLoaded = ref(false);
const loading = ref(false);
const error = ref('');
const success = ref('');
const showPassword = ref(false);
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
const showPasswordConfirm = ref(false);
const togglePasswordConfirm = () => {
  showPasswordConfirm.value = !showPasswordConfirm.value;
};

// 폼
const nickname = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');

// 유효성
const pwLenOK = computed(
  () =>
    newPassword.value.length === 0 ||
    (newPassword.value.length >= 8 && newPassword.value.length <= 20)
);
const pwKindsOK = computed(() => {
  if (!newPassword.value) return true; // 비번 변경 안 할 때는 통과
  const s = newPassword.value;
  let kinds = 0;
  if (/[a-z]/.test(s) || /[A-Z]/.test(s)) kinds++; // 영문
  if (/[0-9]/.test(s)) kinds++; // 숫자
  if (/[^A-Za-z0-9]/.test(s)) kinds++; // 특수문자
  return kinds >= 2;
});
const pwMatch = computed(
  () => !newPassword.value || newPassword.value === confirmNewPassword.value
);

// 제출 비활성화 조건
const submitDisabled = computed(() => {
  // 아무것도 안 바뀌면 비활성화
  const nothingChanged =
    (!nickname.value || nickname.value === me.value?.nickname) &&
    newPassword.value === '' &&
    confirmNewPassword.value === '';

  return nothingChanged || !pwLenOK.value || !pwKindsOK.value || !pwMatch.value;
});

// 제출
const onSubmit = async () => {
  error.value = '';
  success.value = '';

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
    success.value = '회원정보가 수정되었습니다.';
    // 닉네임 즉시 반영
    me.value = updated || me.value;
    // 비밀번호 관련 필드/세션 정리
    newPassword.value = '';
    confirmNewPassword.value = '';

    // 1초 후 마이페이지로 이동
    setTimeout(() => {
      router.push('/user/mypage');
    }, 1000);
  } catch (e) {
    error.value = e?.response?.data?.header?.message || '회원정보 수정에 실패했습니다.';
  } finally {
    loading.value = false;
  }
};

// 초기 로딩
onMounted(async () => {
  try {
    me.value = await member.getMemberInfo();
  } catch (e) {
    // 인증 만료 등
    router.push('/login');
    return;
  } finally {
    meLoaded.value = true;
  }
});

// 뒤로가기
const goBack = () => {
  router.back();
};
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

