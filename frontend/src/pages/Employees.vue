<template>
  <div class="employees-page">
    <!-- Header -->
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-2xl font-bold text-900 m-0">Employee Management</h1>
      <Button label="Add Employee" icon="pi pi-plus" @click="openAddModal" />
    </div>

    <!-- DataTable -->
    <DataTable
      :value="employees"
      :loading="loading"
      stripedRows
      paginator
      :rows="10"
      dataKey="id"
      class="p-datatable-sm"
    >
      <template #empty>No employees found.</template>
      <template #loading>Loading employees...</template>

      <Column field="firstName" header="Name">
        <template #body="{ data }">{{ data.firstName }} {{ data.lastName }}</template>
      </Column>
      <Column field="email" header="Email" />
      <Column field="role" header="Role">
        <template #body="{ data }">
          <Tag :value="data.role" :severity="data.role === 'admin' ? 'info' : 'secondary'" />
        </template>
      </Column>
      <Column field="isActive" header="Status">
        <template #body="{ data }">
          <Tag :value="data.isActive ? 'Active' : 'Disabled'" :severity="data.isActive ? 'success' : 'danger'" />
        </template>
      </Column>
      <Column field="lastLogin" header="Last Login">
        <template #body="{ data }">{{ data.lastLogin ? formatDate(data.lastLogin) : 'Never' }}</template>
      </Column>
      <Column header="Actions" style="width: 9rem">
        <template #body="{ data }">
          <Button
            :label="data.isActive ? 'Disable' : 'Enable'"
            :severity="data.isActive ? 'danger' : 'success'"
            size="small"
            outlined
            @click="confirmToggle(data)"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Add Employee Dialog -->
    <Dialog v-model:visible="showAddModal" header="Add New Employee" :style="{ width: '480px' }" modal>
      <form @submit.prevent="submitAdd">
        <div class="grid">
          <div class="col-6 field">
            <label>First Name *</label>
            <InputText v-model="form.firstName" placeholder="First name" class="w-full" required />
          </div>
          <div class="col-6 field">
            <label>Last Name *</label>
            <InputText v-model="form.lastName" placeholder="Last name" class="w-full" required />
          </div>
          <div class="col-12 field">
            <label>Email *</label>
            <InputText v-model="form.email" type="email" placeholder="employee@salon.com" class="w-full" required />
          </div>
          <div class="col-12 field">
            <label>Password *</label>
            <Password v-model="form.password" placeholder="Minimum 6 characters" class="w-full" :feedback="false" toggleMask required />
          </div>
          <div class="col-12 field">
            <label>Role</label>
            <Select v-model="form.role" :options="roleOptions" option-label="label" option-value="value" class="w-full" />
          </div>
        </div>
        <Message v-if="formError" severity="error" class="mb-2">{{ formError }}</Message>
        <div class="flex justify-content-end gap-2 mt-3">
          <Button label="Cancel" severity="secondary" outlined @click="showAddModal = false" type="button" />
          <Button label="Add Employee" icon="pi pi-check" type="submit" :loading="formLoading" />
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Password from 'primevue/password';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onMounted, reactive, ref } from 'vue';
import userService from '../services/userService';

const toast = useToast();
const confirm = useConfirm();

const employees = ref([]);
const loading = ref(true);
const showAddModal = ref(false);
const formLoading = ref(false);
const formError = ref('');

const roleOptions = [
  { label: 'Employee', value: 'employee' },
  { label: 'Admin', value: 'admin' },
];

const emptyForm = () => ({ firstName: '', lastName: '', email: '', password: '', role: 'employee' });
const form = reactive(emptyForm());

const formatDate = (dt) =>
  new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const fetchEmployees = async () => {
  loading.value = true;
  try {
    const res = await userService.getAll();
    employees.value = res.data.users;
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Error', detail: e.response?.data?.error || 'Failed to load employees', life: 4000 });
  } finally {
    loading.value = false;
  }
};

const openAddModal = () => {
  Object.assign(form, emptyForm());
  formError.value = '';
  showAddModal.value = true;
};

const submitAdd = async () => {
  formLoading.value = true;
  formError.value = '';
  try {
    await userService.register(form);
    toast.add({ severity: 'success', summary: 'Employee Added', detail: `${form.firstName} ${form.lastName} added successfully.`, life: 3000 });
    showAddModal.value = false;
    await fetchEmployees();
  } catch (e) {
    const details = e.response?.data?.details;
    formError.value = details ? details.join(' ') : (e.response?.data?.error || 'Failed to add employee.');
  } finally {
    formLoading.value = false;
  }
};

const confirmToggle = (emp) => {
  confirm.require({
    message: `Are you sure you want to ${emp.isActive ? 'disable' : 'enable'} ${emp.firstName} ${emp.lastName}?`,
    header: `${emp.isActive ? 'Disable' : 'Enable'} Employee`,
    icon: emp.isActive ? 'pi pi-ban' : 'pi pi-check-circle',
    acceptClass: emp.isActive ? 'p-button-danger' : 'p-button-success',
    accept: async () => {
      try {
        await userService.updateStatus(emp.id, !emp.isActive);
        toast.add({ severity: 'success', summary: 'Updated', detail: `Employee ${emp.isActive ? 'disabled' : 'enabled'}.`, life: 3000 });
        await fetchEmployees();
      } catch (e) {
        toast.add({ severity: 'error', summary: 'Error', detail: e.response?.data?.error || 'Failed to update status', life: 4000 });
      }
    },
  });
};

onMounted(fetchEmployees);
</script>

<style scoped>
.employees-page { max-width: 1200px; margin: 0 auto; }
.field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.25rem; }
.field label { font-size: 0.85rem; font-weight: 600; color: #555; }
</style>
