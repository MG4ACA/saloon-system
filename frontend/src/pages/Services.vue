<template>
  <div class="services-page">
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-2xl font-bold text-900 m-0">Services</h1>
      <Button label="Add Service" icon="pi pi-plus" @click="openModal()" />
    </div>

    <DataTable :value="services" :loading="loading" stripedRows dataKey="id" class="p-datatable-sm" paginator :rows="15">
      <template #empty>No services found.</template>
      <Column field="name" header="Service Name" sortable />
      <Column field="categoryName" header="Category" sortable />
      <Column field="basePrice" header="Price">
        <template #body="{ data }">₹{{ Number(data.basePrice).toFixed(2) }}</template>
      </Column>
      <Column field="duration" header="Duration">
        <template #body="{ data }">{{ data.duration }} min</template>
      </Column>
      <Column header="Commission">
        <template #body="{ data }">
          <span v-if="data.commissionType">
            {{ data.commissionType === 'percentage' ? `${data.commissionValue}%` : `₹${data.commissionValue}` }}
          </span>
          <span v-else class="text-400">—</span>
        </template>
      </Column>
      <Column field="is_active" header="Status" style="width:8rem">
        <template #body="{ data }">
          <Tag :value="data.is_active ? 'Active' : 'Inactive'" :severity="data.is_active ? 'success' : 'danger'" />
        </template>
      </Column>
      <Column header="Actions" style="width:10rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" size="small" text rounded @click="openModal(data)" />
            <Button
              :icon="data.is_active ? 'pi pi-ban' : 'pi pi-check-circle'"
              :severity="data.is_active ? 'danger' : 'success'"
              size="small" text rounded
              @click="toggleStatus(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Add/Edit Dialog -->
    <Dialog v-model:visible="showModal" :header="editTarget ? 'Edit Service' : 'Add Service'" :style="{ width: '540px' }" modal>
      <form @submit.prevent="submitForm">
        <div class="grid">
          <div class="col-12 field">
            <label>Service Name *</label>
            <InputText v-model="form.name" placeholder="e.g. Haircut" class="w-full" required />
          </div>
          <div class="col-12 field">
            <label>Category *</label>
            <Select v-model="form.categoryId" :options="categories" option-label="name" option-value="id" placeholder="Select category" class="w-full" />
          </div>
          <div class="col-6 field">
            <label>Base Price (₹) *</label>
            <InputNumber v-model="form.basePrice" mode="decimal" :min-fraction-digits="0" :max-fraction-digits="2" :min="0" class="w-full" />
          </div>
          <div class="col-6 field">
            <label>Duration (minutes) *</label>
            <InputNumber v-model="form.duration" :min="1" :max="480" class="w-full" />
          </div>
          <div class="col-12 field">
            <label>Description</label>
            <Textarea v-model="form.description" class="w-full" rows="2" placeholder="Optional" />
          </div>
          <div class="col-12">
            <Divider />
            <p class="text-sm font-semibold text-700 mb-3">Commission Rule</p>
          </div>
          <div class="col-6 field">
            <label>Commission Type</label>
            <Select v-model="form.commission.commissionType" :options="commissionTypes" option-label="label" option-value="value" class="w-full" />
          </div>
          <div class="col-6 field">
            <label>Commission Value</label>
            <InputNumber v-model="form.commission.commissionValue" :min="0" class="w-full" />
          </div>
          <div class="col-12 field">
            <div class="flex align-items-center gap-2">
              <ToggleSwitch v-model="form.commission.applyAfterDiscount" inputId="applyAfter" />
              <label for="applyAfter" class="cursor-pointer">Apply commission after discount</label>
            </div>
          </div>
        </div>
        <Message v-if="formError" severity="error" class="mb-2">{{ formError }}</Message>
        <div class="flex justify-content-end gap-2 mt-3">
          <Button label="Cancel" severity="secondary" outlined @click="showModal = false" type="button" />
          <Button :label="editTarget ? 'Update' : 'Add'" icon="pi pi-check" type="submit" :loading="formLoading" />
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
import Divider from 'primevue/divider';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import ToggleSwitch from 'primevue/toggleswitch';
import { useToast } from 'primevue/usetoast';
import { onMounted, reactive, ref } from 'vue';
import serviceService from '../services/serviceService';

const toast = useToast();
const services = ref([]);
const categories = ref([]);
const loading = ref(true);
const showModal = ref(false);
const formLoading = ref(false);
const formError = ref('');
const editTarget = ref(null);

const commissionTypes = [
  { label: 'Percentage (%)', value: 'percentage' },
  { label: 'Fixed Amount (₹)', value: 'fixed' },
];

const emptyForm = () => ({
  name: '',
  categoryId: null,
  description: '',
  basePrice: null,
  duration: null,
  commission: { commissionType: 'percentage', commissionValue: 0, applyAfterDiscount: true },
});
const form = reactive(emptyForm());

const fetchData = async () => {
  loading.value = true;
  try {
    const [svcRes, catRes] = await Promise.all([serviceService.getServices(), serviceService.getCategories()]);
    services.value = svcRes.data.services;
    categories.value = catRes.data.categories.filter((c) => !c.is_deleted);
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load services', life: 4000 });
  } finally {
    loading.value = false;
  }
};

const openModal = (svc = null) => {
  editTarget.value = svc;
  if (svc) {
    Object.assign(form, {
      name: svc.name,
      categoryId: svc.category_id,
      description: svc.description || '',
      basePrice: Number(svc.basePrice),
      duration: svc.duration,
      commission: {
        commissionType: svc.commissionType || 'percentage',
        commissionValue: Number(svc.commissionValue) || 0,
        applyAfterDiscount: !!svc.applyAfterDiscount,
      },
    });
  } else {
    Object.assign(form, emptyForm());
  }
  formError.value = '';
  showModal.value = true;
};

const submitForm = async () => {
  formLoading.value = true;
  formError.value = '';
  const payload = { name: form.name, categoryId: form.categoryId, description: form.description, basePrice: form.basePrice, duration: form.duration, commission: form.commission };
  try {
    if (editTarget.value) {
      await serviceService.updateService(editTarget.value.id, payload);
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Service updated.', life: 3000 });
    } else {
      await serviceService.createService(payload);
      toast.add({ severity: 'success', summary: 'Created', detail: 'Service added.', life: 3000 });
    }
    showModal.value = false;
    await fetchData();
  } catch (e) {
    const details = e.response?.data?.details;
    formError.value = details ? details.join(' ') : (e.response?.data?.error || 'Failed to save service.');
  } finally {
    formLoading.value = false;
  }
};

const toggleStatus = async (svc) => {
  try {
    await serviceService.setServiceStatus(svc.id, !svc.is_active);
    toast.add({ severity: 'success', summary: 'Updated', detail: `Service ${svc.is_active ? 'deactivated' : 'activated'}.`, life: 3000 });
    await fetchData();
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status', life: 4000 });
  }
};

onMounted(fetchData);
</script>

<style scoped>
.services-page { max-width: 1200px; margin: 0 auto; }
.field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.25rem; }
.field label { font-size: 0.85rem; font-weight: 600; color: #555; }
</style>
