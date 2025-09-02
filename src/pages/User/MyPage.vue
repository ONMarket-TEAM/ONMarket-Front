<template>
  <div class="container section">
    <!-- 타이틀 -->
    <h1>내 정보</h1>
    <hr />

    <!-- 회원 정보 -->
    <div class="user-info" v-if="me">
      <div class="profile-image">
        <img :src="me?.profileImage || DEFAULT_AVATAR" alt="프로필 이미지" @error="onImgErr" />
      </div>
      <div class="row">
        <strong>이름</strong> <span>{{ me?.username || '정보 없음' }}</span>
      </div>
      <div class="row">
        <strong>닉네임</strong> <span>{{ me?.nickname || '정보 없음' }}</span>
      </div>
      <div class="row">
        <strong>이메일</strong> <span>{{ me?.email || '정보 없음' }}</span>
      </div>
      <div class="row">
        <strong>전화번호</strong> <span>{{ me?.phone || '정보 없음' }}</span>
      </div>
      <div class="row">
        <strong>생년월일</strong> <span>{{ me?.birthDate || '정보 없음' }}</span>
      </div>

      <div class="actions">
        <button @click="openVeriftModal">회원정보 변경하기</button>
        <button>사업정보 변경하기</button>
      </div>

      <!-- 현재 비밀번호 확인 (회원정보 변경 인증용) 모달 -->
      <div v-if="showVerify" class="modal-backdrop" @click.self="closeVerifyModal">
        <div class="modal-card">
          <h2>비밀번호 확인</h2>

          <label class="field-label">현재 비밀번호</label>
          <div class="input-pwd">
            <input
              v-model="currentPassword"
              :type="showPassword ? 'text' : 'password'"
              class="input"
              placeholder="현재 비밀번호를 입력해주세요."
              @keyup.enter="submitVerify"
            />
            <button type="button" class="icon-btn" @click="togglePassword">
              <i :class="showPassword ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>
            </button>
          </div>

          <p class="hint">
            영문 대소문자, 숫자, 특수문자를 2가지 이상 조합해 8자 이상 20자 이하로 입력해주세요.
          </p>

          <div class="row-actions">
            <button class="btn primary" :disabled="verifyLoading" @click="submitVerify">
              {{ verifyLoading ? '확인 중...' : '회원정보 수정하기' }}
            </button>
            <button class="btn ghost" @click="closeVerifyModal">취소</button>
          </div>

          <p v-if="verifyError" class="error">{{ verifyError }}</p>
        </div>
      </div>
    </div>

    <!-- 데이터가 없거나 로딩 중일 때 -->
    <div v-else-if="loading" style="text-align: center; padding: 20px">로딩 중...</div>

    <div v-else style="text-align: center; padding: 20px">
      <p>회원 정보가 없습니다.</p>
    </div>

    <!-- 에러 표시 -->
    <div
      v-if="error"
      style="background: #f8d7da; color: #721c24; padding: 15px; margin: 15px 0; border-radius: 5px"
    >
      에러: {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import member from '@/api/member';
import { useRouter } from 'vue-router';

const me = ref(null);
const loading = ref(false);
const error = ref('');
const router = useRouter();

// 모달
const showVerify = ref(false);
const currentPassword = ref('');
const verifyError = ref('');
const verifyLoading = ref(false);
const showPassword = ref(false);
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const openVeriftModal = () => {
  verifyError.value = '';
  currentPassword.value = '';
  showVerify.value = true;
};

const closeVerifyModal = () => {
  showVerify.value = false;
  verifyError.value = '';
  currentPassword.value = '';
};

const submitVerify = async () => {
  if (!currentPassword.value?.trim()) {
    verifyError.value = '비밀번호를 입력해주세요.';
    return;
  }

  verifyLoading.value = true;
  verifyError.value = '';

  try {
    await member.verifyPassword(currentPassword.value.trim());
    closeVerifyModal();
    router.push('/user/updateProfile');
  } catch (e) {
    verifyError.value = e?.response?.data?.header?.message || '비밀번호가 일치하지 않습니다.';
  } finally {
    verifyLoading.value = false;
  }
};

// 회원 정보 불러오기
const loadInfo = async () => {
  loading.value = true;
  error.value = '';

  try {
    me.value = await member.getMemberInfo();
    console.log('회원 정보 조회 성공:', me.value);
  } catch (e) {
    console.error('API 호출 실패:', e);
    error.value = e?.response?.data?.header?.message || '내 정보를 불러오지 못했습니다.';

    // 401/403 에러인 경우 로그인 페이지로 이동
    if (e?.response?.status === 401 || e?.response?.status === 403) {
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

// 프로필 이미지
const DEFAULT_AVATAR =
  'https://i.namu.wiki/i/ogxgdn15mcEUXbczxwIvS0WD_y44VJwOfHO2QEo9wraG4mOiyl4vhMeKfVaqw7hC1AXKe-oafjIlziyk1RGMciwrziPIHS_LhrS3k5fbAA5VLWsO3K5cZVdmkWnZr76YGmu3OLT5ZMJ3DknR3iqnBQ.webp';
const onImgErr = (e) => {
  e.target.src = DEFAULT_AVATAR;
};

onMounted(() => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.log('토큰 없음 → 로그인 필요');
    router.push('/login'); // 필요하다면 로그인 페이지로 이동
    return;
  }

  loadInfo();
});
</script>

<style scoped>
/* 전체 카드 */
.user-info {
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  padding: 28px 32px;
  max-width: 500px;
}

/* 라벨/값 2열 */
.row {
  display: grid;
  grid-template-columns: 120px 1fr; /* 라벨 120px, 값 나머지 */
  align-items: center;
  padding: 14px 65px;
  border-bottom: 1px solid #f2f2f2;
  column-gap: 50px;
}
.row:last-child {
  border-bottom: none;
}

/* 라벨 */
.row strong {
  font-weight: 500;
  font-size: 18px;
  color: #444;
}

/* 값 */
.row span {
  font-size: 18px;
  color: #222;
}

/* 프로필 이미지 */
.profile-image {
  display: flex;
  justify-content: center;
  margin: 4px 0 18px;
}

.profile-image img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 버튼 영역 */
.actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

/* 버튼 스타일 */
.actions button {
  display: block;
  width: 60%;
  padding: 12px 16px;
  font-size: 17px;
  font-weight: 500;
  border: 1px solid black;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition:
    transform 0.05s ease,
    box-shadow 0.15s ease;
}
.actions button:hover {
  transform: translateY(-1px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);
}

/* 모달 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-card {
  width: min(560px, 92vw);
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.18);
  padding: 40px 36px;
}
.modal-card h2 {
  margin: 50px 0 24px;
  font-size: 34px;
  font-weight: 700;
  text-align: center;
}
.field-label {
  display: block;
  font-size: 14px;
  margin: 90px 6px 8px;
  color: #333;
}
.input-pwd {
  position: relative;
  display: flex;
  align-items: center;
}
.input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #ddd;
  border-radius: 10px;
  outline: none;
}
.input:focus {
  border-color: #888;
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
  color: #666;
  font-size: 13px;
  margin: 10px 6px 150px;
}

.row-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
.btn {
  width: 70%;
  height: 56px;
  border-radius: 18px;
  font-weight: 600;
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}
.btn.primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn.ghost {
  background: #fff;
  border: 1px solid #ccc;
}
.error {
  color: #c21;
  margin-top: 8px;
  font-size: 13px;
  text-align: center;
}
</style>

