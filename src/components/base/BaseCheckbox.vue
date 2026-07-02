<template>
  <label
    :class="[
      disabled && 'cursor-not-allowed base-checkbox--disabled',
      !disabled && 'cursor-pointer',
      'd-inline-flex items-center non-selectable m-0',
    ]"
  >
    <input
      type="checkbox"
      class="mr-1"
      data-test="checkbox-input"
      :checked="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span>{{ label }}</span>
  </label>
</template>

<script>
export default {
  name: "BaseCheckbox",
  props: {
    modelValue: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    label: { type: String, required: true },
  },
  emits: ["update:modelValue"],
};
</script>

<style scoped>
.base-checkbox--disabled {
  opacity: 0.6;
}
</style>
