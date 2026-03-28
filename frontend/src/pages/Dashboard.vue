<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <h1>Welcome back, {{ authStore.user?.firstName || 'User' }} 👋</h1>
        <p class="subtitle">
          {{ authStore.user?.role === 'admin' ? 'Administrator' : 'Employee' }} &mdash;
          {{ today }}
        </p>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-icon" style="background: #e8f4ff;">📋</div>
        <div>
          <h3>Today's Tasks</h3>
          <p class="value">0</p>
          <p class="card-note">No tasks logged yet</p>
        </div>
      </div>

      <div class="card" v-if="authStore.user?.role === 'admin'">
        <div class="card-icon" style="background: #e8fff4;">👥</div>
        <div>
          <h3>Active Employees</h3>
          <p class="value">{{ stats.activeEmployees ?? '—' }}</p>
          <p class="card-note">Currently active staff</p>
        </div>
      </div>

      <div class="card">
        <div class="card-icon" style="background: #fff4e8;">💰</div>
        <div>
          <h3>Today's Revenue</h3>
          <p class="value">₹0</p>
          <p class="card-note">No sales recorded yet</p>
        </div>
      </div>

      <div class="card">
        <div class="card-icon" style="background: #f4e8ff;">✅</div>
        <div>
          <h3>Services Completed</h3>
          <p class="value">0</p>
          <p class="card-note">This month</p>
        </div>
      </div>
    </div>

    <div class="quick-actions" v-if="authStore.user?.role === 'admin'">
      <h2>Quick Actions</h2>
      <div class="actions-row">
        <router-link to="/employees" class="action-btn">
          <span>👥</span> Manage Employees
        </router-link>
        <router-link to="/services" class="action-btn">
          <span>✂️</span> Manage Services
        </router-link>
        <router-link to="/tasks" class="action-btn">
          <span>📋</span> View All Tasks
        </router-link>
      </div>
    </div>

    <div class="quick-actions" v-else>
      <h2>Quick Actions</h2>
      <div class="actions-row">
        <router-link to="/tasks" class="action-btn primary">
          <span>➕</span> Log New Task
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import userService from '../services/userService';

const authStore = useAuthStore();
const stats = reactive({ activeEmployees: null });

const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

onMounted(async () => {
  if (authStore.user?.role === 'admin') {
    try {
      const res = await userService.getStats();
      stats.activeEmployees = res.data.activeEmployees;
    } catch (e) {
      // stats remain null — will show '—'
    }
  }
});
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.8rem;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.card-icon {
  font-size: 1.5rem;
  padding: 0.6rem;
  border-radius: 8px;
  min-width: 48px;
  text-align: center;
}

.card h3 {
  margin: 0 0 0.25rem 0;
  color: #555;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card .value {
  margin: 0 0 0.25rem 0;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}

.card-note {
  margin: 0;
  font-size: 0.78rem;
  color: #999;
}

.quick-actions {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.quick-actions h2 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #333;
}

.actions-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: #f0f0f0;
  color: #333;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #e0e0e0;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.primary:hover {
  background: #5568d3;
}
</style>

