<template>
  <nav class="navbar">
    <!-- 로고 영역 -->
    <div class="navbar-brand" @click="navigateTo('/')">
      <img class="navbar-logo" src="@/assets/로고 가로.png" alt="OnMarket" />
    </div>

    <!-- 햄버거 버튼 -->
    <button class="hamburger-btn" @click="toggleMobileMenu" :class="{ active: showMobileMenu }">
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <!-- 메인 네비게이션 -->
    <div class="navbar-menu" :class="{ 'mobile-open': showMobileMenu }">
      <RouterLink to="/loans" class="menu-item" @click="closeMobileMenu">
        <i class="bi bi-credit-card"></i>
        <span>대출 상품</span>
      </RouterLink>
      <RouterLink to="/policies" class="menu-item" @click="closeMobileMenu">
        <i class="bi bi-building"></i>
        <span>정부 지원금</span>
      </RouterLink>
      <RouterLink to="/promote" class="menu-item" @click="closeMobileMenu">
        <i class="bi bi-megaphone"></i>
        <span>내 가게 알리기</span>
      </RouterLink>

      <!-- 모바일에서만 보이는 사용자 메뉴 -->
      <div class="mobile-user-menu" v-if="showMobileMenu">
        <template v-if="authStore.isAuthenticated">
          <div class="mobile-user-info">
            <div class="mobile-profile">
              <img
                :src="currentAvatar"
                :alt="currentName"
                class="mobile-profile-image"
                @error="onImgErr"
              />
              <span class="mobile-user-name">{{ currentName }}</span>
            </div>
          </div>
          <div class="mobile-menu-divider"></div>
          <RouterLink to="/user/mypage" class="mobile-menu-item" @click="closeMobileMenu">
            <i class="bi bi-person"></i>
            <span>마이페이지</span>
          </RouterLink>
          <button class="mobile-menu-item logout-item" @click="handleMobileLogout">
            <i class="bi bi-box-arrow-right"></i>
            <span>로그아웃</span>
          </button>
        </template>
        <template v-else>
          <div class="mobile-menu-divider"></div>
          <RouterLink to="/login" class="mobile-menu-item" @click="closeMobileMenu">
            <i class="bi bi-box-arrow-in-right"></i>
            <span>로그인</span>
          </RouterLink>
        </template>
      </div>
    </div>

    <!-- 우측 사용자 영역 (데스크톱) -->
    <div class="navbar-actions">
      <!-- 로그인 상태일 때 -->
      <template v-if="authStore.isAuthenticated">
        <!-- 알림 버튼 -->
        <div class="notification-wrapper">
          <button class="notification-btn" @click="toggleNotifications">
            <i class="bi bi-bell"></i>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </button>

          <!-- 알림 드롭다운 -->
          <div v-if="showNotifications" class="notification-dropdown">
            <div class="notification-header">
              <h4>알림</h4>
              <button @click="markAllAsRead" class="mark-all-read" :disabled="markingAllAsRead">
                모두 읽음
              </button>
            </div>
            <div class="notification-list">
              <div v-if="notifications.length === 0" class="no-notifications">
                새로운 알림이 없습니다.
              </div>
              <div v-else>
                <div
                  v-for="notification in notifications"
                  :key="notification.notificationId"
                  class="notification-item"
                  :class="{ unread: !notification.isRead }"
                  @click="markNotificationAsRead(notification)"
                >
                  <div class="notification-content">
                    <div class="notification-title">{{ notification.title }}</div>
                    <p class="notification-message">{{ notification.message }}</p>
                    <div class="notification-meta">
                      <span class="notification-time">{{ notification.relativeTime }}</span>
                    </div>
                  </div>
                  <div v-if="!notification.isRead" class="unread-indicator"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 사용자 프로필 -->
        <div class="user-profile-wrapper">
          <button class="user-profile-btn" @click="toggleUserMenu">
            <img :src="currentAvatar" :alt="currentName" class="profile-image" @error="onImgErr" />
            <span class="user-name">{{ currentName }}</span>
            <i class="bi bi-chevron-down dropdown-arrow" :class="{ rotated: showUserMenu }"></i>
          </button>

          <!-- 드롭다운 -->
          <div v-if="showUserMenu" class="user-dropdown">
            <RouterLink to="/user/mypage" class="dropdown-item" @click="closeUserMenu">
              <i class="bi bi-person"></i>
              <span>마이페이지</span>
            </RouterLink>
            <hr class="dropdown-divider" />
            <button class="dropdown-item logout-item" @click="handleLogout">
              <i class="bi bi-box-arrow-right"></i>
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </template>

      <!-- 비로그인 상태 -->
      <template v-else>
        <RouterLink to="/login" class="auth-btn login-btn">
          <i class="bi bi-box-arrow-in-right"></i>
          <span>로그인</span>
        </RouterLink>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import memberApi from '@/api/member';
import notificationApi from '@/api/notification';
import { useToastStore } from '@/stores/useToastStore';
import default_image from '@/assets/default_avatar.png';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToastStore();

const DEFAULT_AVATAR = default_image;
const me = ref(null);

// 알림 관련 상태
const showNotifications = ref(false);
const notifications = ref([]);
const unreadCount = ref(0);
const notificationLoading = ref(false);
const markingAllAsRead = ref(false);

// 사용자 메뉴 관련 상태
const showUserMenu = ref(false);

// 모바일 메뉴 상태
const showMobileMenu = ref(false);

// 현재 아바타 - authStore와 me 모두 확인
const currentAvatar = computed(() => {
  // me.value가 있으면 우선 사용, 없으면 authStore 확인
  const profileImage = me.value?.profileImage || authStore.user?.profileImage;
  return profileImage || DEFAULT_AVATAR;
});

// 현재 이름 - authStore와 me 모두 확인
const currentName = computed(() => {
  const name =
    me.value?.nickname ||
    me.value?.username ||
    authStore.user?.nickname ||
    authStore.user?.username ||
    authStore.user?.name;
  return name || '사용자';
});

// 사용자 정보를 가져오는 함수
const fetchUserInfo = async () => {
  if (!authStore.isAuthenticated) {
    me.value = null;
    return;
  }

  try {
    const userInfo = await authStore.refreshUserInfo();
    if (userInfo) {
      me.value = userInfo;
    }
  } catch (err) {
    console.error('회원 정보 불러오기 실패:', err);
    toast.error('회원 정보 불러오기 실패');
  }
};

// authStore의 로그인 상태 변화 감지
watch(
  () => authStore.isAuthenticated,
  (newVal, oldVal) => {
    if (newVal && !oldVal) {
      // 로그인되었을 때
      fetchUserInfo();
      fetchNotificationSummary();
    } else if (!newVal && oldVal) {
      // 로그아웃되었을 때
      me.value = null;
      notifications.value = [];
      unreadCount.value = 0;
    }
  },
  { immediate: false }
);

// authStore의 사용자 정보 변화 감지
watch(
  () => authStore.user,
  (newUser) => {
    if (newUser && !me.value) {
      fetchUserInfo();
      fetchNotificationSummary();
    }
  },
  { immediate: false, deep: true }
);

// 이미지 에러 핸들러
const onImgErr = (e) => {
  e.target.src = DEFAULT_AVATAR;
  if (me.value) me.value.profileImage = null;
};

// 라우터 이동
const navigateTo = (path) => {
  router.push(path);
};

// 토글 관련
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  showNotifications.value = false;
  showUserMenu.value = false;
};
const closeMobileMenu = () => {
  showMobileMenu.value = false;
};
const toggleNotifications = async () => {
  showNotifications.value = !showNotifications.value;
  showUserMenu.value = false;
  showMobileMenu.value = false;

  // 알림 드롭다운 열릴 때마다 최신 알림 목록 조회
  if (showNotifications.value) {
    await fetchNotifications();
  }
};
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  showNotifications.value = false;
  showMobileMenu.value = false;
};
const closeUserMenu = () => {
  showUserMenu.value = false;
};

// 알림 요약 정보 조회 (읽지 않은 개수)
const fetchNotificationSummary = async () => {
  if (!authStore.isAuthenticated) {
    unreadCount.value = 0;
    return;
  }

  try {
    const summary = await notificationApi.getNotificationSummary();
    unreadCount.value = summary.unreadCount || 0;
  } catch (err) {
    toast.error('알림 요약 정보 조회 실패:', err);
  }
};

// 알림 목록 조회
const fetchNotifications = async () => {
  if (!authStore.isAuthenticated) {
    notifications.value = [];
    return;
  }

  try {
    notificationLoading.value = true;
    const response = await notificationApi.getNotifications(0, 20);
    const unreadNotifications = notifications.value.filter((n) => !n.isRead);
    unreadCount.value = unreadNotifications.length;

    // 페이징된 데이터 처리
    if (response.content) {
      notifications.value = response.content;
    } else if (Array.isArray(response)) {
      notifications.value = response;
    } else {
      notifications.value = [];
    }
  } catch (err) {
    toast.error('알림을 불러오는 데 실패했습니다.');
    notifications.value = [];
  } finally {
    notificationLoading.value = false;
  }
};

// 개별 알림 읽음 처리
const markNotificationAsRead = async (notification) => {
  if (notification.isRead) return;

  try {
    await notificationApi.markNotificationAsRead(notification.notificationId);

    // 로컬 상태 업데이트
    notification.isRead = true;
    unreadCount.value = Math.max(0, unreadCount.value - 1);

    toast.success('알림을 읽음 처리했습니다.');
  } catch (err) {
    toast.error('알림 읽음 처리에 실패했습니다.');
  }
};

// 알림 모두 읽음
const markAllAsRead = async () => {
  if (markingAllAsRead.value) return;

  try {
    markingAllAsRead.value = true;
    const response = await notificationApi.markAllNotificationsAsRead();

    // 로컬 상태 업데이트
    notifications.value.forEach((notification) => {
      notification.isRead = true;
    });
    unreadCount.value = 0;

    const markedCount = response.markedCount || 0;
    if (markedCount > 0) {
      toast.success(`${markedCount}개의 알림을 읽음 처리했습니다.`);
    } else {
      toast.info('읽지 않은 알림이 없습니다.');
    }
  } catch (err) {
    toast.error('모든 알림 읽음 처리에 실패했습니다.');
  } finally {
    markingAllAsRead.value = false;
  }
};

// 로그아웃 함수들 수정 - 사용자 정보 완전 초기화
const handleLogout = () => {
  me.value = null;
  notifications.value = [];
  unreadCount.value = 0;
  authStore.logout();
  showUserMenu.value = false;
  router.push('/');
};

const handleMobileLogout = () => {
  me.value = null;
  notifications.value = [];
  unreadCount.value = 0;
  authStore.logout();
  showMobileMenu.value = false;
  router.push('/');
};

// 외부 클릭 시 드롭다운 닫기
const handleClickOutside = (event) => {
  if (!event.target.closest('.notification-wrapper')) {
    showNotifications.value = false;
  }
  if (!event.target.closest('.user-profile-wrapper')) {
    showUserMenu.value = false;
  }
  if (!event.target.closest('.navbar-menu') && !event.target.closest('.hamburger-btn')) {
    showMobileMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);

  if (authStore.isAuthenticated) {
    fetchUserInfo();
    fetchNotificationSummary();
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  width: 100vw;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 10rem;
  height: 70px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-sizing: border-box;
}

/* 햄버거 버튼 */
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  gap: 4px;
}

.hamburger-line {
  width: 24px;
  height: 2px;
  background-color: #374151;
  transition: all 0.3s ease;
  transform-origin: center;
}

.hamburger-btn.active .hamburger-line:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.hamburger-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active .hamburger-line:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

/* 로고 영역 */
.navbar-brand {
  cursor: pointer;
  flex-shrink: 0;
}

.navbar-logo {
  height: 60px;
  width: auto;
}

/* 메인 메뉴 */
.navbar-menu {
  display: flex;
  gap: 2rem;
  flex: 1;
  justify-content: center;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s ease;
}

.menu-item.router-link-active {
  color: #333;
  border-bottom: 2px solid var(--color-sub);
}

/* 모바일 메뉴 스타일 */
.mobile-user-menu {
  display: none;
}

.mobile-menu-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 1rem 0;
}

.mobile-user-info {
  padding: 1rem 0;
}

.mobile-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mobile-profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.mobile-profile-placeholder {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
  color: #9ca3af;
}

.mobile-profile-placeholder i {
  font-size: 1.5rem;
}

.mobile-user-name {
  font-weight: 600;
  color: #1f2937;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  text-decoration: none;
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  background: none;
  width: 100%;
  cursor: pointer;
}

.mobile-menu-item.logout-item {
  color: #dc2626;
}

.mobile-overlay {
  display: none;
}

/* 우측 액션 영역 */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

/* 알림 관련 */
.notification-wrapper {
  position: relative;
}

.notification-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: none;
  border: none;
  border-radius: 8px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}
.notification-btn i {
  font-size: 24px;
}
.notification-btn:hover {
  background: #f3f4f6;
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 320px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.notification-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.mark-all-read {
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
}

.notification-item.unread {
  background: #f8fafc;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content p {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #374151;
}

.notification-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.no-notifications {
  padding: 2rem 1.25rem;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

/* 사용자 프로필 */
.user-profile-wrapper {
  position: relative;
}

.user-profile-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
}

.user-profile-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.profile-image {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-placeholder {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
  color: #9ca3af;
}

.profile-placeholder i {
  font-size: 1.25rem;
}

.user-name {
  font-weight: 500;
  font-size: 0.875rem;
}

.dropdown-arrow {
  font-size: 0.75rem;
  transition: transform 0.2s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  min-width: 200px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 50;
  padding: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  color: #374151;
  font-size: 0.875rem;
  border: none;
  background: none;
  width: 100%;
  cursor: pointer;
  transition: background 0.2s ease;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-divider {
  margin: 0.5rem 0;
  border: none;
  border-top: 1px solid #e5e7eb;
}

.logout-item {
  color: #dc2626;
}

.logout-item:hover {
  background: #fef2f2;
}

/* 인증 버튼들 */
.auth-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.login-btn {
  color: #333;
  border: 1px solid #333;
}

/* 태블릿 및 모바일 반응형 */
@media (max-width: 1300px) {
  .navbar {
    padding: 0 2rem;
  }
}

@media (max-width: 900px) {
  .navbar {
    padding: 0 1rem;
    position: relative;
  }

  .hamburger-btn {
    display: flex;
    order: 3;
  }

  .navbar-brand {
    order: 1;
  }

  .navbar-actions {
    order: 2;
    margin-right: auto;
    margin-left: 1rem;
  }

  .navbar-menu {
    position: fixed;
    top: 70px;
    left: -100%;
    width: 280px;
    height: calc(100vh - 70px);
    background: white;
    flex-direction: column;
    justify-content: flex-start;
    align-items: stretch;
    padding: 2rem 1.5rem;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    transition: left 0.3s ease;
    z-index: 999;
    overflow-y: auto;
  }

  .navbar-menu.mobile-open {
    left: 0;
  }

  .menu-item {
    padding: 1rem 0;
    justify-content: flex-start;
    border-bottom: 1px solid #f3f4f6;
    font-size: 1rem;
  }

  .menu-item.router-link-active {
    border-bottom: 1px solid var(--color-sub);
  }

  .mobile-user-menu {
    display: block;
    margin-top: 1rem;
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    top: 70px;
    left: 0;
    width: 100vw;
    height: calc(100vh - 70px);
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }

  /* 모바일에서 데스크톱 사용자 메뉴 숨김 */
  .user-profile-wrapper {
    display: none;
  }

  .notification-wrapper {
    display: none;
  }

  .auth-btn {
    display: none;
  }
}
</style>

