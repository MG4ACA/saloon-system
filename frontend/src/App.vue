<template>
  <div id="app">
    <nav v-if="isAuthenticated" class="navbar">
      <div class="navbar-brand">
        <h1>Salon POS</h1>
      </div>
      <div class="navbar-menu">
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/tasks">Tasks</router-link>
        <router-link to="/reports" v-if="isAdmin">Reports</router-link>
        <router-link to="/employees" v-if="isAdmin">Employees</router-link>
        <button @click="logout">Logout</button>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
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

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: #333;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navbar-brand h1 {
  margin: 0;
  font-size: 1.5rem;
}

.navbar-menu {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.navbar-menu a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.navbar-menu a:hover {
  background: rgba(255, 255, 255, 0.1);
}

.navbar-menu a.router-link-active {
  background: #0066cc;
}

.navbar-menu button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

main {
  flex: 1;
  padding: 2rem;
}
</style>
