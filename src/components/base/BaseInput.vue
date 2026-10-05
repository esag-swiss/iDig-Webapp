<template>
  <q-input
    v-model="model"
    square
    filled
    dense
    clearable
    :placeholder="placeholder"
  />
</template>

<script setup>
defineProps({
  placeholder: { type: String, default: "" },
});

const model = defineModel({ type: String, default: "" });
</script>
