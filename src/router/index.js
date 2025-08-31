import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/pages/Home/Home.vue'),
    },
    {
      path: '/login',
      component: () => import('@/pages/Login/Login.vue'),
      children: [
        {
          path: '/login/findId',
          component: () => import('@/pages/Login/FindId.vue'),
        },
        {
          path: '/login/findPassword',
          component: () => import('@/pages/Login/FindPassword.vue'),
        },
        {
          path: '/login/signup',
          component: () => import('@/pages/Login/Signup.vue'),
        },
      ],
    },
    
    // 대출 상품 페이지 추가
    {
      path: '/loans',
      component: () => import('@/pages/Post/PostList.vue'),
    },

    // 정부 지원금 페이지 추가
    {
      path: '/policies',
      component: () => import('@/pages/Post/PostList.vue'),
    },

    // 상세 페이지들
    {
      path: '/loans/:id',
      component: () => import('@/pages/Post/LoanDetail.vue'),
    },
    {
      path: '/policies/:id',
      component: () => import('@/pages/Post/PolicyDetail.vue'),
    },
    /* 404 not found 페이지 */
    {
      path: '/:paths(.*)*',
      name: 'notFound',
      component: () => import('../pages/NotFound/NotFound.vue'), // NotFound 컴포넌트
    },
  ],
});

export default router;

