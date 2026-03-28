<template>
  <div id="app">
    <!-- Navigation bar -->
    <nav v-if="isAuthenticated" class="app-navbar">
      <div class="nav-brand">
        <span class="brand-icon">✂️</span>
        <span class="brand-name">Salon POS</span>
      </div>

      <div class="nav-links">
        <router-link to="/dashboard" class="nav-link" active-class="active">
          <i class="pi pi-home" /> Dashboard
        </router-link>
        <router-link to="/tasks" class="nav-link" active-class="active">
          <i class="pi pi-list" /> Tasks
        </router-link>
        <template v-if="isAdmin">
          <router-link to="/employees" class="nav-link" active-class="active">
            <i class="pi pi-users" /> Employees
          </router-link>
          <router-link to="/service-categories" class="nav-link" active-class="active">
            <i class="pi pi-tags" /> Categories
          </router-link>
          <router-link to="/services" class="nav-link" active-class="active">
            <i class="pi pi-star" /> Services
          </router-link>
          <router-link to="/packages" class="nav-link" active-class="active">
            <i class="pi pi-box" /> Packages
          </router-link>
          <router-link to="/reports" class="nav-link" active-class="active">
            <i class="pi pi-chart-bar" /> Reports
          </router-link>
        </template>
      </div>

      <div class="nav-user">
        <span class="user-name">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
        <span class="user-role">{{ authStore.user?.role }}</span>
        <Button label="Logout" icon="pi pi-sign-out" severity="danger" size="small" outlined @click="logout" />
      </div>
    </nav>

    <!-- Main page content -->
    <main :class="{ 'with-nav': isAuthenticated }">
      <router-view />
    </main>

    <!-- Global overlays -->
    <Toast position="top-right" />
    <ConfirmDialog />
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.user?.role === 'admin');

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--p-font-family, 'Inter', sans-serif);
  background: #f5f6fa;
  color: #333;
  min-height: 100vh;
}

#app { min-height: 100vh; display: flex; flex-direction: column; }

/* Navbar */
.app-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #1e1e2e;
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;
  height: 60px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.2);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
.brand-icon { font-size: 1.4rem; }
.brand-name { font-weight: 700; font-size: 1.1rem; letter-spacing: 0.02em; white-space: nowrap; }

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  overflow-x: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}
.nav-link:hover { background: rgba(255,255,255,0.1); color: white; }
.nav-link.active { background: rgba(102,126,234,0.35); color: #a5b4fc; }

.nav-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  margin-left: auto;
}
.user-name { font-size: 0.875rem; font-weight: 600; color: white; }
.user-role {
  font-size: 0.72rem;
  background: rgba(255,255,255,0.15);
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  color: rgba(255,255,255,0.7);
  text-transform: capitalize;
}

main {
  flex: 1;
  padding: 2rem;
}
main.with-nav { min-height: calc(100vh - 60px); }
</style>

