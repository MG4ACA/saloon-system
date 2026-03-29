<template>
  <div id="app" @click.self="closeMobileNav">
    <!-- Navigation bar -->
    <nav v-if="isAuthenticated" class="app-navbar">
      <div class="nav-brand">
        <img src="/logo.png" alt="Salon POS Logo" class="brand-logo" />
        <span class="brand-name">Salon POS</span>
      </div>

      <!-- Desktop nav links -->
      <div class="nav-links desktop-only">
        <router-link to="/dashboard" class="nav-link" active-class="active" aria-label="Dashboard">
          <i class="pi pi-home" />
          Dashboard
        </router-link>
        <router-link to="/tasks" class="nav-link" active-class="active" aria-label="Tasks">
          <i class="pi pi-list" />
          Tasks
        </router-link>
        <router-link
          to="/commissions"
          class="nav-link"
          active-class="active"
          aria-label="Commissions"
        >
          <i class="pi pi-wallet" />
          Commissions
        </router-link>
        <template v-if="isAdmin">
          <router-link to="/employees" class="nav-link" active-class="active">
            <i class="pi pi-users" />
            Employees
          </router-link>
          <router-link to="/service-categories" class="nav-link" active-class="active">
            <i class="pi pi-tags" />
            Categories
          </router-link>
          <router-link to="/services" class="nav-link" active-class="active">
            <i class="pi pi-star" />
            Services
          </router-link>
          <router-link to="/packages" class="nav-link" active-class="active">
            <i class="pi pi-box" />
            Packages
          </router-link>
          <router-link to="/reports" class="nav-link" active-class="active">
            <i class="pi pi-chart-bar" />
            Reports
          </router-link>
        </template>
      </div>

      <div class="nav-user">
        <span class="user-name desktop-only">
          {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
        </span>
        <span class="user-role desktop-only">{{ authStore.user?.role }}</span>
        <Button
          label="Logout"
          icon="pi pi-sign-out"
          severity="danger"
          size="small"
          outlined
          @click="logout"
          class="desktop-only"
          aria-label="Logout"
        />
        <!-- Mobile: icon-only logout always visible -->
        <Button
          icon="pi pi-sign-out"
          severity="danger"
          text
          rounded
          @click="logout"
          class="mobile-only mobile-logout-btn"
          aria-label="Logout"
        />
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
      <div
        v-if="isAuthenticated && mobileNavOpen"
        class="mobile-nav-panel"
        role="navigation"
        aria-label="Mobile menu"
      >
        <router-link to="/dashboard" class="mobile-nav-link" @click="closeMobileNav">
          <i class="pi pi-home" />
          Dashboard
        </router-link>
        <router-link to="/tasks" class="mobile-nav-link" @click="closeMobileNav">
          <i class="pi pi-list" />
          Tasks
        </router-link>
        <router-link to="/commissions" class="mobile-nav-link" @click="closeMobileNav">
          <i class="pi pi-wallet" />
          Commissions
        </router-link>
        <template v-if="isAdmin">
          <router-link to="/employees" class="mobile-nav-link" @click="closeMobileNav">
            <i class="pi pi-users" />
            Employees
          </router-link>
          <router-link to="/service-categories" class="mobile-nav-link" @click="closeMobileNav">
            <i class="pi pi-tags" />
            Categories
          </router-link>
          <router-link to="/services" class="mobile-nav-link" @click="closeMobileNav">
            <i class="pi pi-star" />
            Services
          </router-link>
          <router-link to="/packages" class="mobile-nav-link" @click="closeMobileNav">
            <i class="pi pi-box" />
            Packages
          </router-link>
          <router-link to="/reports" class="mobile-nav-link" @click="closeMobileNav">
            <i class="pi pi-chart-bar" />
            Reports
          </router-link>
        </template>
        <div class="mobile-nav-user">
          <span>{{ authStore.user?.firstName }} {{ authStore.user?.lastName }}</span>
          <span class="user-role">{{ authStore.user?.role }}</span>
          <Button
            label="Logout"
            icon="pi pi-sign-out"
            severity="danger"
            size="small"
            outlined
            @click="logout"
          />
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
      <button
        class="bottom-nav-item"
        :class="{ active: mobileNavOpen }"
        @click.stop="mobileNavOpen = !mobileNavOpen"
        aria-label="More menu"
      >
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

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const isAdmin = computed(() => authStore.user?.role === 'admin');
const mobileNavOpen = ref(false);

const closeMobileNav = () => {
  mobileNavOpen.value = false;
};
// Auto-close on route change
watch(() => route.path, closeMobileNav);

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--p-font-family, 'Inter', 'Segoe UI', system-ui, sans-serif);
  background: var(--clr-bg-body, #fff9f9);
  color: var(--clr-text-primary, #4a1d1d);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Navbar ────────────────────────────────────────────────── */
.app-navbar {
  position: sticky;
  top: 0;
  z-index: 200;
  background: var(--grad-nav, linear-gradient(to bottom, #fff1f1, #fce4e4));
  color: var(--clr-text-primary, #4a1d1d);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem;
  height: 64px;
  box-shadow: var(--shadow-nav, 0 2px 16px rgba(238, 134, 134, 0.18));
  border-bottom: 1px solid var(--clr-border, #f5c6c6);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
.brand-logo {
  height: 38px;
  width: 38px;
  object-fit: contain;
  border-radius: 50%;
  padding: 2px;
  background: var(--clr-highlight, #fadadd);
}
.brand-name {
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 0.02em;
  white-space: nowrap;
  color: var(--clr-text-primary, #4a1d1d);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  flex: 1;
  overflow-x: auto;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.9rem;
  border-radius: 8px;
  color: var(--clr-text-secondary, #945f5f);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  transition:
    background 0.18s,
    color 0.18s;
}
.nav-link:hover {
  background: var(--clr-highlight, #fadadd);
  color: var(--clr-primary, #ee8686);
}
.nav-link.active {
  background: var(--clr-primary, #ee8686);
  color: #ffffff;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  margin-left: auto;
}
.user-name {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--clr-text-primary, #4a1d1d);
}
.user-role {
  font-size: 0.72rem;
  background: var(--clr-highlight, #fadadd);
  padding: 0.18rem 0.6rem;
  border-radius: 20px;
  color: var(--clr-primary, #ee8686);
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid var(--clr-border, #f5c6c6);
}

/* Mobile logout icon */
.mobile-logout-btn {
  color: var(--clr-primary-dark, #d97373) !important;
}

/* Hamburger */
.hamburger {
  background: transparent;
  border: 1px solid var(--clr-border, #f5c6c6);
  color: var(--clr-text-primary, #4a1d1d);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 8px;
  display: none;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  transition:
    background 0.18s,
    border-color 0.18s;
}
.hamburger:hover {
  background: var(--clr-highlight, #fadadd);
  border-color: var(--clr-primary, #ee8686);
}

/* Mobile nav panel */
.mobile-nav-panel {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  background: linear-gradient(to bottom, #fff1f1, #fceaea);
  z-index: 190;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 1rem 1rem;
  box-shadow: 0 8px 24px rgba(238, 134, 134, 0.2);
  border-top: 1px solid var(--clr-border, #f5c6c6);
}
.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.8rem 0.6rem;
  color: var(--clr-text-secondary, #945f5f);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  border-bottom: 1px solid var(--clr-border, #f5c6c6);
  transition:
    color 0.18s,
    background 0.18s;
  border-radius: 8px;
}
.mobile-nav-link:last-of-type {
  border-bottom: none;
}
.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  color: var(--clr-primary, #ee8686);
  background: var(--clr-highlight, #fadadd);
}
.mobile-nav-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.75rem;
  flex-wrap: wrap;
  border-top: 1px solid var(--clr-border, #f5c6c6);
  margin-top: 0.5rem;
}
.mobile-nav-user span {
  color: var(--clr-text-secondary, #945f5f);
  font-size: 0.875rem;
  font-weight: 600;
}

/* Slide transition */
.mobile-nav-enter-active,
.mobile-nav-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.mobile-nav-enter-from,
.mobile-nav-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive breakpoint */
@media (max-width: 768px) {
  .desktop-only {
    display: none !important;
  }
  .hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
@media (min-width: 769px) {
  .mobile-only {
    display: none !important;
  }
  .mobile-nav-panel {
    display: none !important;
  }
  .bottom-nav {
    display: none !important;
  }
}

/* Bottom navigation bar */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background: linear-gradient(to top, #fce4e4, #fff1f1);
  display: flex;
  border-top: 1px solid var(--clr-border, #f5c6c6);
  box-shadow: 0 -4px 16px rgba(238, 134, 134, 0.15);
  height: 62px;
}
.bottom-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--clr-text-muted, #bf8a8a);
  text-decoration: none;
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.18s;
}
.bottom-nav-item i {
  font-size: 1.15rem;
}
.bottom-nav-item:hover,
.bottom-nav-item.active,
.bottom-nav-item.router-link-active {
  color: var(--clr-primary, #ee8686);
}

main {
  flex: 1;
  padding: 2rem;
}
main.with-nav {
  min-height: calc(100vh - 64px);
}

@media (max-width: 768px) {
  main {
    padding: 1rem 1rem 80px;
  }
}
</style>
