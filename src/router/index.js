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
          component: () => import('@/pages/Login/findId.vue'),
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

    /* 404 not found 페이지 */
    {
      path: '/:paths(.*)*',
      name: 'notFound',
      component: () => import('../pages/NotFound/NotFound.vue'), // NotFound 컴포넌트
    },
  ],
});

export default router;

