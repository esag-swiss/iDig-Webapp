<template>
  <div>
    <q-toggle
      v-model="model"
      :size="size"
      :color="color"
      :icon="icon"
      :disable="disable"
    >
      <span v-if="label" class="gt-sm text-grey-8" data-test="toggle-label">{{
        label
      }}</span>
    </q-toggle>
    <q-tooltip class="bg-accent">{{ tooltip }}</q-tooltip>
  </div>
</template>

<script setup>
defineProps({
  tooltip: { type: String, required: true },
  label: { type: String, default: undefined },
  color: { type: String, default: "secondary" },
  icon: { type: String, default: undefined },
  size: { type: String, default: "sm" },
  disable: { type: Boolean, default: false },
});

const model = defineModel({ type: Boolean, required: true });
</script>
