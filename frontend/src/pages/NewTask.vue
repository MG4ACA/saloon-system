<template>
  <div class="new-task-page">
    <div class="flex align-items-center gap-2 mb-4">
      <Button icon="pi pi-arrow-left" text rounded @click="$router.push('/tasks')" />
      <h1 class="text-2xl font-bold text-900 m-0">New Task</h1>
    </div>

    <div class="card">
      <form @submit.prevent="submitTask">
        <div class="grid">
          <!-- Service -->
          <div class="col-12 md:col-6 field">
            <label>Service *</label>
            <Select
              v-model="form.serviceId"
              :options="services"
              option-label="name"
              option-value="id"
              placeholder="Select a service"
              class="w-full"
              filter
              @change="onServiceChange"
            />
          </div>

          <!-- Price -->
          <div class="col-12 md:col-6 field">
            <label>Price (₹) *</label>
            <InputNumber v-model="form.price" :min="0" mode="decimal" :max-fraction-digits="2" class="w-full" />
          </div>

          <!-- Customer lookup -->
          <div class="col-12 field">
            <label>Customer Phone (optional)</label>
            <div class="flex gap-2 align-items-center">
              <InputText
                v-model="phoneInput"
                placeholder="e.g. 0771234567"
                class="flex-1"
                @blur="lookupCustomer"
                @keyup.enter="lookupCustomer"
              />
              <Tag v-if="customerFound === true" value="Found ✓" severity="success" />
              <Tag v-else-if="customerFound === false" value="Not found" severity="warn" />
            </div>

            <!-- New customer name prompt -->
            <div v-if="customerFound === false" class="mt-2">
              <InputText v-model="newCustomerName" placeholder="Enter customer name to create" class="w-full" />
              <Button
                label="Create customer"
                icon="pi pi-user-plus"
                size="small"
                class="mt-2"
                type="button"
                :loading="creatingCustomer"
                @click="createCustomer"
              />
            </div>

            <!-- Found customer info -->
            <div v-if="resolvedCustomer" class="mt-2 text-sm text-600">
              👤 {{ resolvedCustomer.name }} — {{ resolvedCustomer.phone }}
            </div>
          </div>

          <!-- Discount -->
          <div class="col-6 field">
            <label>Discount Type</label>
            <Select v-model="form.discountType" :options="discountTypes" option-label="label" option-value="value" placeholder="None" class="w-full" show-clear />
          </div>
          <div class="col-6 field">
            <label>Discount Value</label>
            <InputNumber v-model="form.discountValue" :min="0" :disabled="!form.discountType" class="w-full" />
          </div>

          <!-- Start / End Time -->
          <div class="col-6 field">
            <label>Start Time *</label>
            <DatePicker v-model="form.startTime" showTime hourFormat="12" class="w-full" />
          </div>
          <div class="col-6 field">
            <label>End Time</label>
            <DatePicker v-model="form.endTime" showTime hourFormat="12" class="w-full" />
          </div>

          <!-- Status -->
          <div class="col-12 md:col-6 field">
            <label>Initial Status</label>
            <Select v-model="form.status" :options="statusOptions" option-label="label" option-value="value" class="w-full" />
          </div>

          <!-- Notes -->
          <div class="col-12 field">
            <label>Notes</label>
            <Textarea v-model="form.notes" class="w-full" rows="3" placeholder="Products used, observations..." />
          </div>
        </div>

        <Message v-if="formError" severity="error" class="mb-2">{{ formError }}</Message>
        <div class="flex justify-content-end gap-2 mt-3">
          <Button label="Cancel" severity="secondary" outlined type="button" @click="$router.push('/tasks')" />
          <Button label="Create Task" icon="pi pi-check" type="submit" :loading="submitting" />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import serviceService from '../services/serviceService';
import taskService from '../services/taskService';

const toast  = useToast();
const router = useRouter();

const services       = ref([]);
const phoneInput     = ref('');
const customerFound  = ref(null); // null = not searched, true = found, false = not found
const resolvedCustomer  = ref(null);
const newCustomerName   = ref('');
const creatingCustomer  = ref(false);
const submitting     = ref(false);
const formError      = ref('');

const discountTypes = [
  { label: 'Percentage (%)', value: 'percentage' },
  { label: 'Fixed Amount (₹)', value: 'fixed' },
];

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
];

const form = reactive({
  serviceId: null,
  price: null,
  discountType: null,
  discountValue: null,
  startTime: new Date(),
  endTime: null,
  notes: '',
  status: 'pending',
  customerId: null,
});

const onServiceChange = () => {
  const svc = services.value.find((s) => s.id === form.serviceId);
  if (svc) {
    form.price = Number(svc.basePrice);
    if (!form.endTime && svc.duration) {
      const end = new Date(form.startTime);
      end.setMinutes(end.getMinutes() + svc.duration);
      form.endTime = end;
    }
  }
};

const lookupCustomer = async () => {
  const phone = phoneInput.value.trim();
  if (!phone) { customerFound.value = null; resolvedCustomer.value = null; return; }
  try {
    const res = await taskService.lookupCustomer(phone);
    if (res.data.found) {
      customerFound.value = true;
      resolvedCustomer.value = res.data.customer;
      form.customerId = res.data.customer.id;
    } else {
      customerFound.value = false;
      resolvedCustomer.value = null;
      form.customerId = null;
    }
  } catch {
    customerFound.value = null;
  }
};

const createCustomer = async () => {
  if (!newCustomerName.value.trim()) {
    toast.add({ severity: 'warn', summary: 'Name required', detail: 'Enter a customer name', life: 3000 });
    return;
  }
  creatingCustomer.value = true;
  try {
    const res = await taskService.createCustomer({ phone: phoneInput.value.trim(), name: newCustomerName.value.trim() });
    resolvedCustomer.value = res.data.customer;
    form.customerId = res.data.customer.id;
    customerFound.value = true;
    toast.add({ severity: 'success', summary: 'Customer created', life: 2000 });
  } catch (e) {
    // 409 = already exists (race condition)
    if (e.response?.status === 409) {
      resolvedCustomer.value = e.response.data.customer;
      form.customerId = e.response.data.customer.id;
      customerFound.value = true;
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create customer', life: 3000 });
    }
  } finally {
    creatingCustomer.value = false;
  }
};

const submitTask = async () => {
  if (!form.serviceId) { formError.value = 'Please select a service.'; return; }
  if (!form.price && form.price !== 0) { formError.value = 'Price is required.'; return; }
  if (!form.startTime) { formError.value = 'Start time is required.'; return; }

  submitting.value = true;
  formError.value = '';
  try {
    await taskService.createTask({
      serviceId: form.serviceId,
      customerId: form.customerId || null,
      startTime: form.startTime,
      endTime: form.endTime || null,
      price: form.price,
      discountType: form.discountType || null,
      discountValue: form.discountValue || null,
      notes: form.notes || null,
      status: form.status,
    });
    toast.add({ severity: 'success', summary: 'Task created!', life: 3000 });
    router.push('/tasks');
  } catch (e) {
    const details = e.response?.data?.details;
    formError.value = details ? details.join(' ') : (e.response?.data?.error || 'Failed to create task.');
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  const res = await serviceService.getServices();
  services.value = res.data.services.filter((s) => s.is_active);
});
</script>

<style scoped>
.new-task-page { max-width: 800px; margin: 0 auto; }
.card { background: var(--p-surface-card); border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.5rem; }
.field label { font-size: 0.85rem; font-weight: 600; color: #555; }
</style>
