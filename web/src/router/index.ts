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
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('@/views/admin/AdminLayout.vue'),
      meta: { title: '管理后台' },
      redirect: '/admin/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/Dashboard.vue'),
          meta: { title: '数据统计' },
        },
        {
          path: 'users',
          name: 'AdminUsers',
          component: () => import('@/views/admin/UserList.vue'),
          meta: { title: '用户管理' },
        },
        {
          path: 'tasks',
          name: 'AdminTasks',
          component: () => import('@/views/admin/TaskList.vue'),
          meta: { title: '任务管理' },
        },
        {
          path: 'scenes',
          name: 'AdminScenes',
          component: () => import('@/views/admin/SceneList.vue'),
          meta: { title: '场景管理' },
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  document.title = `${to.meta.title || '陶瓷AI视觉工厂'} - 陶瓷AI视觉工厂`
})

export default router
