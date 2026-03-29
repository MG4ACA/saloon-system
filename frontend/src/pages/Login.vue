<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <img src="/logo.png" alt="Salon POS Logo" class="login-logo" />
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
  background: linear-gradient(150deg, #fff1f1 0%, #fadadd 40%, #f5c6c6 100%);
}

.login-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 2.75rem 2.25rem;
  width: 400px;
  max-width: 95vw;
  box-shadow:
    0 20px 60px rgba(238, 134, 134, 0.22),
    0 4px 16px rgba(238, 134, 134, 0.12);
  border: 1px solid #f5c6c6;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  width: 88px;
  height: 88px;
  object-fit: contain;
  display: block;
  margin: 0 auto 0.75rem;
  border-radius: 50%;
  padding: 10px;
  background: #fadadd;
  border: 2px solid #f5c6c6;
}

.login-header h1 {
  font-size: 1.65rem;
  font-weight: 800;
  color: #4a1d1d;
  margin: 0 0 0.3rem 0;
  letter-spacing: -0.01em;
}

.login-header p {
  color: #945f5f;
  font-size: 0.9rem;
  font-weight: 500;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.field label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #945f5f;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.demo-credentials {
  margin-top: 1.6rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f5c6c6;
}

.demo-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #bf8a8a;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin: 0 0 0.65rem 0;
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
  padding: 0.55rem 0.7rem;
  border-radius: 8px;
  border: 1px solid #f5c6c6;
  background: #fff9f9;
  cursor: pointer;
  transition:
    background 0.18s,
    border-color 0.18s,
    box-shadow 0.18s;
  text-align: left;
}

.demo-btn:hover {
  background: #fadadd;
  border-color: #ee8686;
  box-shadow: 0 2px 8px rgba(238, 134, 134, 0.2);
}

.demo-btn.admin {
  border-color: #ee8686;
  background: #fff1f1;
}

.demo-btn.admin:hover {
  background: #fadadd;
  border-color: #d97373;
}

.demo-role {
  font-size: 0.75rem;
  font-weight: 700;
  color: #4a1d1d;
}

.demo-btn.admin .demo-role {
  color: #d97373;
}

.demo-email {
  font-size: 0.7rem;
  color: #bf8a8a;
  margin-top: 0.1rem;
}
</style>
