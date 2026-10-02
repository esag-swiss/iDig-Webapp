<template>
  <q-badge color="grey-7" class="align-middle" :label="label" />
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
});
</script>
