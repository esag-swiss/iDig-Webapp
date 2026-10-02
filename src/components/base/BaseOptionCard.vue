<template>
  <button
    type="button"
    class="base-option-card"
    :class="{ 'base-option-card--selected': selected }"
    :aria-pressed="selected"
    @click="emit('select')"
  >
    <q-icon
      v-if="icon"
      :name="icon"
      size="sm"
      class="q-mr-sm"
      data-test="option-card-icon"
    />
    <span class="column items-start">
      <span class="text-weight-medium" data-test="option-card-label">{{
        label
      }}</span>
      <span
        v-if="description"
        class="text-caption text-grey-7 text-left"
        data-test="option-card-description"
        >{{ description }}</span
      >
    </span>
  </button>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  description: { type: String, default: "" },
  icon: { type: String, default: "" },
  selected: { type: Boolean, default: false },
});

const emit = defineEmits(["select"]);
</script>

<style scoped>
.base-option-card {
  display: flex;
  align-items: flex-start;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  font: inherit;
  color: inherit;
  cursor: pointer;
  text-align: left;
}
.base-option-card:hover {
  border-color: var(--q-secondary);
}
.base-option-card--selected {
  border-color: var(--q-secondary);
  box-shadow: inset 0 0 0 1px var(--q-secondary);
  background: rgba(38, 166, 154, 0.08);
}
.base-option-card:focus-visible {
  outline: 2px solid var(--q-secondary);
  outline-offset: 2px;
}
</style>
