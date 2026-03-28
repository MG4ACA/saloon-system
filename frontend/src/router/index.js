import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../pages/Tasks.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../pages/Reports.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/employees',
    name: 'Employees',
    component: () => import('../pages/Employees.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('../pages/Services.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    next('/dashboard');
  } else {
    next();
  }
});

export default router;
