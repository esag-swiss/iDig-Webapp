<template>
  <button
    type="button"
    :class="[
      'base-button d-inline-flex align-items-center',
      `base-button--${variant}`,
      variant !== 'text' && `base-button--${size}`,
      isDisabled ? 'cursor-not-allowed' : 'cursor-pointer',
    ]"
    :aria-label="ariaLabel || undefined"
    :aria-busy="loading || undefined"
    :disabled="isDisabled"
  >
    <q-spinner
      v-if="loading"
      :size="iconSize || '1em'"
      :class="[label && 'mr-1']"
      data-test="base-button-spinner"
    />
    <BaseIcon
      v-else-if="icon"
      :name="icon"
      :size="iconSize"
      :class="[label && 'mr-1']"
      data-test="base-button-icon"
    />
    <span v-if="label">{{ label }}</span>
  </button>
</template>

<script setup>
import { computed } from "vue";
import BaseIcon from "@/components/base/BaseIcon.vue";

const props = defineProps({
  label: { type: String, default: "" },
  icon: { type: String, default: "" },
  iconSize: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  ariaLabel: { type: String, default: "" },
  variant: {
    type: String,
    default: "text",
    validator: (value) =>
      ["text", "primary", "outline", "danger"].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md"].includes(value),
  },
});

const isDisabled = computed(() => props.disabled || props.loading);
</script>

<style scoped>
.base-button {
  font: inherit;
  color: inherit;
  background: transparent;
  border: 0;
  padding: 0;
  white-space: nowrap;
}
.base-button:disabled {
  opacity: 0.6;
}
.base-button:focus {
  outline: none;
}
.base-button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  border-radius: 2px;
}

.base-button--md {
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}
.base-button--sm {
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 500;
}

.base-button--primary {
  background: var(--q-secondary);
  color: #fff;
}
.base-button--danger {
  background: var(--q-negative);
  color: #fff;
}
.base-button--outline {
  border: 1px solid var(--q-secondary);
  color: var(--q-secondary);
}
.base-button--primary:not(:disabled):hover,
.base-button--danger:not(:disabled):hover {
  filter: brightness(1.08);
}
.base-button--outline:not(:disabled):hover {
  background: rgba(38, 166, 154, 0.08);
}
</style>
