<template>
  <div class="container section">
    <h1>내 정보</h1>
    <hr />
    <div class="user-info" v-if="me">
      <div class="profile-image" @click="openImageMenu">
        <img :src="currentAvatar" :key="avatarVersion" alt="프로필 이미지" @error="onImgErr" />
        <div class="image-overlay">
          <i class="fas fa-camera"></i>
        </div>
      </div>

      <div v-if="showImageMenu" class="image-menu-backdrop" @click.self="closeImageMenu">
        <div class="image-menu chip-row" role="dialog" aria-modal="true">
          <button class="chip-btn" @click="selectNewImage">이미지 변경</button>
          <button class="chip-btn" @click="setDefaultImage">기본 이미지로 변경</button>
          <button class="chip-btn" @click="closeImageMenu">취소</button>
        </div>
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileSelect"
      />

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
      <div class="row">
        <strong>인스타그램</strong>
        <div class="instagram-content">
          <!-- 연결된 경우 -->
          <div v-if="snsStore.instagram.connected" class="instagram-connected">
            <span>{{ snsStore.instagram.username }}</span>
            <button class="disconnect-btn" @click="disconnectInstagram">✕</button>
          </div>
          <!-- 연결되지 않은 경우 -->
          <!-- 인스타그램 연동 버튼 -->
          <div v-else class="instagram-not-connected">
            <button class="connect-btn" @click="openInstagramLoginModal">
              <i class="fab fa-instagram"></i>
              Instagram
            </button>
          </div>

          <!-- Instagram 모달 (항상 DOM에 두고 visible로 열고 닫음) -->
          <InstagramLoginModal
            ref="instagramLoginModal"
            :visible="showInstagramModal"
            @close="showInstagramModal = false"
            @login-success="handleInstagramLoginSuccess"
          />
        </div>
      </div>

      <div class="actions">
        <button @click="openVeriftModal">회원정보 변경하기</button>
        <button @click="goToBusinessList">사업정보 변경하기</button>
      </div>

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
            영문 대/소문자, 숫자, 특수문자를 모두 포함해 8자 이상 20자 이하로 입력해주세요.
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

    <div v-else-if="loading" style="text-align: center; padding: 20px">로딩 중...</div>

    <div v-else style="text-align: center; padding: 20px">
      <p>회원 정보가 없습니다.</p>
    </div>

    <div
      v-if="error"
      style="background: #f8d7da; color: #721c24; padding: 15px; margin: 15px 0; border-radius: 5px"
    >
      에러: {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import member from '@/api/member';
import { useRouter } from 'vue-router';
import { useToastStore } from '@/stores/useToastStore';
import { useSnsStore } from '@/stores/useSnsStore';
import InstagramLoginModal from '@/components/sns/insta/InstagramLoginModal.vue';
import default_image from '@/assets/default_avatar.png';
import { useAuthStore } from '@/stores/useAuthStore';

const me = ref(null);
const loading = ref(true);
const error = ref('');
const router = useRouter();
const toast = useToastStore();
const snsStore = useSnsStore();
const authStore = useAuthStore();
const profileImageUrl = ref(null);
const showImageMenu = ref(false);
const fileInput = ref(null);
const avatarVersion = ref(0);
const showInstagramModal = ref(false);
const instagramLoginModal = ref(null);

// Signed URL 확인 헬퍼
const isSignedUrl = (url) => {
  try {
    const u = new URL(url);
    return (
      u.searchParams.has('X-Amz-Signature') ||
      u.searchParams.has('X-Amz-Algorithm') ||
      u.searchParams.has('X-Amz-Credential') ||
      u.searchParams.has('Signature')
    );
  } catch {
    return false;
  }
};

const openInstagramLoginModal = () => {
  showInstagramModal.value = true;
};

const handleInstagramLoginSuccess = async ({ username }) => {
  try {
    await snsStore.loginInstagram(username, 'dummy'); // password는 무시됨
    toast.success('Instagram 연동에 성공했습니다.');
    showInstagramModal.value = false;
  } catch (e) {
    toast.error('Instagram 연동에 실패했습니다.');
  }
};

// 현재 아바타 URL 계산
const currentAvatar = computed(() => {
  const base = profileImageUrl.value || me.value?.profileImage || DEFAULT_AVATAR;
  if (!base) return DEFAULT_AVATAR;

  if (isSignedUrl(base)) {
    // 서명 URL: 쿼리 절대 변경 X, 해시만 붙여 리마운트 트리거
    return `${base}#v=${avatarVersion.value}`;
  }
  // 퍼블릭 URL: 쿼리로 캐시 버스팅
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}v=${avatarVersion.value}`;
});

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

const goToBusinessList = () => {
  router.push('/user/mybusiness');
};

const openImageMenu = () => {
  showImageMenu.value = true;
};

const closeImageMenu = () => {
  showImageMenu.value = false;
};

const selectNewImage = () => {
  closeImageMenu();
  fileInput.value?.click();
};

const setDefaultImage = async () => {
  closeImageMenu();

  try {
    await member.deleteProfileImage();
    profileImageUrl.value = null;
    if (me.value) me.value = { ...me.value, profileImage: null };
    avatarVersion.value++;
    toast.success('기본 이미지로 변경되었습니다.');
  } catch (e) {
    error.value = '기본 이미지로 변경하는데 실패했습니다.';
  }
};

const handleFileSelect = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    toast.error('파일 크기는 5MB 이하만 가능합니다.');
    event.target.value = '';
    return;
  }
  if (!file.type.startsWith('image/')) {
    toast.error('이미지 파일만 업로드 가능합니다.');
    event.target.value = '';
    return;
  }

  try {
    // 1) Presigned URL 발급 (백엔드)
    const presign = await member.getProfileImagePresignUrl(file.name, file.type);

    // 2) S3 업로드 (클라이언트 → S3)
    await member.uploadImageToS3(presign.uploadUrl, file, file.type);

    // 3) 서버에 업로드 확정(키 등록/DB 반영) 후 최종 공개 URL 받기
    const confirm = await member.confirmProfileImage(presign.key);

    // 상태 업데이트
    const newImageUrl = confirm.url; // 백엔드가 주는 최종 이미지 URL
    profileImageUrl.value = newImageUrl;
    if (me.value) me.value = { ...me.value, profileImage: newImageUrl };
    avatarVersion.value++;

    toast.success('프로필 이미지가 변경되었습니다.');
  } catch (e) {
    toast.error('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
  } finally {
    if (fileInput.value) fileInput.value.value = '';
  }
};

const loadProfileImage = async () => {
  try {
    const imageData = await member.getCurrentProfileImage();
    profileImageUrl.value = imageData?.url || null;
    avatarVersion.value++;
  } catch (e) {
    toast.error('프로필 이미지 조회에 실패했습니다.');
  }
};

const disconnectInstagram = async () => {
  try {
    await snsStore.logoutInstagram();
    toast.success('Instagram 연동이 해제되었습니다.');
  } catch (e) {
    toast.error('Instagram 연동 해제에 실패했습니다.');
  }
};

const loadInfo = async () => {
  loading.value = true;
  error.value = '';

  try {
    me.value = await member.getMemberInfo();
    await snsStore.fetchInstagramStatus();
  } catch (e) {
    const errorMessage = e?.response?.data?.header?.message || '내 정보를 불러오지 못했습니다.';
    error.value = errorMessage;
    toast.error(errorMessage);

    if (e?.response?.status === 401 || e?.response?.status === 403) {
      router.push('/login');
    }
  } finally {
    loading.value = false;
  }
};

const DEFAULT_AVATAR = default_image;
const onImgErr = (e) => {
  e.target.src = DEFAULT_AVATAR;
  profileImageUrl.value = null;
  if (me.value) me.value = { ...me.value, profileImage: null };
  avatarVersion.value++;
};

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  (async () => {
    await loadInfo();
    await loadProfileImage();
  })();
});
</script>

<style scoped>
.user-info {
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  padding: 28px 20px;
  max-width: 500px;
}
.row {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  padding: 14px 68px;
  border-bottom: 1px solid #f2f2f2;
  column-gap: 50px;
}
.row:last-child {
  border-bottom: none;
}
.row strong {
  font-weight: 500;
  font-size: 18px;
  color: #444;
}
.row span {
  font-size: 18px;
  color: #222;
}
/* 인스타그램 행 */
.connect-btn {
  background: var(--color-sub);
  color: var(--color-white);
  border: none;
  padding: 6px 12px;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.connect-btn:hover {
  background: #d73447;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(228, 64, 95, 0.3);
}
.connect-btn .fab.fa-instagram {
  font-size: 16px;
  margin-right: 4px;
}

.profile-image {
  position: relative;
  width: 96px;
  height: 96px;
  margin: 4px auto 18px; /* auto로 수평 가운데 정렬 */
  cursor: pointer;
  display: block; /* 전체폭을 차지하지 않게 */
}

.profile-image img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: block;
}
.image-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35); /* 회색/검정 반투명 */
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.profile-image:hover .image-overlay {
  opacity: 1;
}
.image-overlay i {
  font-size: 20px;
}
/* 중앙 강제 정렬 제거 → 흐름상 아바타 아래에 표시 */
.image-menu-backdrop {
  position: static; /* ← fixed 제거 */
  background: transparent;
  display: block; /* grid 제거 */
  z-index: auto;
}

/* 칩 행만 가운데 정렬 & 간격 */
.image-menu.chip-row {
  background: transparent;
  box-shadow: none;
  margin: 8px auto 0; /* 가운데 정렬 */
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px; /* 버튼 사이 간격 */
  flex-wrap: wrap; /* 줄바꿈 */
  width: 100%;
  max-width: 560px;
}

/* 칩 버튼만 둥글고 도톰하게 */
.chip-btn {
  appearance: none;
  background: var(--color-main);
  color: #333;
  padding: 5px 9px;
  margin-bottom: 8px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: -0.2px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition:
    transform 0.08s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
  white-space: nowrap;
  width: 110px;
  height: auto;
}
.chip-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.16);
  border-color: #dcdcdc;
}
.chip-btn:active {
  transform: translateY(0);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12);
}
.actions {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
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
.instagram-connected {
  display: flex;
  align-items: center;
  gap: 8px;
}

.disconnect-btn {
  background: transparent;
  border: none;
  color: #999;
  font-size: 16px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.disconnect-btn:hover {
  color: #e44;
}
</style>

