<template>
  <div class="dashboard-page">
    <!-- Welcome Header -->
    <div class="flex align-items-center justify-content-between mb-4">
      <div>
        <h1 class="text-3xl font-bold text-900 mb-1">
          Welcome back, {{ authStore.user?.firstName || 'User' }} 👋
        </h1>
        <p class="text-600 m-0">
          {{ authStore.user?.role === 'admin' ? 'Administrator' : 'Employee' }}
          &nbsp;&mdash;&nbsp;{{ today }}
        </p>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid mb-4">
      <div class="col-12 md:col-6 lg:col-3">
        <div class="stat-card">
          <div class="stat-icon" style="background:#e8f4ff">📋</div>
          <div>
            <div class="stat-label">TODAY'S TASKS</div>
            <div class="stat-value">{{ summary.todayCount ?? '—' }}</div>
            <div class="stat-note">{{ summary.completedCount ?? 0 }} completed</div>
          </div>
        </div>
      </div>

      <div v-if="authStore.user?.role === 'admin'" class="col-12 md:col-6 lg:col-3">
        <div class="stat-card">
          <div class="stat-icon" style="background:#e8fff4">👥</div>
          <div>
            <div class="stat-label">ACTIVE EMPLOYEES</div>
            <div class="stat-value">{{ stats.activeEmployees ?? '—' }}</div>
            <div class="stat-note">Currently active staff</div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="stat-card">
          <div class="stat-icon" style="background:#fff4e8">💰</div>
          <div>
            <div class="stat-label">TODAY'S REVENUE</div>
            <div class="stat-value">₹{{ Number(summary.todayRevenue ?? 0).toFixed(0) }}</div>
            <div class="stat-note">From {{ summary.todayCount ?? 0 }} tasks today</div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="stat-card">
          <div class="stat-icon" style="background:#f4e8ff">✅</div>
          <div>
            <div class="stat-label">SERVICES THIS MONTH</div>
            <div class="stat-value">0</div>
            <div class="stat-note">Completed services</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <Card>
      <template #title>Quick Actions</template>
      <template #content>
        <div class="flex gap-3 flex-wrap">
          <template v-if="authStore.user?.role === 'admin'">
            <Button as="router-link" to="/employees" label="Manage Employees" icon="pi pi-users" severity="secondary" outlined />
            <Button as="router-link" to="/services" label="Manage Services" icon="pi pi-star" severity="secondary" outlined />
            <Button as="router-link" to="/packages" label="Manage Packages" icon="pi pi-box" severity="secondary" outlined />
          </template>
          <Button as="router-link" to="/tasks" label="Log Task" icon="pi pi-plus" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import Card from 'primevue/card';
import { onMounted, reactive } from 'vue';
import { useAuthStore } from '../stores/auth';
import taskService from '../services/taskService';
import userService from '../services/userService';

const authStore = useAuthStore();
const stats   = reactive({ activeEmployees: null });
const summary = reactive({ todayCount: null, todayRevenue: 0, completedCount: 0 });

const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

onMounted(async () => {
  const calls = [];

  // Fetch today's task summary for everyone
  calls.push(
    taskService.getTaskSummary()
      .then((res) => { Object.assign(summary, res.data.summary); })
      .catch(() => {})
  );

  if (authStore.user?.role === 'admin') {
    calls.push(
      userService.getStats()
        .then((res) => { stats.activeEmployees = res.data.activeEmployees; })
        .catch(() => {})
    );
  }

  await Promise.all(calls);
});
</script>


<style scoped>
.dashboard-page { max-width: 1200px; margin: 0 auto; }

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  height: 100%;
}

.stat-icon {
  font-size: 1.4rem;
  padding: 0.6rem;
  border-radius: 8px;
  min-width: 48px;
  text-align: center;
  flex-shrink: 0;
}

.stat-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #888;
  letter-spacing: 0.06em;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1e1e2e;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-note {
  font-size: 0.76rem;
  color: #aaa;
}
</style>
