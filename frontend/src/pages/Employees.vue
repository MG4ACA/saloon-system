<template>
  <div class="employees-page">
    <!-- Header -->
    <div class="page-header">
      <h1>Employee Management</h1>
      <button class="btn-primary" @click="openAddModal">+ Add Employee</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading">Loading employees...</div>

    <!-- Error -->
    <div v-if="fetchError" class="alert-error">{{ fetchError }}</div>

    <!-- Employee Table -->
    <div v-if="!loading" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="employees.length === 0">
            <td colspan="6" class="empty">No employees found.</td>
          </tr>
          <tr v-for="emp in employees" :key="emp.id">
            <td>{{ emp.firstName }} {{ emp.lastName }}</td>
            <td>{{ emp.email }}</td>
            <td><span class="badge" :class="emp.role">{{ emp.role }}</span></td>
            <td>
              <span class="badge" :class="emp.isActive ? 'active' : 'inactive'">
                {{ emp.isActive ? 'Active' : 'Disabled' }}
              </span>
            </td>
            <td>{{ emp.lastLogin ? formatDate(emp.lastLogin) : 'Never' }}</td>
            <td class="actions-cell">
              <button
                class="btn-sm"
                :class="emp.isActive ? 'btn-danger' : 'btn-success'"
                @click="confirmToggle(emp)"
              >
                {{ emp.isActive ? 'Disable' : 'Enable' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Employee Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal">
        <h2>Add New Employee</h2>
        <form @submit.prevent="submitAddEmployee">
          <div class="form-row">
            <div class="form-group">
              <label>First Name *</label>
              <input v-model="form.firstName" type="text" placeholder="First name" required />
            </div>
            <div class="form-group">
              <label>Last Name *</label>
              <input v-model="form.lastName" type="text" placeholder="Last name" required />
            </div>
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input v-model="form.email" type="email" placeholder="employee@salon.com" required />
          </div>
          <div class="form-group">
            <label>Password *</label>
            <input v-model="form.password" type="password" placeholder="Minimum 6 characters" required minlength="6" />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="form.role">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div v-if="formError" class="alert-error">{{ formError }}</div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeAddModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="formLoading">
              {{ formLoading ? 'Saving...' : 'Add Employee' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Toggle Modal -->
    <div v-if="confirmTarget" class="modal-overlay" @click.self="confirmTarget = null">
      <div class="modal confirm-modal">
        <h2>{{ confirmTarget.isActive ? 'Disable' : 'Enable' }} Employee</h2>
        <p>
          Are you sure you want to <strong>{{ confirmTarget.isActive ? 'disable' : 'enable' }}</strong>
          <strong> {{ confirmTarget.firstName }} {{ confirmTarget.lastName }}</strong>?
        </p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="confirmTarget = null">Cancel</button>
          <button
            class="btn-primary"
            :class="confirmTarget.isActive ? 'btn-danger' : 'btn-success'"
            :disabled="formLoading"
            @click="doToggle"
          >
            {{ formLoading ? 'Saving...' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import userService from '../services/userService';

const authStore = useAuthStore();

const employees = ref([]);
const loading = ref(true);
const fetchError = ref('');
const showAddModal = ref(false);
const confirmTarget = ref(null);
const formLoading = ref(false);
const formError = ref('');

const defaultForm = () => ({ firstName: '', lastName: '', email: '', password: '', role: 'employee' });
const form = reactive(defaultForm());

const formatDate = (dt) =>
  new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const fetchEmployees = async () => {
  loading.value = true;
  fetchError.value = '';
  try {
    const res = await userService.getAll();
    employees.value = res.data.users;
  } catch (e) {
    fetchError.value = e.response?.data?.error || 'Failed to load employees.';
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  Object.assign(form, defaultForm());
  formError.value = '';
  showAddModal.value = true;
};

const closeAddModal = () => { showAddModal.value = false; };

const submitAddEmployee = async () => {
  formLoading.value = true;
  formError.value = '';
  try {
    await userService.register(form);
    await fetchEmployees();
    closeAddModal();
  } catch (e) {
    const details = e.response?.data?.details;
    formError.value = details ? details.join(' ') : (e.response?.data?.error || 'Failed to add employee.');
  } finally {
    formLoading.value = false;
  }
};

const confirmToggle = (emp) => { confirmTarget.value = emp; };

const doToggle = async () => {
  if (!confirmTarget.value) return;
  formLoading.value = true;
  try {
    await userService.updateStatus(confirmTarget.value.id, !confirmTarget.value.isActive);
    await fetchEmployees();
    confirmTarget.value = null;
  } catch (e) {
    fetchError.value = e.response?.data?.error || 'Failed to update status.';
    confirmTarget.value = null;
  } finally {
    formLoading.value = false;
  }
};

onMounted(fetchEmployees);
</script>

<style scoped>
.employees-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-header h1 { margin: 0; }

.loading { padding: 2rem; text-align: center; color: #666; }

.alert-error {
  background: #fff0f0;
  color: #dc3545;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid #ffcdd2;
  margin-bottom: 1rem;
}

.table-wrap {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead { background: #f8f9fa; }

th {
  padding: 0.85rem 1rem;
  text-align: left;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #888;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #eee;
}

td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
}

tr:last-child td { border-bottom: none; }
tr:hover td { background: #fafafa; }

.empty { text-align: center; color: #999; padding: 2rem; }

.badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}
.badge.admin    { background: #e8f4ff; color: #0066cc; }
.badge.employee { background: #f0f0f0; color: #555; }
.badge.active   { background: #e8fff4; color: #16a34a; }
.badge.inactive { background: #fff0f0; color: #dc3545; }

.actions-cell { display: flex; gap: 0.5rem; }

/* Buttons */
.btn-primary, .btn-secondary, .btn-sm, .btn-danger, .btn-success {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-primary { background: #667eea; color: white; }
.btn-primary:hover:not(:disabled) { opacity: 0.85; }
.btn-secondary { background: #f0f0f0; color: #333; }
.btn-secondary:hover { background: #e0e0e0; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger  { background: #dc3545; color: white; }
.btn-success { background: #16a34a; color: white; }
.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  width: 480px;
  max-width: 95vw;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal h2 { margin: 0 0 1.5rem 0; font-size: 1.2rem; }

.confirm-modal { width: 380px; }
.confirm-modal p { color: #555; margin-bottom: 1.5rem; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  box-sizing: border-box;
}
.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}
</style>

