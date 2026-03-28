<template>
  <div id="app">
    <!-- Navigation bar -->
    <nav v-if="isAuthenticated" class="app-navbar">
      <div class="nav-brand">
        <span class="brand-icon">✂️</span>
        <span class="brand-name">Salon POS</span>
      </div>

      <!-- Desktop nav links -->
      <div class="nav-links desktop-nav">
        <router-link to="/dashboard" class="nav-link" active-class="active">
          <i class="pi pi-home" /> Dashboard
        </router-link>
        <router-link to="/tasks" class="nav-link" active-class="active">
          <i class="pi pi-list" /> Tasks
        </router-link>
        <router-link to="/commissions" class="nav-link" active-class="active">
          <i class="pi pi-wallet" /> Commissions
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
        <Button label="Logout" icon="pi pi-sign-out" severity="danger" size="small" outlined @click="logout" class="desktop-logout" />
        <!-- Hamburger -->
        <button class="hamburger" :aria-expanded="mobileOpen" aria-label="Toggle navigation" @click="mobileOpen = !mobileOpen">
          <i :class="mobileOpen ? 'pi pi-times' : 'pi pi-bars'" />
        </button>
      </div>
    </nav>

    <!-- Mobile slide-down nav -->
    <Transition name="mobile-nav">
      <div v-if="isAuthenticated && mobileOpen" class="mobile-nav-drawer" @click.self="mobileOpen = false">
        <div class="mobile-nav-links">
          <router-link to="/dashboard"      class="mobile-link" @click="mobileOpen = false"><i class="pi pi-home" /> Dashboard</router-link>
          <router-link to="/tasks"          class="mobile-link" @click="mobileOpen = false"><i class="pi pi-list" /> Tasks</router-link>
          <router-link to="/commissions"    class="mobile-link" @click="mobileOpen = false"><i class="pi pi-wallet" /> Commissions</router-link>
          <template v-if="isAdmin">
            <router-link to="/employees"        class="mobile-link" @click="mobileOpen = false"><i class="pi pi-users" /> Employees</router-link>
            <router-link to="/service-categories" class="mobile-link" @click="mobileOpen = false"><i class="pi pi-tags" /> Categories</router-link>
            <router-link to="/services"         class="mobile-link" @click="mobileOpen = false"><i class="pi pi-star" /> Services</router-link>
            <router-link to="/packages"         class="mobile-link" @click="mobileOpen = false"><i class="pi pi-box" /> Packages</router-link>
            <router-link to="/reports"          class="mobile-link" @click="mobileOpen = false"><i class="pi pi-chart-bar" /> Reports</router-link>
          </template>
          <button class="mobile-link logout-mobile" @click="logout"><i class="pi pi-sign-out" /> Logout</button>
        </div>
      </div>
    </Transition>

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
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router    = useRouter();
const route     = useRoute();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin         = computed(() => authStore.user?.role === 'admin');
const mobileOpen      = ref(false);

// Close mobile nav on route change
watch(() => route.path, () => { mobileOpen.value = false; });

const logout = () => {
  authStore.logout();
  mobileOpen.value = false;
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

/* ── Mobile nav ─────────────────────────────────────────────── */
.hamburger {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  transition: background 0.15s;
}
.hamburger:hover { background: rgba(255,255,255,0.12); }

.mobile-nav-drawer {
  position: fixed;
  top: 60px;
  left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.45);
  z-index: 99;
}
.mobile-nav-links {
  background: #1e1e2e;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.mobile-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.5rem;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: background 0.15s;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
}
.mobile-link:hover, .mobile-link.active { background: rgba(255,255,255,0.08); color: white; }
.logout-mobile { color: #f87171; }

.mobile-nav-enter-active, .mobile-nav-leave-active { transition: opacity 0.2s; }
.mobile-nav-enter-from, .mobile-nav-leave-to { opacity: 0; }

@media (max-width: 767px) {
  .desktop-nav, .user-name, .user-role, .desktop-logout { display: none !important; }
  .hamburger { display: flex; align-items: center; }
  .nav-user { margin-left: auto; }
}

main {
  flex: 1;
  padding: 2rem;
}
main.with-nav { min-height: calc(100vh - 60px); }
