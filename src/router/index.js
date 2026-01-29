import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import CaixaView from '../views/CaixaView.vue'
import CozinhaView from '../views/CozinhaView.vue'
import DashboardView from '../views/DashboardView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/caixa',
    name: 'Caixa',
    component: CaixaView,
    meta: { requiresAuth: true, roles: ['caixa', 'master'] }
  },
  {
    path: '/cozinha',
    name: 'Cozinha',
    component: CozinhaView,
    meta: { requiresAuth: true, roles: ['cozinha', 'master'] }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, roles: ['master'] }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard de navegação
router.beforeEach(async (to, from, next) => {
  // Inicializa o auth store se necessário
  if (!authStore.user) {
    await authStore.init()
  }

  const requiresAuth = to.meta.requiresAuth
  const allowedRoles = to.meta.roles

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (requiresAuth && allowedRoles && !allowedRoles.includes(authStore.role)) {
    // Redireciona para a rota correta baseada na role
    if (authStore.role === 'caixa') {
      next('/caixa')
    } else if (authStore.role === 'cozinha') {
      next('/cozinha')
    } else if (authStore.role === 'master') {
      next('/dashboard')
    } else {
      next('/login')
    }
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    // Se já está logado, redireciona para a rota correta
    if (authStore.role === 'caixa') {
      next('/caixa')
    } else if (authStore.role === 'cozinha') {
      next('/cozinha')
    } else if (authStore.role === 'master') {
      next('/dashboard')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
