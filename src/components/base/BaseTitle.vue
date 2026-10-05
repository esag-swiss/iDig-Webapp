<template>
  <h3 class="base-title d-flex align-items-center">
    <span>{{ label }}</span>
    <slot />
  </h3>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
});
</script>

<style scoped>
.base-title {
  gap: 0.25rem;
}
</style>
