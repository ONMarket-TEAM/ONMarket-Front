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
    {
      path: '/auth/callback',
      component: () => import('@/pages/AuthCallback.vue'),
    },
    {
      path: '/business/register',
      component: () => import('@/pages/Login/BusinessEdit.vue'),
      meta: { requiresAuth: true },
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
      path: '/user/mybusiness',
      component: () => import('@/pages/User/MyBusiness.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/user/mybusiness/:businessId/edit',
      name: 'UpdateBusiness',
      component: () => import('@/pages/User/UpdateBusiness.vue'),
      meta: { requiresAuth: true },
      props: (route) => ({ businessId: Number(route.params.businessId) }),
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
    {
      path: '/promote',
      component: () => import('@/pages/SNS/Caption.vue'),
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
  const authStore = useAuthStore();

  // URL에서 소셜 로그인 토큰 확인 (추가)
  const accessToken = to.query.accessToken;
  const refreshToken = to.query.refreshToken;

  if (accessToken && refreshToken) {
    // 토큰을 localStorage에 저장
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // AuthStore에 토큰 설정
    authStore.setTokens(accessToken, refreshToken);

    // 쿼리 파라미터 제거하고 같은 경로로 리다이렉트
    next({ path: to.path, query: {} });
    return;
  }

  // AuthStore 초기화
  authStore.initializeAuth();

  const isAuthenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  if (to.meta.hideForAuth && isAuthenticated) {
    const redirectTo = from.query?.redirect || '/';
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

