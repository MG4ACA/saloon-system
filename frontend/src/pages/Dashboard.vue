<template>
  <div class="dashboard-page">
    <!-- Welcome Header -->
    <div class="dashboard-header mb-4">
      <div>
        <h1 class="dashboard-greeting">
          Welcome back, {{ authStore.user?.firstName || 'User' }} 👋
        </h1>
        <p class="text-600 m-0 text-sm">
          {{ authStore.user?.role === 'admin' ? 'Administrator' : 'Employee' }}
          &nbsp;&mdash;&nbsp;{{ today }}
        </p>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid mb-4">
      <div class="col-12 md:col-6 lg:col-3">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div>
            <div class="stat-label">TODAY'S TASKS</div>
            <div class="stat-value">{{ summary.todayCount ?? '—' }}</div>
            <div class="stat-note">{{ summary.completedCount ?? 0 }} completed</div>
          </div>
        </div>
      </div>

      <div v-if="authStore.user?.role === 'admin'" class="col-12 md:col-6 lg:col-3">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div>
            <div class="stat-label">ACTIVE EMPLOYEES</div>
            <div class="stat-value">{{ stats.activeEmployees ?? '—' }}</div>
            <div class="stat-note">Currently active staff</div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div>
            <div class="stat-label">TODAY'S REVENUE</div>
            <div class="stat-value">LKR {{ Number(summary.todayRevenue ?? 0).toFixed(0) }}</div>
            <div class="stat-note">From {{ summary.todayCount ?? 0 }} tasks today</div>
          </div>
        </div>
      </div>

      <div class="col-12 md:col-6 lg:col-3">
        <div class="stat-card">
          <div class="stat-icon">🏅</div>
          <div>
            <div class="stat-label">THIS MONTH'S COMMISSION</div>
            <div class="stat-value">LKR {{ Number(commission.totalEarned ?? 0).toFixed(0) }}</div>
            <div class="stat-note">{{ commission.taskCount ?? 0 }} tasks completed</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <Card>
      <template #title>Quick Actions</template>
      <template #content>
        <div class="quick-actions-grid">
          <Button
            as="router-link"
            to="/tasks/new"
            label="New Task"
            icon="pi pi-plus"
            class="quick-action-btn"
          />
          <Button
            as="router-link"
            to="/tasks"
            label="View Tasks"
            icon="pi pi-list"
            severity="secondary"
            outlined
            class="quick-action-btn"
          />
          <template v-if="authStore.user?.role === 'admin'">
            <Button
              as="router-link"
              to="/employees"
              label="Employees"
              icon="pi pi-users"
              severity="secondary"
              outlined
              class="quick-action-btn"
            />
            <Button
              as="router-link"
              to="/services"
              label="Services"
              icon="pi pi-star"
              severity="secondary"
              outlined
              class="quick-action-btn"
            />
            <Button
              as="router-link"
              to="/packages"
              label="Packages"
              icon="pi pi-box"
              severity="secondary"
              outlined
              class="quick-action-btn"
            />
            <Button
              as="router-link"
              to="/reports"
              label="Reports"
              icon="pi pi-chart-bar"
              severity="secondary"
              outlined
              class="quick-action-btn"
            />
          </template>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import Card from 'primevue/card';
import { onMounted, reactive } from 'vue';
import commissionService from '../services/commissionService';
import taskService from '../services/taskService';
import userService from '../services/userService';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const stats = reactive({ activeEmployees: null });
const summary = reactive({ todayCount: null, todayRevenue: 0, completedCount: 0 });
const commission = reactive({ totalEarned: 0, taskCount: 0 });

const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

onMounted(async () => {
  const calls = [];

  // Fetch today's task summary for everyone
  calls.push(
    taskService
      .getTaskSummary()
      .then((res) => {
        Object.assign(summary, res.data.summary);
      })
      .catch(() => {}),
  );

  // Fetch this month's commission for everyone
  calls.push(
    commissionService
      .getSummary(new Date().getFullYear(), new Date().getMonth() + 1)
      .then((res) => {
        Object.assign(commission, res.data.summary);
      })
      .catch(() => {}),
  );

  if (authStore.user?.role === 'admin') {
    calls.push(
      userService
        .getStats()
        .then((res) => {
          stats.activeEmployees = res.data.activeEmployees;
        })
        .catch(() => {}),
    );
  }

  await Promise.all(calls);
});
</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  background: linear-gradient(135deg, #ffffff 0%, #fff5f5 100%);
  border: 1px solid #f5c6c6;
  box-shadow: 0 4px 20px rgba(238, 134, 134, 0.12);
}

.dashboard-greeting {
  font-size: clamp(1.4rem, 5vw, 1.9rem);
  font-weight: 800;
  color: #4a1d1d;
  margin-bottom: 0.25rem;
  line-height: 1.2;
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
  color: #945f5f;
  letter-spacing: 0.06em;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #4a1d1d;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-note {
  font-size: 0.76rem;
  color: #bf8a8a;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

.quick-action-btn {
  justify-content: center;
  min-height: 44px;
  width: 100%;
}

@media (max-width: 480px) {
  .stat-value {
    font-size: 1.6rem;
  }
  .quick-actions-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
