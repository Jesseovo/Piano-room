import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  //前台
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "front" */ '../views/front/home/Index.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import(/* webpackChunkName: "auth" */ '../views/front/login/Index.vue')
  },
  {
    path: '/forgot-password',
    name: 'forgotPassword',//
    component: () => import(/* webpackChunkName: "auth" */ '../views/front/password/ForgotPassword.vue')
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    component: () => import(/* webpackChunkName: "auth" */ '../views/front/password/ResetPassword.vue')
  },
  // 教室预约相关路由
  {
    path: '/rooms',
    name: 'rooms',
    component: () => import(/* webpackChunkName: "rooms" */ '../views/front/rooms/Index.vue')
  },
  {
    path: '/rooms/detail/:id',
    name: 'roomDetail',
    component: () => import(/* webpackChunkName: "rooms" */ '../views/front/rooms/Detail.vue')
  },
  {
    path: '/reservations/create/:roomId',
    name: 'createReservation',
    component: () => import(/* webpackChunkName: "reservations" */ '../views/front/reservations/Create.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reservation/create',
    name: 'createReservationQuery',
    component: () => import(/* webpackChunkName: "reservations" */ '../views/front/reservations/Create.vue'),
    meta: { requiresAuth: true }
  },
  //我的预约
  {
    path: '/my-reservations',
    name: 'myReservations',
    component: () => import(/* webpackChunkName: "reservations" */ '../views/front/reservations/MyReservations.vue'),
    meta: { requiresAuth: true }
  },
  //预约详情
  {
    path: '/reservations/detail/:id',
    name: 'reservationDetail',
    component: () => import('../views/front/reservations/ReservationDetail.vue'),
    meta: { requiresAuth: true }
  },
  // 反馈、公告、注册功能已删除
  // 个人中心路由
  {
    path: '/profile',
    name: 'profile',
    component: () => import(/* webpackChunkName: "profile" */ '../views/front/profile/Index.vue'),
    meta: { requiresAuth: true }
  },
  // 帮助中心路由
  {
    path: '/help',
    name: 'help',
    component: () => import(/* webpackChunkName: "help" */ '../views/front/help/Index.vue')
  },
  // 关于我们路由
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/front/about/Index.vue')
  },

  
  //后台
  {
    path: '/admin',
    name: 'admin',
    redirect: '/admin/dashboard',
    component: () => import(/* webpackChunkName: "admin" */ '../views/admin/Index.vue'),
    children: [
      {
        path: 'dashboard',
        name: 'adminDashboard',
        component: () => import(/* webpackChunkName: "adminDashboard" */ '../views/admin/dashboard/Index.vue')
      },
      {
        path: 'departments',
        name: 'adminDepartments',
        component: () => import(/* webpackChunkName: "adminDepartments" */ '../views/admin/departments/Index.vue')
      },
      {
        path: 'rooms',
        name: 'adminRooms',
        component: () => import(/* webpackChunkName: "adminRooms" */ '../views/admin/rooms/Index.vue')
      },
      {
        path: 'reservations',
        name: 'adminReservations',
        component: () => import(/* webpackChunkName: "adminReservations" */ '../views/admin/reservations/Index.vue')
      },
      //{
      //  path: 'roomTypes',
      //  name: 'adminRoomTypes',
      //  component: () => import(/* webpackChunkName: "adminRoomTypes" */ '../views/admin/roomTypes/Index.vue')
      //},
      {
        path: 'users',
        name: 'adminUsers',
        component: () => import(/* webpackChunkName: "adminUsers" */ '../views/admin/users/Index.vue')
      },
      {
        path: 'statistics',
        name: 'adminStatistics',
        component: () => import(/* webpackChunkName: "adminStatistics" */ '../views/admin/statistics/Index.vue')
      },
      ////建筑类型管理
      //{
      //  path: 'buildings',
      //  name: 'adminBuildin//gs',
      //  component: () => import(/* webpackChunkName: "adminBuildings" */ '../views/admin/buildings/Index.vue')
      //},
      {
        path: 'profile',
        name: 'adminProfile',
        component: () => import(/* webpackChunkName: "adminProfile" */ '../views/admin/profile/Index.vue')
      },
      {
        path: 'settings',
        name: 'adminSettings',
        component: () => import(/* webpackChunkName: "adminSettings" */ '../views/admin/settings/Index.vue')
      },
      {
        path: 'operationLogs',
        name: 'AdminOperationLogs',
        component: () => import('@/views/admin/operationLogs/Index'),
        meta: { title: '操作日志', icon: 'el-icon-document', roles: ['admin'] }
      },
      {
        path: 'admins',
        name: 'AdminAdmins',
        component: () => import('@/views/admin/admins/Index'),
        meta: { title: '管理员管理', icon: 'el-icon-user-solid', roles: ['super_admin'] }
      },
      // 添加维修管理路由
      {
        path: 'maintenance',
        name: 'Maintenance',
        component: () => import('@/views/admin/maintenance/Index'),
        meta: { title: '维修管理', icon: 'el-icon-warning-outline' }
      },
      // 添加时长管理路由
      {
        path: 'practiceDuration',
        name: 'PracticeDuration',
        component: () => import('@/views/admin/practiceDuration/Index'),
        meta: { title: '时长管理', icon: 'el-icon-timer' }
      }
    ]
  }
]


// 全局处理NavigationDuplicated错误
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated') throw err
  })
}

const originalReplace = VueRouter.prototype.replace
VueRouter.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => {
    if (err.name !== 'NavigationDuplicated') throw err
  })
}
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior() {
    // 返回顶部
    return { x: 0, y: 0 }
  },
  routes
 
})



// router.afterEach(() => {
//   window.scrollTo(0, 0)
// })

// // 全局前置守卫
// router.beforeEach((to, from, next) => {
//   // 检查用户是否登录
//   const token = localStorage.getItem('token')
  
//   // 需要认证的页面
//   if (to.matched.some(record => record.meta.requiresAuth) && !token) {
//     // 未登录，重定向到登录页面
//     next({
//       path: '/login',
//       query: { redirect: to.fullPath } // 保存目标路由，登录后可以直接跳转
//     })
//   } else if (to.path.startsWith('/admin') && !token) {
//     // 如果是管理后台且未登录，重定向到登录页
//     next('/login')
//   } else {
//     next()
//   }
// })

export default router
