import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/ceramic/'),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: { title: '产品图生成' },
    },
    {
      path: '/detail',
      name: 'Detail',
      component: () => import('@/views/Detail.vue'),
      meta: { title: '详情页生成' },
    },
    {
      path: '/assets',
      name: 'Assets',
      component: () => import('@/views/Assets.vue'),
      meta: { title: '素材库' },
    },
    {
      path: '/history',
      name: 'History',
      component: () => import('@/views/History.vue'),
      meta: { title: '历史记录' },
    },
    {
      path: '/user',
      name: 'User',
      component: () => import('@/views/User.vue'),
      meta: { title: '用户中心' },
    },
  ],
})

router.beforeEach((to) => {
  document.title = `${to.meta.title || '陶瓷AI视觉工厂'} - 陶瓷AI视觉工厂`
})

export default router
