<template>
  <div class="container section">
    <h1>Home</h1>
    <div>
      <button @click="toastStore.success('성공했습니다!')">성공 토스트</button>
    </div>
    <div>
      <button @click="toastStore.error('에러가 발생했습니다!')">에러 토스트</button>
    </div>
    <div>
      <button @click="toastStore.warning('경고 알림입니다!')">경고 토스트</button>
    </div>
    <div>
      <button @click="toastStore.info('정보 메시지입니다!')">정보 토스트</button>
    </div>
  </div>
  <div>
    <button @click="showLoginModal = true" class="demo-button">📱 로그인 모달 열기</button>
  </div>
  <div>
    <InstagramLoginModal
      :visible="showLoginModal"
      @close="showLoginModal = false"
      @login-success="handleLoginSuccess"
      @facebook-login="handleFacebookLogin"
      @forgot-password="handleForgotPassword"
      @signup="handleSignup"
    />
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/useToastStore';
import InstagramLoginModal from '@/components/sns/insta/InstagramLoginModal.vue';
import { ref } from 'vue';
const toastStore = useToastStore();

const showLoginModal = ref(false);
const loginResult = ref(null);

const handleLoginSuccess = (userData) => {
  console.log('로그인 성공:', userData);
  loginResult.value = {
    type: 'login_success',
    data: userData,
  };
  alert(`환영합니다, ${userData.username}님!`);
};

const handleFacebookLogin = () => {
  console.log('Facebook 로그인');
  loginResult.value = {
    type: 'facebook_login',
    message: 'Facebook 로그인이 요청되었습니다.',
  };
  alert('Facebook 로그인 기능');
};

const handleForgotPassword = () => {
  console.log('비밀번호 찾기');
  loginResult.value = {
    type: 'forgot_password',
    message: '비밀번호 찾기가 요청되었습니다.',
  };
  alert('비밀번호 찾기 페이지로 이동');
};

const handleSignup = () => {
  console.log('회원가입');
  loginResult.value = {
    type: 'signup',
    message: '회원가입이 요청되었습니다.',
  };
  alert('회원가입 페이지로 이동');
};
</script>

