import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    meta: { requiresAuth: true },
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '数据看板', icon: 'DataBoard' }
      },
      {
        path: 'levels',
        name: 'LevelList',
        component: () => import('../views/LevelList.vue'),
        meta: { title: '关卡管理', icon: 'Grid' }
      },
      {
        path: 'levels/create',
        name: 'LevelCreate',
        component: () => import('../views/LevelEdit.vue'),
        meta: { title: '创建关卡', hidden: true }
      },
      {
        path: 'levels/:id/edit',
        name: 'LevelEdit',
        component: () => import('../views/LevelEdit.vue'),
        meta: { title: '编辑关卡', hidden: true }
      },
      {
        path: 'players',
        name: 'PlayerList',
        component: () => import('../views/PlayerList.vue'),
        meta: { title: '玩家管理', icon: 'User' }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../views/Settings.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth !== false && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && token) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
