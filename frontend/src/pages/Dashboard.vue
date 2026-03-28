<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <div class="dashboard-grid">
      <div class="card">
        <h3>Today's Revenue</h3>
        <p class="value">₹0</p>
      </div>
      <div class="card">
        <h3>Services Completed</h3>
        <p class="value">0</p>
      </div>
      <div class="card">
        <h3>Active Employees</h3>
        <p class="value">0</p>
      </div>
      <div class="card">
        <h3>Total Tasks</h3>
        <p class="value">0</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()
const userName = computed(() => authStore.user?.name || 'User')
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard h1 {
  margin-bottom: 2rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card h3 {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
}

.card .value {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}
</style>
