<template>
  <div class="reports-page">
    <div class="page-header mb-3">
      <div class="flex align-items-center gap-2">
        <BackButton to="/dashboard" />
        <h1 class="text-2xl font-bold text-900 m-0">📊 Reports & Analytics</h1>
      </div>
      <!-- Date Range -->
      <div class="date-filter">
        <label class="text-sm font-semibold text-600">From</label>
        <DatePicker
          v-model="dateFrom"
          dateFormat="yy-mm-dd"
          class="date-picker-input"
          @date-select="loadAll"
        />
        <label class="text-sm font-semibold text-600">To</label>
        <DatePicker
          v-model="dateTo"
          dateFormat="yy-mm-dd"
          class="date-picker-input"
          @date-select="loadAll"
        />
        <Button icon="pi pi-refresh" text rounded @click="loadAll" :loading="loading" />
      </div>
    </div>

    <TabView v-model:activeIndex="activeTab">
      <!-- ─────────────── Tab 1: Sales ─────────────── -->
      <TabPanel header="💵 Sales">
        <!-- Summary cards -->
        <div class="grid mb-4 mt-2">
          <div class="col-12 md:col-4">
            <div class="report-card blue">
              <div class="rc-icon">💰</div>
              <div>
                <div class="rc-label">TOTAL REVENUE</div>
                <div class="rc-value">LKR {{ fmt(sales.totals?.totalRevenue) }}</div>
                <div class="rc-note">{{ dateRangeLabel }}</div>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="report-card green">
              <div class="rc-icon">✅</div>
              <div>
                <div class="rc-label">COMPLETED TASKS</div>
                <div class="rc-value">{{ sales.totals?.totalTasks ?? '—' }}</div>
                <div class="rc-note">Across all employees</div>
              </div>
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="report-card purple">
              <div class="rc-icon">📈</div>
              <div>
                <div class="rc-label">AVG TASK VALUE</div>
                <div class="rc-value">LKR {{ fmt(sales.totals?.avgTaskValue) }}</div>
                <div class="rc-note">Per completed task</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Daily revenue bar chart -->
        <div class="chart-card">
          <h3 class="text-base font-bold mb-3">Daily Revenue</h3>
          <Chart
            v-if="dailyChartData.labels?.length"
            type="bar"
            :data="dailyChartData"
            :options="barOptions"
            style="height: 280px"
          />
          <div v-else class="text-400 text-center py-4">No sales data for this period.</div>
        </div>
      </TabPanel>

      <!-- ─────────────── Tab 2: Employees ─────────────── -->
      <TabPanel header="👥 Employees">
        <!-- Mobile cards -->
        <div class="mobile-cards hidden-desktop mt-2">
          <div v-if="loadingEmployees" class="text-400 text-center py-4">Loading...</div>
          <div v-else-if="!employees.length" class="text-400 text-center py-4">
            No employee data for this period.
          </div>
          <div v-for="emp in employees" :key="emp.id" class="data-card">
            <div class="data-card-header">
              <span class="data-card-title">{{ emp.firstName }} {{ emp.lastName }}</span>
              <Tag :value="String(emp.tasksCompleted) + ' tasks'" severity="info" />
            </div>
            <div class="data-card-row">
              <span class="data-card-label">Revenue Generated</span>
              <span class="data-card-value">LKR {{ fmt(emp.totalRevenue) }}</span>
            </div>
            <div class="data-card-row">
              <span class="data-card-label">Commission Earned</span>
              <span class="data-card-value text-green-600 font-bold">
                LKR {{ fmt(emp.totalCommission) }}
              </span>
            </div>
          </div>
        </div>
        <!-- Desktop table -->
        <DataTable
          :value="employees"
          :loading="loadingEmployees"
          class="p-datatable-sm mt-2 hidden-mobile"
          stripedRows
        >
          <template #empty>No employee data for this period.</template>
          <Column header="Employee">
            <template #body="{ data }">{{ data.firstName }} {{ data.lastName }}</template>
          </Column>
          <Column field="tasksCompleted" header="Tasks Completed" style="width: 11rem">
            <template #body="{ data }">
              <Tag :value="String(data.tasksCompleted)" severity="info" />
            </template>
          </Column>
          <Column header="Revenue Generated" style="width: 12rem">
            <template #body="{ data }">LKR {{ fmt(data.totalRevenue) }}</template>
          </Column>
          <Column header="Commission Earned" style="width: 12rem">
            <template #body="{ data }">
              <span class="text-green-600 font-bold">LKR {{ fmt(data.totalCommission) }}</span>
            </template>
          </Column>
        </DataTable>
      </TabPanel>

      <!-- ─────────────── Tab 3: Services ─────────────── -->
      <TabPanel header="✂️ Services">
        <div class="grid mt-2">
          <div class="col-12 lg:col-7">
            <!-- Mobile cards -->
            <div class="mobile-cards hidden-desktop">
              <div v-if="loadingServices" class="text-400 text-center py-4">Loading...</div>
              <div v-else-if="!services.length" class="text-400 text-center py-4">
                No service data for this period.
              </div>
              <div v-for="svc in services" :key="svc.serviceId" class="data-card">
                <div class="data-card-header">
                  <span class="data-card-title">{{ svc.serviceName }}</span>
                  <Tag
                    :value="String(svc.taskCount) + ' tasks'"
                    :severity="svc.taskCount > 0 ? 'success' : 'secondary'"
                  />
                </div>
                <div class="data-card-row">
                  <span class="data-card-label">Category</span>
                  <span class="data-card-value">{{ svc.categoryName }}</span>
                </div>
                <div class="data-card-row">
                  <span class="data-card-label">Revenue</span>
                  <span class="data-card-value">LKR {{ fmt(svc.totalRevenue) }}</span>
                </div>
                <div class="data-card-row">
                  <span class="data-card-label">Avg Price</span>
                  <span class="data-card-value">LKR {{ fmt(svc.avgPrice) }}</span>
                </div>
              </div>
            </div>
            <!-- Desktop table -->
            <DataTable
              :value="services"
              :loading="loadingServices"
              class="p-datatable-sm hidden-mobile"
              stripedRows
            >
              <template #empty>No service data for this period.</template>
              <Column field="serviceName" header="Service" />
              <Column field="categoryName" header="Category" />
              <Column field="taskCount" header="Tasks" style="width: 7rem">
                <template #body="{ data }">
                  <Tag
                    :value="String(data.taskCount)"
                    :severity="data.taskCount > 0 ? 'success' : 'secondary'"
                  />
                </template>
              </Column>
              <Column header="Revenue" style="width: 10rem">
                <template #body="{ data }">LKR {{ fmt(data.totalRevenue) }}</template>
              </Column>
              <Column header="Avg Price" style="width: 9rem">
                <template #body="{ data }">LKR {{ fmt(data.avgPrice) }}</template>
              </Column>
            </DataTable>
          </div>
          <div class="col-12 lg:col-5">
            <div class="chart-card" style="height: 100%">
              <h3 class="text-base font-bold mb-3">Top Services by Tasks</h3>
              <Chart
                v-if="serviceChartData.labels?.length"
                type="bar"
                :data="serviceChartData"
                :options="hBarOptions"
                style="height: 300px"
              />
              <div v-else class="text-400 text-center py-4">No data yet.</div>
            </div>
          </div>
        </div>
      </TabPanel>
    </TabView>
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import Chart from 'primevue/chart';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import DatePicker from 'primevue/datepicker';
import TabPanel from 'primevue/tabpanel';
import TabView from 'primevue/tabview';
import Tag from 'primevue/tag';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, reactive, ref } from 'vue';
import BackButton from '../components/BackButton.vue';
import reportService from '../services/reportService';

const toast = useToast();

// Date range — default: first of current month → today
const now = new Date();
const dateFrom = ref(new Date(now.getFullYear(), now.getMonth(), 1));
const dateTo = ref(now);

const activeTab = ref(0);
const loading = ref(false);
const loadingEmployees = ref(false);
const loadingServices = ref(false);

const sales = reactive({ totals: null, daily: [] });
const employees = ref([]);
const services = ref([]);

// Helpers
const fmt = (val) => Number(val || 0).toFixed(2);
const isoDate = (d) => (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10);
const dateRangeLabel = computed(() => `${isoDate(dateFrom.value)} → ${isoDate(dateTo.value)}`);
const params = computed(() => ({
  from: isoDate(dateFrom.value),
  to: isoDate(dateTo.value),
}));

// ── Charts ──────────────────────────────────────────────────
const dailyChartData = computed(() => ({
  labels: sales.daily.map((r) => r.date),
  datasets: [
    {
      label: 'Revenue (LKR)',
      data: sales.daily.map((r) => Number(r.revenue)),
      backgroundColor: 'rgba(238,134,134,0.75)',
      borderColor: 'rgba(217,115,115,1)',
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
}));

const serviceChartData = computed(() => {
  const top10 = services.value.filter((s) => s.taskCount > 0).slice(0, 10);
  return {
    labels: top10.map((s) => s.serviceName),
    datasets: [
      {
        label: 'Tasks Completed',
        data: top10.map((s) => s.taskCount),
        backgroundColor: 'rgba(196,95,95,0.7)',
        borderRadius: 4,
      },
    ],
  };
});

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true } },
};

const hBarOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { beginAtZero: true } },
};

// ── Loaders ───────────────────────────────────────────────
const loadSales = async () => {
  try {
    loading.value = true;
    const res = await reportService.getSales(params.value);
    sales.totals = res.data.totals;
    sales.daily = res.data.daily;
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load sales report',
      life: 4000,
    });
  } finally {
    loading.value = false;
  }
};

const loadEmployees = async () => {
  try {
    loadingEmployees.value = true;
    const res = await reportService.getEmployees(params.value);
    employees.value = res.data.employees;
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load employee report',
      life: 4000,
    });
  } finally {
    loadingEmployees.value = false;
  }
};

const loadServices = async () => {
  try {
    loadingServices.value = true;
    const res = await reportService.getServices(params.value);
    services.value = res.data.services;
  } catch {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load service report',
      life: 4000,
    });
  } finally {
    loadingServices.value = false;
  }
};

const loadAll = () => Promise.all([loadSales(), loadEmployees(), loadServices()]);

onMounted(loadAll);
</script>

<style scoped>
.reports-page {
  max-width: 1300px;
  margin: 0 auto;
}
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.date-filter {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}
.date-picker-input {
  width: 9.5rem;
}

.chart-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 4px 20px rgba(238, 134, 134, 0.12);
  border: 1px solid #f5c6c6;
}

.report-card {
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(238, 134, 134, 0.12);
  height: 100%;
}
.report-card.blue {
  background: linear-gradient(135deg, #fadadd 0%, #fff5f5 100%);
  border: 1px solid #f5c6c6;
}
.report-card.green {
  background: linear-gradient(135deg, #fce4e4 0%, #fafaff 100%);
  border: 1px solid #f5c6c6;
}
.report-card.purple {
  background: linear-gradient(135deg, #fff1f1 0%, #fadadd 100%);
  border: 1px solid #f5c6c6;
}

.rc-icon {
  font-size: 1.5rem;
  min-width: 40px;
  text-align: center;
}
.rc-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #945f5f;
  letter-spacing: 0.06em;
  margin-bottom: 0.25rem;
}
.rc-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: #4a1d1d;
  line-height: 1;
  margin-bottom: 0.25rem;
}
.rc-note {
  font-size: 0.76rem;
  color: #bf8a8a;
}
.data-card-label {
  color: #945f5f;
}

.hidden-mobile {
  display: table;
}
.hidden-desktop {
  display: block;
}

.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.data-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1rem 1.1rem;
  box-shadow: 0 4px 20px rgba(238, 134, 134, 0.12);
  border: 1px solid #f5c6c6;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.data-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}
.data-card-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #4a1d1d;
}
.data-card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}
.data-card-label {
  color: #945f5f;
}
.data-card-value {
  font-weight: 600;
  color: #4a1d1d;
}

@media (min-width: 769px) {
  .hidden-mobile {
    display: table !important;
  }
  .hidden-desktop {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .hidden-mobile {
    display: none !important;
  }
  .hidden-desktop {
    display: block !important;
  }
  .date-filter {
    width: 100%;
  }
  .date-picker-input {
    flex: 1;
    min-width: 0;
  }
  .rc-value {
    font-size: 1.3rem;
  }
}
</style>
