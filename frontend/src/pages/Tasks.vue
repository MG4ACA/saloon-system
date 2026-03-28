<template>
  <div class="tasks-page">
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-2xl font-bold text-900 m-0">Tasks</h1>
      <Button label="New Task" icon="pi pi-plus" @click="$router.push('/tasks/new')" />
    </div>

    <!-- Filters -->
    <div class="filters-bar flex flex-wrap gap-2 mb-3 align-items-center">
      <DatePicker v-model="filterDate" dateFormat="yy-mm-dd" placeholder="Filter by date" showClear class="filter-input" @date-select="loadTasks" @clear-click="loadTasks" />
      <Select v-model="filterStatus" :options="statusOptions" option-label="label" option-value="value" placeholder="All statuses" show-clear class="filter-input" @change="loadTasks" />
      <Select
        v-if="isAdmin"
        v-model="filterEmployeeId"
        :options="employees"
        option-label="label"
        option-value="value"
        placeholder="All employees"
        show-clear
        filter
        class="filter-input"
        @change="loadTasks"
      />
      <Button icon="pi pi-refresh" text rounded @click="loadTasks" title="Refresh" />
    </div>

    <DataTable :value="tasks" :loading="loading" stripedRows dataKey="id" class="p-datatable-sm" paginator :rows="20">
      <template #empty>No tasks found for the selected filters.</template>

      <Column v-if="isAdmin" header="Employee">
        <template #body="{ data }">{{ data.employeeFirstName }} {{ data.employeeLastName }}</template>
      </Column>
      <Column field="serviceName" header="Service" />
      <Column header="Customer">
        <template #body="{ data }">
          <span v-if="data.customerName">{{ data.customerName }}</span>
          <span v-else class="text-400">Walk-in</span>
        </template>
      </Column>
      <Column field="price" header="Price">
        <template #body="{ data }">₹{{ Number(data.price).toFixed(2) }}</template>
      </Column>
      <Column header="Start">
        <template #body="{ data }">{{ formatTime(data.start_time) }}</template>
      </Column>
      <Column header="Status">
        <template #body="{ data }">
          <Tag :value="statusLabel(data.status)" :severity="statusSeverity(data.status)" />
        </template>
      </Column>
      <Column header="Lock">
        <template #body="{ data }">
          <i v-if="data.is_locked" class="pi pi-lock text-400" title="Locked — cannot be modified" />
        </template>
      </Column>
      <Column header="Actions" style="width: 14rem">
        <template #body="{ data }">
          <div class="flex gap-1 flex-wrap">
            <Button
              v-if="data.status === 'pending' && !data.is_locked"
              label="Start"
              icon="pi pi-play"
              size="small"
              severity="info"
              outlined
              @click="changeStatus(data, 'in_progress')"
            />
            <Button
              v-if="data.status === 'in_progress' && !data.is_locked"
              label="Complete"
              icon="pi pi-check"
              size="small"
              severity="success"
              outlined
              @click="changeStatus(data, 'completed')"
            />
            <Button
              v-if="['pending','in_progress'].includes(data.status) && !data.is_locked"
              label="Cancel"
              icon="pi pi-times"
              size="small"
              severity="danger"
              outlined
              @click="changeStatus(data, 'cancelled')"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import taskService from '../services/taskService';
import api from '../services/api';

const toast = useToast();
const auth  = useAuthStore();
const isAdmin = computed(() => auth.user?.role === 'admin');

const tasks          = ref([]);
const employees      = ref([]);
const loading        = ref(true);
const filterDate     = ref(null);
const filterStatus   = ref(null);
const filterEmployeeId = ref(null);

const statusOptions = [
  { label: 'Pending',     value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed',   value: 'completed' },
  { label: 'Cancelled',   value: 'cancelled' },
];

const statusLabel = (s) => ({ pending: 'Pending', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' }[s] || s);

const statusSeverity = (s) => ({
  pending: 'secondary',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'danger',
}[s] || 'secondary');

const formatTime = (dt) => {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
};

const loadTasks = async () => {
  loading.value = true;
  try {
    const params = { all: 'true' };
    if (filterDate.value) params.date = filterDate.value instanceof Date
      ? filterDate.value.toISOString().slice(0, 10)
      : filterDate.value;
    if (filterStatus.value) params.status = filterStatus.value;
    if (filterEmployeeId.value) params.employeeId = filterEmployeeId.value;

    const res = await taskService.getTasks(params);
    tasks.value = res.data.tasks;
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load tasks', life: 4000 });
  } finally {
    loading.value = false;
  }
};

const loadEmployees = async () => {
  if (!isAdmin.value) return;
  try {
    const res = await api.get('/users');
    employees.value = res.data.users
      .filter((u) => u.role === 'employee' && u.isActive)
      .map((u) => ({ label: `${u.firstName} ${u.lastName}`, value: u.id }));
  } catch { /* ignore */ }
};

const changeStatus = async (task, status) => {
  try {
    await taskService.updateTaskStatus(task.id, status);
    toast.add({ severity: 'success', summary: 'Updated', detail: `Task marked ${statusLabel(status)}.`, life: 3000 });
    await loadTasks();
  } catch (e) {
    const msg = e.response?.data?.error || 'Failed to update status';
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
  }
};

onMounted(async () => {
  await Promise.all([loadTasks(), loadEmployees()]);
});
</script>

<style scoped>
.tasks-page { max-width: 1300px; margin: 0 auto; }
.filters-bar { background: var(--p-surface-card); border-radius: 10px; padding: 0.75rem 1rem; }
.filter-input { min-width: 180px; }
</style>
