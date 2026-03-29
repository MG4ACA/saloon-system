import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { createPinia } from 'pinia';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import { createApp } from 'vue';
import App from './App.vue';
import './assets/design-system.css';
import router from './router';

// ── Salon POS Pink Theme ────────────────────────────────────────
const SalonPinkPreset = definePreset(Aura, {
  primitive: {
    pink: {
      50: '#FFF9F9',
      100: '#FADADD',
      200: '#F5C6C6',
      300: '#EFA5A5',
      400: '#EE8686',
      500: '#E67272',
      600: '#D97373',
      700: '#C45F5F',
      800: '#945F5F',
      900: '#6B3A3A',
      950: '#4A1D1D',
    },
  },
  semantic: {
    primary: {
      50: '{pink.50}',
      100: '{pink.100}',
      200: '{pink.200}',
      300: '{pink.300}',
      400: '{pink.400}',
      500: '{pink.500}',
      600: '{pink.600}',
      700: '{pink.700}',
      800: '{pink.800}',
      900: '{pink.900}',
      950: '{pink.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{pink.400}',
          contrastColor: '#ffffff',
          hoverColor: '{pink.600}',
          activeColor: '{pink.700}',
        },
        surface: {
          0: '#ffffff',
          50: '#FFF9F9',
          100: '#FADADD',
          200: '#F5C6C6',
          300: '#EFA5A5',
          400: '#EE8686',
          500: '#D97373',
          600: '#C45F5F',
          700: '#945F5F',
          800: '#6B3A3A',
          900: '#4A1D1D',
          950: '#3A1010',
        },
      },
    },
  },
  components: {
    button: {
      borderRadius: '8px',
    },
    inputtext: {
      borderRadius: '8px',
    },
    select: {
      borderRadius: '8px',
    },
    card: {
      borderRadius: '12px',
      shadow: '0 4px 20px rgba(238, 134, 134, 0.15)',
    },
    dialog: {
      borderRadius: '12px',
    },
  },
});

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: SalonPinkPreset,
    options: {
      darkModeSelector: '.never-dark',
      cssLayer: false,
    },
  },
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');
