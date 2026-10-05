<template>
  <select v-model="model" class="form-control form-control-sm mb-1">
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :disabled="option.disabled"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script setup>
defineProps({
  options: { type: Array, default: () => [] },
});

const model = defineModel({ type: String, default: "" });
</script>
