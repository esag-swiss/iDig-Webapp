<template>
  <q-btn-toggle
    v-model="selected"
    spread
    no-caps
    dense
    unelevated
    :toggle-color="toggleColor"
    color="white"
    :text-color="toggleColor"
    size="sm"
    class="border"
    :options="options"
  />
</template>

<script setup>
defineProps({
  options: { type: Array, required: true },
  toggleColor: { type: String, default: "primary" },
});

const selected = defineModel({ type: String, required: true });
</script>
