<template>
  <div class="container section">
    <h1>내 정보</h1>
    <hr />

    <div v-if="me" class="mypage-grid">
      <!-- 왼쪽 : 회원 정보 -->
      <div class="user-info">
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

      <!-- 오른쪽 : 스크랩북 + 설정 -->
      <div class="right-col">
        <aside class="scrap-card">
          <header class="scrap-header">
            <i class="fas fa-bookmark"></i>
            <span>내 스크랩북</span>
          </header>

          <div v-if="scraps.length === 0" class="scrap-empty">
            <p>아직 스크랩한 정책이 없습니다.</p>
          </div>

          <ul v-else class="scrap-list">
            <li v-for="scrap in visibleScraps" :key="scrap.postId" class="scrap-item">
              <span class="scrap-title">{{ scrap.productName }}</span>
              <span class="scrap-dday" :class="getDdayClass(scrap.deadline)">{{
                // formatDeadline(scrap.deadline)
                scrap.deadline
              }}</span>
            </li>
          </ul>

          <button v-if="scraps.length > 6" class="scrap-more" @click="goToMyScrap">
            <i class="fas fa-chevron-down"></i>
          </button>
          <div v-else class="scrap-footer-space"></div>
        </aside>

        <!-- 설정 버튼 바 -->
        <div class="settings-bar">
          <div class="bell-toggle">
            <i class="fas fa-bell"></i>
            <span>알림</span>
            <label class="switch">
              <input type="checkbox" v-model="pushEnabled" @change="onTogglePush" />
              <span class="slider"></span>
            </label>
          </div>

          <button class="pill-btn ghost" @click="handleLogout">로그아웃</button>
          <button class="pill-btn ghost" @click="handleWithdraw">회원탈퇴</button>
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
import scrapAPI from '@/api/scrap';
import notificationAPI from '@/api/notification';
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

const scraps = ref([]);
const scrapLoading = ref(false);
const scrapError = ref('');

const pushEnabled = ref(false);
const visibleScraps = computed(() => scraps.value.slice(0, 6));

const loadScraps = async () => {
  scrapLoading.value = true;
  scrapError.value = '';

  try {
    const response = await scrapAPI.getMyScraps();
    scraps.value = response || [];
  } catch (e) {
    scrapError.value = '스크랩 목록을 불러올 수 없습니다.';
  } finally {
    scrapLoading.value = false;
  }
};

const getDdayClass = (label) => {
  if (!label) return '';
  if (label === '마감') return 'expired';
  if (label === 'D-DAY') return 'dday';

  const m = /^D-(\d+)$/i.exec(label);
  if (m) {
    const n = Number(m[1]);
    return n <= 7 ? 'soon' : '';
  }
  return '';
};

const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('이 브라우저는 서비스워커를 지원하지 않습니다.');
  }

  if (!('PushManager' in window)) {
    throw new Error('이 브라우저는 웹 푸시를 지원하지 않습니다.');
  }

  // 서비스워커 등록
  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;

  // 알림 권한 요청
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.');
  }

  return registration;
};

// VAPID 키 변환 유틸리티
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// 웹 푸시 구독 생성
function ab2b64url(buf) {
  if (!buf) return null;
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

const createPushSubscription = async () => {
  // 1) SW 확보
  const registration = await registerServiceWorker();

  // 2) 권한 확인
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') {
    throw new Error('알림 권한이 필요합니다.');
  }

  // 3) VAPID 키 체크
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error('VAPID 공개키가 설정되지 않았습니다. (.env: VITE_VAPID_PUBLIC_KEY)');
  }

  // 4) 기존 구독 재사용 or 신규 구독
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  // 5) 표준 방식으로 키 추출
  let p256dhKey = ab2b64url(subscription.getKey && subscription.getKey('p256dh'));
  let authKey = ab2b64url(subscription.getKey && subscription.getKey('auth'));

  // 보조: 일부 브라우저의 toJSON().keys 사용
  if ((!p256dhKey || !authKey) && subscription.toJSON) {
    const raw = subscription.toJSON();
    if (!p256dhKey) p256dhKey = raw?.keys?.p256dh || null;
    if (!authKey) authKey = raw?.keys?.auth || null;
  }

  if (!p256dhKey || !authKey) {
    throw new Error('브라우저가 구독 키(p256dh/auth)를 제공하지 않았습니다.');
  }

  return {
    endpoint: subscription.endpoint,
    p256dhKey,
    authKey,
  };
};

// 기존 푸시 구독 해제
const unsubscribePush = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
    }
  }
};

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

const goToMyScrap = () => {
  router.push('/user/myscraps');
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

const handleLogout = async () => {
  if (!confirm('로그아웃하시겠습니까?')) return;

  try {
    authStore.logout();
    router.push('/');
  } catch (e) {
    toast.error('로그아웃 중 오류가 발생했습니다.');
  }
};

const handleWithdraw = async () => {
  if (!confirm('정말로 회원탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

  const result = await authStore.withdraw();

  if (result.success) {
    router.push('/');
  }
};

// 알림 설정
const onTogglePush = async () => {
  const originalState = pushEnabled.value;

  try {
    if (pushEnabled.value) {
      // 알림 켜기 - 웹 푸시 구독
      // 1. 브라우저 지원 확인
      if (!('serviceWorker' in navigator)) {
        throw new Error('이 브라우저는 서비스워커를 지원하지 않습니다.');
      }
      if (!('PushManager' in window)) {
        throw new Error('이 브라우저는 웹 푸시를 지원하지 않습니다.');
      }

      // 2. VAPID 키 확인
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        throw new Error('VAPID 공개키가 설정되지 않았습니다.');
      }

      // 3. 구독 데이터 생성
      const subscriptionData = await createPushSubscription();

      // 4. 백엔드 API 호출
      await notificationAPI.subscribe(subscriptionData);

      toast.success('알림이 활성화되었습니다.');
    } else {
      // 알림 끄기 - 웹 푸시 구독 해제
      // 1. 브라우저 구독 해제
      await unsubscribePush();

      // 2. 백엔드 API 호출
      await notificationAPI.unsubscribe();

      toast.success('알림이 비활성화되었습니다.');
    }
  } catch (error) {
    // 실패 시 원래 상태로 복원
    pushEnabled.value = originalState;

    let errorMessage = '알림 설정 변경에 실패했습니다.';
    if (error.message.includes('권한')) {
      errorMessage = '알림 권한을 허용해주세요. 브라우저 설정에서 알림을 활성화할 수 있습니다.';
    } else if (error.message.includes('지원하지 않습니다')) {
      errorMessage = error.message;
    } else if (error.message.includes('VAPID')) {
      errorMessage = 'VAPID 키 설정을 확인해주세요.';
    }

    toast.error(errorMessage);
  }
};

// 초기 알림 구독 상태 로드
const loadNotificationStatus = async () => {
  try {
    const status = await notificationAPI.getSubscriptionStatus();
    pushEnabled.value = status?.isSubscribed || false;
  } catch (error) {
    pushEnabled.value = false;
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
    await loadScraps();
    await loadNotificationStatus();
  })();
});
</script>

<style scoped>
.mypage-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 34px;
  padding: 0 10px;
  align-items: start;
}
.user-info,
.scrap-card {
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 18px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
.user-info {
  padding: 28px 20px;
  max-width: 100%;
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
  margin: 4px auto 18px;
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
/* 프로필 이미지 변경 메뉴 */
.image-menu-backdrop {
  position: static;
  background: transparent;
  display: block;
  z-index: auto;
}

.image-menu.chip-row {
  background: transparent;
  box-shadow: none;
  margin: 8px auto 0;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 560px;
}

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
  border: 2px solid var(--color-light-1);
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
  background: var(--color-light-1);
}

.right-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-self: start;
}
/* 스크랩 */
.scrap-card {
  --scrap-header-h: 72px;
  --scrap-row-h: 76px;
  --scrap-footer-h: 48px;
  min-height: calc(var(--scrap-header-h) + 6 * var(--scrap-row-h) + var(--scrap-footer-h));
  display: flex;
  flex-direction: column;
  padding: 0;
}
.scrap-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  min-height: var(--scrap-header-h);
  border-bottom: 1px solid #eee;
  font-weight: 600;
  font-size: 23px;
}
.scrap-header i {
  color: #222;
}

/* 비어 있을 때 */
.scrap-empty {
  flex: 1 1 auto; /* 남은 높이 채우기 */
  display: flex;
  align-items: center;
  padding: 0 18px;
  color: #888;
}

/* 리스트 */
.scrap-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1 1 auto;
}
.scrap-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 20px;
  min-height: var(--scrap-row-h);
  border-bottom: 1px solid #f0f0f0;
}
.scrap-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
  color: #222;
}
.scrap-dday {
  font-weight: 700;
  color: black;
}
.scrap-dday.dday {
  color: #e33;
}
.scrap-dday.soon {
  color: var(--color-sub);
} /* 7일 이내 */
.scrap-dday.expired {
  color: #aaa;
} /* 마감됨 */

/* 더보기(아래 화살표) */
.scrap-more {
  flex: 0 0 var(--scrap-footer-h);
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #eee;
  width: 100%;
  background: transparent;
  border: none;
  color: #333;
  cursor: pointer;
}
.scrap-more i {
  font-size: 14px;
  line-height: 1;
}
.scrap-footer-space {
  flex: 0 0 var(--scrap-footer-h);
  height: var(--scrap-footer-h);
}
.scrap-more i {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  color: #333;
  padding: 8px 0;
  height: var(--scrap-footer-h); /* 동일한 높이 */
  cursor: pointer;
}

/* ===== 하단: 알림 설정/탈퇴/로그아웃 ===== */
.settings-bar {
  display: flex;
  justify-content: flex-start; /* 왼쪽 정렬(디자인에 맞게 조절 가능) */
  align-items: center;
  gap: 18px;
  margin-top: 20px;
}

/* 알림 토글 카드형 */
.bell-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  margin-right: 50px;
  border: 1px solid #e6e6e6;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
}
.bell-toggle i {
  font-size: 16px;
}

/* 토글 스위치 */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: lightgray;
  transition: 0.2s;
  border-radius: 999px;
}
.slider:before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  top: 3px;
  background: #fff;
  border-radius: 50%;
  transition: 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.switch input:checked + .slider {
  background: var(--color-sub);
}
.switch input:checked + .slider:before {
  transform: translateX(20px);
}

/* pill 버튼 (회원탈퇴/로그아웃) */
.pill-btn {
  border: 1px solid #e6e6e6;
  background: #fff;
  border-radius: 18px;
  padding: 12px 20px;
  width: 150px;
  font-size: 17px;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition:
    transform 0.05s ease,
    box-shadow 0.15s ease;
}
.pill-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
}
.pill-btn.ghost {
  color: #111;
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

