<template>
  <div id="app" @click.self="closeMobileNav">
    <!-- Navigation bar -->
    <nav v-if="isAuthenticated" class="app-navbar">
      <div class="nav-brand">
        <span class="brand-icon">✂️</span>
        <span class="brand-name">Salon POS</span>
      </div>

      <!-- Desktop nav links -->
      <div class="nav-links desktop-only">
        <router-link to="/dashboard" class="nav-link" active-class="active" aria-label="Dashboard">
          <i class="pi pi-home" /> Dashboard
        </router-link>
        <router-link to="/tasks" class="nav-link" active-class="active" aria-label="Tasks">
          <i class="pi pi-list" /> Tasks
        </router-link>
        <router-link to="/commissions" class="nav-link" active-class="active" aria-label="Commissions">
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
        <span class="user-name desktop-only">{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
        <span class="user-role desktop-only">{{ authStore.user?.role }}</span>
        <Button label="Logout" icon="pi pi-sign-out" severity="danger" size="small" outlined @click="logout" class="desktop-only" aria-label="Logout" />
        <!-- Mobile: icon-only logout always visible -->
        <Button icon="pi pi-sign-out" severity="danger" text rounded @click="logout" class="mobile-only mobile-logout-btn" aria-label="Logout" />
        <!-- Hamburger button — mobile only -->
        <button
          class="hamburger mobile-only"
          :aria-expanded="mobileNavOpen"
          aria-label="Toggle navigation"
          @click.stop="mobileNavOpen = !mobileNavOpen"
        >
          <i :class="mobileNavOpen ? 'pi pi-times' : 'pi pi-bars'" />
        </button>
      </div>
    </nav>

    <!-- Mobile slide-down nav -->
    <Transition name="mobile-nav">
      <div v-if="isAuthenticated && mobileNavOpen" class="mobile-nav-panel" role="navigation" aria-label="Mobile menu">
        <router-link to="/dashboard"      class="mobile-nav-link" @click="closeMobileNav"><i class="pi pi-home" /> Dashboard</router-link>
        <router-link to="/tasks"          class="mobile-nav-link" @click="closeMobileNav"><i class="pi pi-list" /> Tasks</router-link>
        <router-link to="/commissions"    class="mobile-nav-link" @click="closeMobileNav"><i class="pi pi-wallet" /> Commissions</router-link>
        <template v-if="isAdmin">
          <router-link to="/employees"        class="mobile-nav-link" @click="closeMobileNav"><i class="pi pi-users" /> Employees</router-link>
          <router-link to="/service-categories" class="mobile-nav-link" @click="closeMobileNav"><i class="pi pi-tags" /> Categories</router-link>
          <router-link to="/services"         class="mobile-nav-link" @click="closeMobileNav"><i class="pi pi-star" /> Services</router-link>
          <router-link to="/packages"         class="mobile-nav-link" @click="closeMobileNav"><i class="pi pi-box" /> Packages</router-link>
          <router-link to="/reports"          class="mobile-nav-link" @click="closeMobileNav"><i class="pi pi-chart-bar" /> Reports</router-link>
        </template>
        <div class="mobile-nav-user">
          <span>{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
          <span class="user-role">{{ authStore.user?.role }}</span>
          <Button label="Logout" icon="pi pi-sign-out" severity="danger" size="small" outlined @click="logout" />
        </div>
      </div>
    </Transition>

    <!-- Bottom nav — mobile only -->
    <nav v-if="isAuthenticated" class="bottom-nav mobile-only" aria-label="Bottom navigation">
      <router-link to="/dashboard" class="bottom-nav-item" active-class="active">
        <i class="pi pi-home" />
        <span>Home</span>
      </router-link>
      <router-link to="/tasks" class="bottom-nav-item" active-class="active">
        <i class="pi pi-list" />
        <span>Tasks</span>
      </router-link>
      <router-link to="/commissions" class="bottom-nav-item" active-class="active">
        <i class="pi pi-wallet" />
        <span>Commission</span>
      </router-link>
      <button class="bottom-nav-item" :class="{ active: mobileNavOpen }" @click.stop="mobileNavOpen = !mobileNavOpen" aria-label="More menu">
        <i :class="mobileNavOpen ? 'pi pi-times' : 'pi pi-th-large'" />
        <span>More</span>
      </button>
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
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router    = useRouter();
const route     = useRoute();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin         = computed(() => authStore.user?.role === 'admin');
const mobileNavOpen   = ref(false);

const closeMobileNav = () => { mobileNavOpen.value = false; };
// Auto-close on route change
watch(() => route.path, closeMobileNav);

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
  z-index: 200;
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

/* Mobile logout icon */
.mobile-logout-btn {
  color: #f87171 !important;
}

/* Hamburger */
.hamburger {
  background: transparent;
  border: none;
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  display: none;
  min-width: 44px;
  min-height: 44px;
  transition: background 0.15s;
}
.hamburger:hover { background: rgba(255,255,255,0.15); }

/* Mobile nav panel */
.mobile-nav-panel {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background: #1e1e2e;
  z-index: 190;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem 1rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  border-top: 1px solid rgba(255,255,255,0.1);
}
.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 0.5rem;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  transition: color 0.15s;
}
.mobile-nav-link:hover, .mobile-nav-link.router-link-active { color: #a5b4fc; }
.mobile-nav-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.75rem;
  flex-wrap: wrap;
}
.mobile-nav-user span { color: rgba(255,255,255,0.75); font-size: 0.875rem; }

/* Slide transition */
.mobile-nav-enter-active, .mobile-nav-leave-active { transition: opacity 0.2s, transform 0.2s; }
.mobile-nav-enter-from, .mobile-nav-leave-to { opacity: 0; transform: translateY(-8px); }

/* Responsive breakpoint */
@media (max-width: 768px) {
  .desktop-only { display: none !important; }
  .hamburger    { display: flex; align-items: center; justify-content: center; }
}
@media (min-width: 769px) {
  .mobile-only  { display: none !important; }
  .mobile-nav-panel { display: none !important; }
  .bottom-nav   { display: none !important; }
}

/* Bottom navigation bar */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background: #1e1e2e;
  display: flex;
  border-top: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 -4px 16px rgba(0,0,0,0.25);
  height: 60px;
}
.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: rgba(255,255,255,0.55);
  text-decoration: none;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}.bottom-nav-item i { font-size: 1.1rem; }
.bottom-nav-item:hover, .bottom-nav-item.active { color: #a5b4fc; }

main {
  flex: 1;
  padding: 2rem;
}
main.with-nav { min-height: calc(100vh - 60px); }

@media (max-width: 768px) {
  main { padding: 1rem 1rem 80px; /* extra bottom padding for bottom nav */ }
}
</style>

