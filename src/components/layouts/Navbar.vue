<template>
  <nav class="navbar">
    <!-- 로고 영역 -->
    <div class="navbar-brand" @click="navigateTo('/')">
      <img class="navbar-logo" src="@/assets/로고 가로.png" alt="OnMarket" />
    </div>

    <!-- 메인 네비게이션 -->
    <div class="navbar-menu">
      <RouterLink to="/loans" class="menu-item">
        <i class="bi bi-credit-card"></i>
        <span>대출 상품</span>
      </RouterLink>
      <RouterLink to="/policies" class="menu-item">
        <i class="bi bi-building"></i>
        <span>정부 지원금</span>
      </RouterLink>
    </div>

    <!-- 우측 사용자 영역 -->
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
              <button @click="markAllAsRead" class="mark-all-read">모두 읽음</button>
            </div>
            <div class="notification-list">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="notification-item"
                :class="{ unread: !notification.read }"
              >
                <div class="notification-content">
                  <p>{{ notification.message }}</p>
                  <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
                </div>
              </div>
              <div v-if="notifications.length === 0" class="no-notifications">
                새로운 알림이 없습니다.
              </div>
            </div>
          </div>
        </div>

        <!-- 사용자 프로필 -->
        <div class="user-profile-wrapper">
          <button class="user-profile-btn" @click="toggleUserMenu">
            <img
              v-if="authStore.user?.profileImage"
              :src="authStore.user.profileImage"
              :alt="authStore.user.name"
              class="profile-image"
            />
            <div v-else class="profile-placeholder">
              <i class="bi bi-person-circle"></i>
            </div>
            <span class="user-name">{{ authStore.user?.name || '사용자' }}</span>
            <i class="bi bi-chevron-down dropdown-arrow" :class="{ rotated: showUserMenu }"></i>
          </button>

          <!-- 사용자 드롭다운 메뉴 -->
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

      <!-- 비로그인 상태일 때 -->
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

// 알림 관련 상태
const showNotifications = ref(false);
const notifications = ref([
  { id: 1, message: '새로운 대출 상품이 등록되었습니다.', read: false, createdAt: new Date() },
  {
    id: 2,
    message: '정부 지원금 신청 결과가 나왔습니다.',
    read: false,
    createdAt: new Date(Date.now() - 3600000),
  },
]);
const unreadCount = ref(2);

// 사용자 메뉴 관련 상태
const showUserMenu = ref(false);

// 메서드들
const navigateTo = (path) => {
  router.push(path);
};

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value;
  showUserMenu.value = false; // 다른 드롭다운 닫기
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  showNotifications.value = false; // 다른 드롭다운 닫기
};

const closeUserMenu = () => {
  showUserMenu.value = false;
};

const markAllAsRead = () => {
  notifications.value.forEach((notification) => {
    notification.read = true;
  });
  unreadCount.value = 0;
};

const formatTime = (date) => {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return date.toLocaleDateString();
};

const handleLogout = () => {
  authStore.logout();
  showUserMenu.value = false;
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
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
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
  width: 100vw; /* 100%에서 100vw로 변경 */
  padding: 0 400px;
  height: 70px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  margin: 0; /* 기본 마진 제거 */
  box-sizing: border-box; /* 패딩 포함해서 계산 */
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
</style>

