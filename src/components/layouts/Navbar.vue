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
      <li><a href="/loans">대출 상품 보기</a></li>
      <li><a href="/supports">정부 지원금 보기</a></li>
      <!-- 마이페이지 버튼을 누르면 로그인 혹은 마이페이지 이동 -->
      <li>
        <a href="/login"><i class="bi bi-person-circle"></i> 회원가입</a>
      </li>

      <li>
        <a href="/user/mypage"><i class="bi bi-person-circle"></i> 마이페이지</a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const navigateTo = (path) => {
  router.push(path);
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
}

/* 로고 */
.navbar-logo {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 50px;
  margin-left: 10px;
}

.navbar-logo-img {
  width: 100%;
  height: 100%;
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
