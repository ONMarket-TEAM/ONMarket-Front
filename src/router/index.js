import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/pages/Home/Home.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/login',
      component: () => import('@/pages/Login/LoginLayout.vue'),
      meta: {
        requiresAuth: false,
        hideForAuth: true, // 이미 로그인한 사용자는 접근 불가
      },
      children: [
        {
          path: '', // /login
          component: () => import('@/pages/Login/LoginForm.vue'),
          name: 'Login',
        },
        {
          path: 'find-id', // /login/find-id
          component: () => import('@/pages/Login/FindId.vue'),
          name: 'FindId',
        },
        {
          path: 'find-password', // /login/find-password
          component: () => import('@/pages/Login/FindPassword.vue'),
          name: 'FindPassword',
        },
        {
          path: 'signup', // /login/signup
          component: () => import('@/pages/Login/Signup.vue'),
          name: 'Signup',
        },
      ],
    },

    // 마이페이지
    {
      path: '/user/mypage',
      component: () => import('@/pages/User/MyPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/user/updateProfile',
      component: () => import('@/pages/User/UpdateProfile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/user/updateBusiness',
      component: () => import('@/pages/User/UpdateBusiness.vue'),
      meta: { requiresAuth: true },
    },

    // 대출 상품 페이지 (인증 필요)
    {
      path: '/loans',
      component: () => import('@/pages/Post/PostList.vue'),
      meta: { requiresAuth: true },
    },

    // 정부 지원금 페이지 (인증 필요)
    {
      path: '/policies',
      component: () => import('@/pages/Post/PostList.vue'),
      meta: { requiresAuth: true },
    },

    // 상세 페이지들 (인증 필요)
    {
      path: '/loans/:id',
      component: () => import('@/pages/Post/LoanDetail.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/policies/:id',
      component: () => import('@/pages/Post/PolicyDetail.vue'),
      meta: { requiresAuth: true },
    },

    /* 404 not found 페이지 */
    {
      path: '/:paths(.*)*',
      name: 'notFound',
      component: () => import('../pages/NotFound/NotFound.vue'),
      meta: { requiresAuth: false },
    },
  ],

  // 스크롤 동작 설정
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// 라우터 가드 설정
router.beforeEach(async (to, from, next) => {
  // Pinia 스토어는 라우터 가드 내에서 동적으로 가져와야 함
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // 인증이 필요한 페이지인지 확인
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 로그인이 필요한 페이지에 미인증 사용자가 접근하는 경우
    next({
      path: '/login',
      query: { redirect: to.fullPath }, // 로그인 후 원래 페이지로 리다이렉트
    });
    return;
  }

  // 이미 로그인한 사용자가 로그인 관련 페이지에 접근하는 경우
  if (to.meta.hideForAuth && isAuthenticated) {
    // 리다이렉트 쿼리가 있으면 해당 페이지로, 없으면 대시보드로
    const redirectTo = from.query?.redirect || '/dashboard';
    next(redirectTo);
    return;
  }

  next();
});

// 라우터 에러 핸들링
router.onError((error) => {
  console.error('Router error:', error);
});

export default router;

