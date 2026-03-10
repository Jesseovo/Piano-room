import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    // ===== 前台路由 =====
    {
      path: '/',
      component: () => import('@/layouts/FrontLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/front/home/Index.vue'),
        },
        {
          path: 'rooms',
          name: 'rooms',
          component: () => import('@/views/front/rooms/Index.vue'),
        },
        {
          path: 'rooms/:id',
          name: 'roomDetail',
          component: () => import('@/views/front/rooms/Detail.vue'),
        },
        {
          path: 'reservations/create/:roomId?',
          name: 'createReservation',
          component: () => import('@/views/front/reservations/Create.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'my-reservations',
          name: 'myReservations',
          component: () => import('@/views/front/reservations/MyReservations.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'reservations/:id',
          name: 'reservationDetail',
          component: () => import('@/views/front/reservations/Detail.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/front/profile/Index.vue'),
          meta: { requiresAuth: true },
        },
        {
          path: 'help',
          name: 'help',
          component: () => import('@/views/front/help/Index.vue'),
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('@/views/front/about/Index.vue'),
        },
      ],
    },

    // ===== 认证路由（独立布局）=====
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/Register.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: () => import('@/views/auth/ForgotPassword.vue'),
    },

    // ===== 后台管理路由（去掉部门/类型管理）=====
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      redirect: '/admin/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'adminDashboard',
          component: () => import('@/views/admin/dashboard/Index.vue'),
          meta: { title: '仪表盘' },
        },
        {
          path: 'rooms',
          name: 'adminRooms',
          component: () => import('@/views/admin/rooms/Index.vue'),
          meta: { title: '琴房管理' },
        },
        {
          path: 'reservations',
          name: 'adminReservations',
          component: () => import('@/views/admin/reservations/Index.vue'),
          meta: { title: '预约管理' },
        },
        {
          path: 'users',
          name: 'adminUsers',
          component: () => import('@/views/admin/users/Index.vue'),
          meta: { title: '用户管理' },
        },
        {
          path: 'statistics',
          name: 'adminStatistics',
          component: () => import('@/views/admin/statistics/Index.vue'),
          meta: { title: '数据统计' },
        },
        {
          path: 'maintenance',
          name: 'adminMaintenance',
          component: () => import('@/views/admin/maintenance/Index.vue'),
          meta: { title: '维修管理' },
        },
        {
          path: 'practice-duration',
          name: 'adminPracticeDuration',
          component: () => import('@/views/admin/practiceDuration/Index.vue'),
          meta: { title: '时长管理' },
        },
        {
          path: 'operation-logs',
          name: 'adminOperationLogs',
          component: () => import('@/views/admin/operationLogs/Index.vue'),
          meta: { title: '操作日志' },
        },
        {
          path: 'admins',
          name: 'adminAdmins',
          component: () => import('@/views/admin/admins/Index.vue'),
          meta: { title: '管理员管理', requiresSuperAdmin: true },
        },
        {
          path: 'settings',
          name: 'adminSettings',
          component: () => import('@/views/admin/settings/Index.vue'),
          meta: { title: '系统设置' },
        },
        {
          path: 'profile',
          name: 'adminProfile',
          component: () => import('@/views/admin/profile/Index.vue'),
          meta: { title: '个人中心' },
        },
      ],
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'notFound',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
})

router.beforeEach((to, _from) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'home' }
  }
})

export default router
