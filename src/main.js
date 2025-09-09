import { createApp } from 'vue';
import { createPinia } from 'pinia';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './assets/styles/common.css';

import App from './App.vue';
import router from './router';

// 앱 생성
const app = createApp(App);

// Pinia 스토어 설정
const pinia = createPinia();
app.use(pinia);

// 라우터 설정
app.use(router);

// 앱 마운트 전에 인증 상태 초기화
import { useAuthStore } from './stores/useAuthStore';

// 앱 마운트
app.mount('#app');

// 인증 상태 초기화 (앱 마운트 후)
const authStore = useAuthStore();
authStore.initializeAuth();

