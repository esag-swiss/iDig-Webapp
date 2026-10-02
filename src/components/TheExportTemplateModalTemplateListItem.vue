<template>
  <q-item
    clickable
    :active="active"
    active-class="bg-teal-1 text-weight-bold"
    @click="emit('select')"
  >
    <q-item-section>{{ label }}</q-item-section>
  </q-item>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  active: { type: Boolean, default: false },
});

const emit = defineEmits(["select"]);
</script>
