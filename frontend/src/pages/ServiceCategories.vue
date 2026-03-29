<template>
  <div class="categories-page">
    <div class="page-header mb-4">
      <div class="flex align-items-center gap-2">
        <BackButton to="/dashboard" />
        <h1 class="text-2xl font-bold text-900 m-0">Service Categories</h1>
      </div>
      <Button label="Add Category" icon="pi pi-plus" @click="openModal()" />
    </div>

    <DataTable
      :value="categories"
      :loading="loading"
      stripedRows
      dataKey="id"
      class="p-datatable-sm desktop-table"
    >
      <template #empty>No categories found.</template>
      <Column field="name" header="Name" />
      <Column field="description" header="Description">
        <template #body="{ data }">{{ data.description || '—' }}</template>
      </Column>
      <Column field="serviceCount" header="Services" style="width: 7rem; text-align: center">
        <template #body="{ data }">
          <Tag :value="String(data.serviceCount ?? 0)" severity="secondary" />
        </template>
      </Column>
      <Column field="is_deleted" header="Status" style="width: 8rem">
        <template #body="{ data }">
          <Tag
            :value="data.is_deleted ? 'Inactive' : 'Active'"
            :severity="data.is_deleted ? 'danger' : 'success'"
          />
        </template>
      </Column>
      <Column header="Actions" style="width: 12rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" size="small" text rounded @click="openModal(data)" />
            <Button
              :icon="data.is_deleted ? 'pi pi-check-circle' : 'pi pi-ban'"
              :severity="data.is_deleted ? 'success' : 'danger'"
              size="small"
              text
              rounded
              @click="toggleStatus(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Mobile card list -->
    <div class="mobile-cards">
      <div v-if="loading" class="text-center py-4 text-600">
        <i class="pi pi-spin pi-spinner" />
        Loading...
      </div>
      <div v-else-if="!categories.length" class="text-center py-4 text-400">
        No categories found.
      </div>
      <div v-for="cat in categories" :key="cat.id" class="cat-card">
        <div class="cat-card-top">
          <div>
            <div class="cat-card-name">{{ cat.name }}</div>
            <div class="cat-card-desc">{{ cat.description || '—' }}</div>
          </div>
          <div class="flex gap-1">
            <Tag :value="String(cat.serviceCount ?? 0) + ' svcs'" severity="secondary" />
            <Tag
              :value="cat.is_deleted ? 'Inactive' : 'Active'"
              :severity="cat.is_deleted ? 'danger' : 'success'"
            />
          </div>
        </div>
        <div class="cat-card-actions">
          <Button icon="pi pi-pencil" label="Edit" size="small" outlined @click="openModal(cat)" />
          <Button
            :icon="cat.is_deleted ? 'pi pi-check-circle' : 'pi pi-ban'"
            :label="cat.is_deleted ? 'Activate' : 'Deactivate'"
            :severity="cat.is_deleted ? 'success' : 'danger'"
            size="small"
            outlined
            @click="toggleStatus(cat)"
          />
        </div>
      </div>
    </div>

    <!-- Add / Edit Dialog -->
    <Dialog
      v-model:visible="showModal"
      :header="editTarget ? 'Edit Category' : 'Add Category'"
      :style="{ width: '420px' }"
      modal
    >
      <form @submit.prevent="submitForm">
        <div class="field">
          <label>Name *</label>
          <InputText v-model="form.name" placeholder="e.g. Hair, Makeup" class="w-full" required />
        </div>
        <div class="field">
          <label>Description</label>
          <Textarea
            v-model="form.description"
            placeholder="Optional description"
            class="w-full"
            rows="3"
          />
        </div>
        <Message v-if="formError" severity="error" class="mb-2">{{ formError }}</Message>
        <div class="flex justify-content-end gap-2 mt-3">
          <Button
            label="Cancel"
            severity="secondary"
            outlined
            @click="showModal = false"
            type="button"
          />
          <Button
            :label="editTarget ? 'Update' : 'Add'"
            icon="pi pi-check"
            type="submit"
            :loading="formLoading"
          />
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
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { onMounted, reactive, ref } from 'vue';
import BackButton from '../components/BackButton.vue';
import serviceService from '../services/serviceService';

const toast = useToast();
const categories = ref([]);
const loading = ref(true);
const showModal = ref(false);
const formLoading = ref(false);
const formError = ref('');
const editTarget = ref(null);
const form = reactive({ name: '', description: '' });

const fetchCategories = async () => {
  loading.value = true;
  try {
    const res = await serviceService.getCategories();
    categories.value = res.data.categories;
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load categories',
      life: 4000,
    });
  } finally {
    loading.value = false;
  }
};

const openModal = (cat = null) => {
  editTarget.value = cat;
  form.name = cat?.name || '';
  form.description = cat?.description || '';
  formError.value = '';
  showModal.value = true;
};

const submitForm = async () => {
  formLoading.value = true;
  formError.value = '';
  try {
    if (editTarget.value) {
      await serviceService.updateCategory(editTarget.value.id, form);
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: 'Category updated.',
        life: 3000,
      });
    } else {
      await serviceService.createCategory(form);
      toast.add({ severity: 'success', summary: 'Created', detail: 'Category added.', life: 3000 });
    }
    showModal.value = false;
    await fetchCategories();
  } catch (e) {
    const details = e.response?.data?.details;
    formError.value = details
      ? details.join(' ')
      : e.response?.data?.error || 'Failed to save category.';
  } finally {
    formLoading.value = false;
  }
};

const toggleStatus = async (cat) => {
  try {
    await serviceService.setCategoryStatus(cat.id, !!cat.is_deleted);
    toast.add({
      severity: 'success',
      summary: 'Updated',
      detail: `Category ${cat.is_deleted ? 'activated' : 'deactivated'}.`,
      life: 3000,
    });
    await fetchCategories();
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to update status',
      life: 4000,
    });
  }
};

onMounted(fetchCategories);
</script>

<style scoped>
.categories-page {
  max-width: 900px;
  margin: 0 auto;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
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
  }
}

.cat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 4px 20px rgba(238, 134, 134, 0.12);
  border: 1px solid #f5c6c6;
}
.cat-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}
.cat-card-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: #4a1d1d;
}
.cat-card-desc {
  font-size: 0.78rem;
  color: #945f5f;
  margin-top: 2px;
}
.cat-card-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
