<template>
  <div class="packages-page">
    <div class="flex align-items-center justify-content-between mb-4">
      <h1 class="text-2xl font-bold text-900 m-0">Service Packages</h1>
      <Button label="Add Package" icon="pi pi-plus" @click="openModal()" />
    </div>

    <DataTable :value="packages" :loading="loading" stripedRows dataKey="id" class="p-datatable-sm">
      <template #empty>No packages found.</template>
      <Column field="name" header="Package Name" sortable />
      <Column field="package_price" header="Package Price">
        <template #body="{ data }">₹{{ Number(data.package_price).toFixed(2) }}</template>
      </Column>
      <Column header="Included Services">
        <template #body="{ data }">
          <div class="flex flex-wrap gap-1">
            <Tag v-for="svc in data.services" :key="svc.id" :value="svc.name" severity="secondary" />
            <span v-if="!data.services?.length" class="text-400">—</span>
          </div>
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
    <Dialog v-model:visible="showModal" :header="editTarget ? 'Edit Package' : 'Create Package'" :style="{ width: '520px' }" modal>
      <form @submit.prevent="submitForm">
        <div class="field">
          <label>Package Name *</label>
          <InputText v-model="form.name" placeholder="e.g. Hair Combo" class="w-full" required />
        </div>
        <div class="field">
          <label>Description</label>
          <Textarea v-model="form.description" class="w-full" rows="2" placeholder="Optional" />
        </div>
        <div class="field">
          <label>Package Price (₹) *</label>
          <InputNumber v-model="form.packagePrice" :min="0" mode="decimal" :min-fraction-digits="0" :max-fraction-digits="2" class="w-full" />
        </div>
        <div class="field">
          <label>Included Services *</label>
          <MultiSelect
            v-model="form.serviceIds"
            :options="activeServices"
            option-label="name"
            option-value="id"
            placeholder="Select services"
            class="w-full"
            display="chip"
            filter
          />
        </div>
        <Message v-if="formError" severity="error" class="mb-2">{{ formError }}</Message>
        <div class="flex justify-content-end gap-2 mt-3">
          <Button label="Cancel" severity="secondary" outlined @click="showModal = false" type="button" />
          <Button :label="editTarget ? 'Update' : 'Create'" icon="pi pi-check" type="submit" :loading="formLoading" />
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
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import MultiSelect from 'primevue/multiselect';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { onMounted, reactive, ref } from 'vue';
import serviceService from '../services/serviceService';

const toast = useToast();
const packages = ref([]);
const activeServices = ref([]);
const loading = ref(true);
const showModal = ref(false);
const formLoading = ref(false);
const formError = ref('');
const editTarget = ref(null);

const form = reactive({ name: '', description: '', packagePrice: null, serviceIds: [] });

const fetchData = async () => {
  loading.value = true;
  try {
    const [pkgRes, svcRes] = await Promise.all([serviceService.getPackages(), serviceService.getServices({ active: true })]);
    packages.value = pkgRes.data.packages;
    activeServices.value = svcRes.data.services.filter((s) => s.is_active);
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load packages', life: 4000 });
  } finally {
    loading.value = false;
  }
};

const openModal = (pkg = null) => {
  editTarget.value = pkg;
  if (pkg) {
    Object.assign(form, {
      name: pkg.name,
      description: pkg.description || '',
      packagePrice: Number(pkg.package_price),
      serviceIds: pkg.services?.map((s) => s.id) || [],
    });
  } else {
    Object.assign(form, { name: '', description: '', packagePrice: null, serviceIds: [] });
  }
  formError.value = '';
  showModal.value = true;
};

const submitForm = async () => {
  formLoading.value = true;
  formError.value = '';
  try {
    if (editTarget.value) {
      await serviceService.updatePackage(editTarget.value.id, form);
      toast.add({ severity: 'success', summary: 'Updated', detail: 'Package updated.', life: 3000 });
    } else {
      await serviceService.createPackage(form);
      toast.add({ severity: 'success', summary: 'Created', detail: 'Package created.', life: 3000 });
    }
    showModal.value = false;
    await fetchData();
  } catch (e) {
    const details = e.response?.data?.details;
    formError.value = details ? details.join(' ') : (e.response?.data?.error || 'Failed to save package.');
  } finally {
    formLoading.value = false;
  }
};

const toggleStatus = async (pkg) => {
  try {
    await serviceService.setPackageStatus(pkg.id, !pkg.is_active);
    toast.add({ severity: 'success', summary: 'Updated', detail: `Package ${pkg.is_active ? 'deactivated' : 'activated'}.`, life: 3000 });
    await fetchData();
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update status', life: 4000 });
  }
};

onMounted(fetchData);
</script>

<style scoped>
.packages-page { max-width: 1100px; margin: 0 auto; }
.field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
.field label { font-size: 0.85rem; font-weight: 600; color: #555; }
</style>
