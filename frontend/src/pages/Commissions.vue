<template>
  <div class="commissions-page">
    <div class="page-header mb-3">
      <div class="flex align-items-center gap-2">
        <BackButton to="/dashboard" />
        <h1 class="text-2xl font-bold text-900 m-0">💰 Commissions</h1>
      </div>
      <!-- Employee selector — admin only -->
      <Select
        v-if="isAdmin"
        v-model="selectedEmployeeId"
        :options="employees"
        option-label="label"
        option-value="value"
        placeholder="Select employee"
        class="w-14rem"
        filter
        @change="load"
      />
    </div>

    <!-- Month / Year Filter -->
    <div class="filters-bar flex gap-2 align-items-center mb-4">
      <label class="text-sm font-semibold text-600">Month:</label>
      <Select
        v-model="selectedMonth"
        :options="months"
        option-label="label"
        option-value="value"
        class="w-8rem"
        @change="load"
      />
      <Select
        v-model="selectedYear"
        :options="years"
        option-label="label"
        option-value="value"
        class="w-7rem"
        @change="load"
      />
    </div>

    <!-- Summary cards -->
    <div class="grid mb-4">
      <div class="col-12 md:col-4">
        <div class="summary-card primary">
          <div class="summary-icon">🏆</div>
          <div>
            <div class="summary-label">Total Earned</div>
            <div class="summary-value">LKR {{ Number(summary.totalEarned ?? 0).toFixed(2) }}</div>
            <div class="summary-note">{{ summary.taskCount ?? 0 }} completed tasks</div>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-4">
        <div class="summary-card green">
          <div class="summary-icon">📋</div>
          <div>
            <div class="summary-label">Tasks Completed</div>
            <div class="summary-value">{{ summary.taskCount ?? 0 }}</div>
            <div class="summary-note">{{ monthLabel }} {{ selectedYear }}</div>
          </div>
        </div>
      </div>
      <div class="col-12 md:col-4">
        <div class="summary-card blue">
          <div class="summary-icon">📊</div>
          <div>
            <div class="summary-label">Avg Per Task</div>
            <div class="summary-value">LKR {{ avgPerTask }}</div>
            <div class="summary-note">Commission average</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Per-service breakdown -->
    <div class="card">
      <h2 class="text-lg font-bold mb-3">Breakdown by Service</h2>
      <DataTable
        :value="breakdown"
        :loading="loading"
        dataKey="serviceName"
        class="p-datatable-sm desktop-table"
        stripedRows
      >
        <template #empty>No commission data for this period.</template>
        <Column field="serviceName" header="Service" />
        <Column header="Commission Rate">
          <template #body="{ data }">
            <span v-if="data.commissionType === 'percentage'">{{ data.commissionValue }}%</span>
            <span v-else-if="data.commissionType === 'fixed'">
              LKR {{ data.commissionValue }} flat
            </span>
            <span v-else class="text-400">No rule</span>
          </template>
        </Column>
        <Column field="taskCount" header="Tasks" style="width: 8rem" />
        <Column header="Earned" style="width: 12rem">
          <template #body="{ data }">
            <span class="font-bold text-green-600">
              LKR {{ Number(data.totalEarned).toFixed(2) }}
            </span>
          </template>
        </Column>
      </DataTable>

      <!-- Mobile card list -->
      <div class="mobile-cards">
        <div v-if="loading" class="text-center py-4 text-600">
          <i class="pi pi-spin pi-spinner" />
          Loading...
        </div>
        <div v-else-if="!breakdown.length" class="text-center py-4 text-400">
          No commission data for this period.
        </div>
        <div v-for="row in breakdown" :key="row.serviceName" class="comm-card">
          <div class="comm-card-top">
            <div class="comm-card-service">{{ row.serviceName }}</div>
            <span class="font-bold text-green-600">
              LKR {{ Number(row.totalEarned).toFixed(2) }}
            </span>
          </div>
          <div class="comm-card-meta">
            <span v-if="row.commissionType === 'percentage'">
              {{ row.commissionValue }}% commission
            </span>
            <span v-else-if="row.commissionType === 'fixed'">
              LKR {{ row.commissionValue }} flat
            </span>
            <span v-else class="text-400">No rule</span>
            <span>• {{ row.taskCount }} tasks</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref } from 'vue';
import BackButton from '../components/BackButton.vue';
import api from '../services/api';
import commissionService from '../services/commissionService';
import { useAuthStore } from '../stores/auth';

const toast = useToast();
const auth = useAuthStore();
const isAdmin = computed(() => auth.user?.role === 'admin');

const now = new Date();
const selectedMonth = ref(now.getMonth() + 1);
const selectedYear = ref(now.getFullYear());
const selectedEmployeeId = ref(null);
const loading = ref(false);
const breakdown = ref([]);
const summary = reactive({ totalEarned: 0, taskCount: 0 });
const employees = ref([]);

const months = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

const years = Array.from({ length: 3 }, (_, i) => {
  const y = now.getFullYear() - i;
  return { label: String(y), value: y };
});

const monthLabel = computed(() => months.find((m) => m.value === selectedMonth.value)?.label || '');
const avgPerTask = computed(() => {
  if (!summary.taskCount) return '0.00';
  return (summary.totalEarned / summary.taskCount).toFixed(2);
});

const load = async () => {
  loading.value = true;
  try {
    const params = {
      year: selectedYear.value,
      month: selectedMonth.value,
    };
    if (isAdmin.value && selectedEmployeeId.value) {
      params.employeeId = selectedEmployeeId.value;
    }
    const res = await commissionService.getCommissions(params);
    breakdown.value = res.data.breakdown;
    Object.assign(summary, res.data.summary);
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load commissions',
      life: 4000,
    });
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (isAdmin.value) {
    try {
      const res = await api.get('/users');
      employees.value = res.data.users
        .filter((u) => u.role === 'employee')
        .map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }));
    } catch {
      /* ignore */
    }
  }
  await load();
});
</script>

<style scoped>
.commissions-page {
  max-width: 1100px;
  margin: 0 auto;
}
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(238, 134, 134, 0.12);
  border: 1px solid #f5c6c6;
}

.summary-card {
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(238, 134, 134, 0.12);
  height: 100%;
}
.summary-card.primary {
  background: linear-gradient(135deg, #fadadd 0%, #fff5f5 100%);
  border: 1px solid #f5c6c6;
}
.summary-card.green {
  background: linear-gradient(135deg, #fce4e4 0%, #fff9f9 100%);
  border: 1px solid #f5c6c6;
}
.summary-card.blue {
  background: linear-gradient(135deg, #fff1f1 0%, #fadadd 100%);
  border: 1px solid #f5c6c6;
}

.summary-icon {
  font-size: 1.6rem;
  min-width: 44px;
  text-align: center;
}
.summary-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #945f5f;
  letter-spacing: 0.06em;
  margin-bottom: 0.25rem;
}
.summary-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: #4a1d1d;
  line-height: 1;
  margin-bottom: 0.25rem;
}
.summary-note {
  font-size: 0.76rem;
  color: #bf8a8a;
}

.desktop-table {
  display: block;
}
.mobile-cards {
  display: none;
}
@media (max-width: 768px) {
  .desktop-table {
    display: none !important;
  }
  .mobile-cards {
    display: block;
    margin-top: 0.75rem;
  }
  .summary-value {
    font-size: 1.3rem;
  }
}

.comm-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 4px 20px rgba(238, 134, 134, 0.12);
  border: 1px solid #f5c6c6;
}
.comm-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.3rem;
}
.comm-card-service {
  font-weight: 700;
  font-size: 0.95rem;
  color: #4a1d1d;
}
.comm-card-meta {
  font-size: 0.78rem;
  color: #945f5f;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
