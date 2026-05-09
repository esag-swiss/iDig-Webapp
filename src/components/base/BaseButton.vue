<template>
  <button
    type="button"
    :class="[
      disabled && 'cursor-not-allowed',
      !disabled && 'cursor-pointer',
      'base-button d-inline-flex align-items-center p-0 bg-transparent border-0',
    ]"
    :aria-label="ariaLabel || undefined"
    :disabled="disabled"
  >
    <BaseIcon
      v-if="icon"
      :name="icon"
      :size="iconSize"
      :class="[label && 'mr-1']"
    />
    <span v-if="label">{{ label }}</span>
  </button>
</template>

<script>
import BaseIcon from "@/components/base/BaseIcon.vue";

export default {
  name: "BaseButton",
  components: { BaseIcon },
  props: {
    label: { type: String, default: "" },
    icon: { type: String, default: "" },
    iconSize: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
    ariaLabel: { type: String, default: "" },
  },
};
</script>

<style scoped>
.base-button {
  font: inherit;
  color: inherit;
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
</style>
