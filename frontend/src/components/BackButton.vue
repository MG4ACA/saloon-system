<template>
  <Button
    icon="pi pi-arrow-left"
    text
    rounded
    class="back-btn"
    :aria-label="label"
    @click="go"
  />
</template>

<script setup>
import Button from 'primevue/button';
import { useRouter } from 'vue-router';

const props = defineProps({
  to:    { type: String, default: null },
  label: { type: String, default: 'Go back' },
});

const router = useRouter();
const go = () => (props.to ? router.push(props.to) : router.back());
</script>

<style scoped>
.back-btn {
  flex-shrink: 0;
  min-width: 44px;
  min-height: 44px;
  font-size: 1rem;
}
</style>
