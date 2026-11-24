<template>
  <div class="map-base-layer-switch">
    <q-option-group
      :model-value="selectedLabel"
      :options="options"
      type="radio"
      size="xs"
      dense
      @update:model-value="$emit('select', $event)"
    />
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  labels: { type: Array, required: true },
  selectedLabel: { type: String, required: true },
});

defineEmits(["select"]);

const options = computed(() =>
  props.labels.map((label) => ({ label, value: label })),
);
</script>

<style scoped>
.map-base-layer-switch {
  padding: 4px 10px;
  background: #fff;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  font-size: 12px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
}
</style>
