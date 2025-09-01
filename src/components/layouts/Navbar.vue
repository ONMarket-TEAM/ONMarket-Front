<template>
  <nav class="navbar">
    <!-- 로고 -->
    <div class="navbar-logo">
      <img
        class="navbar-logo-img"
        src="@/assets/로고 가로.png"
        @click="navigateTo('/')"
        alt="OnMarket 로고"
      />
    </div>

    <!-- 메뉴 -->
    <ul class="navbar-menu">
      <li><RouterLink to="/loans">대출 상품 보기</RouterLink></li>
      <li><RouterLink to="/policies">정부 지원금 보기</RouterLink></li>

      <!-- 로그인 여부에 따라 메뉴 구분 -->
      <template v-if="authStore.isAuthenticated">
        <!-- 로그인 상태 -->
        <li>
          <RouterLink to="/user/mypage">
            <i class="bi bi-person-circle"></i> 마이페이지
          </RouterLink>
        </li>
        <li>
          <a href="javascript:void(0)" @click="handleLogout">
            <i class="bi bi-box-arrow-right"></i> 로그아웃
          </a>
        </li>
      </template>
      <template v-else>
        <!-- 로그아웃 상태 -->
        <li>
          <RouterLink to="/login"> <i class="bi bi-box-arrow-in-right"></i> 로그인 </RouterLink>
        </li>
        <li>
          <RouterLink to="/signup"> <i class="bi bi-person-plus"></i> 회원가입 </RouterLink>
        </li>
      </template>
    </ul>
  </nav>
</template>

<script setup>
import { useRouter, RouterLink } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

const navigateTo = (path) => {
  router.push(path);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/'); // 로그아웃 후 홈으로 이동
};
</script>

<style scoped>
/* 네브바 컨테이너 */
.navbar {
  display: flex;
  justify-content: space-between; /* 로고 왼쪽, 메뉴 오른쪽 */
  align-items: center;
  background-color: #ffffff;
  border-bottom: 1px solid #ddd;
  padding: 0 20px;
}

/* 로고 */
.navbar-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 50px;
  cursor: pointer;
}

.navbar-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 메뉴 리스트 */
.navbar-menu {
  list-style: none;
  display: flex;
  gap: 20px; /* 메뉴 간격 */
  margin: 0;
  padding: 0;
}

/* 메뉴 아이템 */
.navbar-menu li a {
  text-decoration: none;
  color: #333;
  font-size: 16px;
  transition: color 0.2s ease;
}

/* hover 효과 */
.navbar-menu li a:hover {
  color: #007bff;
}
</style>

