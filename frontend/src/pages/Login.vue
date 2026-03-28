<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <span class="login-logo">✂️</span>
        <h1>Salon POS</h1>
        <p>Sign in to your account</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="field">
          <label for="email">Email</label>
          <InputText
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@salon.com"
            class="w-full"
            :invalid="!!error"
            required
          />
        </div>

        <div class="field">
          <label for="password">Password</label>
          <Password
            id="password"
            v-model="password"
            placeholder="Password"
            class="w-full"
            :feedback="false"
            toggleMask
            :invalid="!!error"
            required
          />
        </div>

        <Message v-if="error" severity="error" class="mb-3">{{ error }}</Message>

        <Button
          type="submit"
          label="Sign In"
          icon="pi pi-sign-in"
          class="w-full"
          :loading="loading"
        />
      </form>

      <div class="demo-credentials">
        <p class="demo-label">Demo accounts</p>
        <div class="demo-buttons">
          <button
            v-for="cred in demoCredentials"
            :key="cred.email"
            type="button"
            class="demo-btn"
            :class="cred.role"
            @click="fillCredentials(cred)"
          >
            <span class="demo-role">{{ cred.label }}</span>
            <span class="demo-email">{{ cred.email }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Password from 'primevue/password';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const demoCredentials = [
  { label: 'Admin', role: 'admin', email: 'admin@salon.com', password: 'admin123' },
  { label: 'Nimal', role: 'employee', email: 'nimal@salon.com', password: 'employee123' },
  { label: 'Dilini', role: 'employee', email: 'dilini@salon.com', password: 'employee123' },
  { label: 'Kasun', role: 'employee', email: 'kasun@salon.com', password: 'employee123' },
];

const fillCredentials = (cred) => {
  email.value = cred.email;
  password.value = cred.password;
  error.value = '';
};

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  const result = await authStore.login(email.value, password.value);
  if (result.success) {
    router.push('/dashboard');
  } else {
    error.value = result.message;
  }
  loading.value = false;
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 50%, #1a1a2e 100%);
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  width: 380px;
  max-width: 95vw;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.login-header h1 {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e1e2e;
  margin: 0 0 0.25rem 0;
}

.login-header p {
  color: #888;
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #555;
}

.demo-credentials {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid #eee;
}

.demo-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.6rem 0;
  text-align: center;
}

.demo-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.demo-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.5rem 0.65rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
  text-align: left;
}

.demo-btn:hover {
  background: #f0f4ff;
  border-color: #a5b4fc;
}

.demo-btn.admin {
  border-color: #fde68a;
  background: #fffbeb;
}

.demo-btn.admin:hover {
  background: #fef3c7;
  border-color: #f59e0b;
}

.demo-role {
  font-size: 0.75rem;
  font-weight: 700;
  color: #374151;
}

.demo-btn.admin .demo-role {
  color: #92400e;
}

.demo-email {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 0.1rem;
}
</style>
