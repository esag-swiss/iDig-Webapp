<template>
  <div class="base-accordion">
    <div class="base-accordion__header d-flex align-items-center px-1">
      <BaseButton
        :icon="isOpen ? 'keyboard_arrow_down' : 'keyboard_arrow_right'"
        icon-size="sm"
        :aria-label="toggleAriaLabel"
        class="mr-1"
        @click="toggle"
      />
      <slot name="title" />
    </div>
    <div v-if="isOpen" class="py-1 pl-4">
      <slot name="content" />
    </div>
  </div>
</template>

<script>
import BaseButton from "@/components/base/BaseButton.vue";

export default {
  name: "BaseAccordion",
  components: { BaseButton },
  props: {
    initialOpen: { type: Boolean, default: false },
    toggleAriaLabel: { type: String, default: "Toggle section" },
  },
  data() {
    return {
      isOpen: this.initialOpen,
    };
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
    },
  },
};
</script>

<style scoped>
.base-accordion + .base-accordion {
  border-top: 1px solid #e5e5e5;
}
.base-accordion__header {
  transition: background-color 0.15s;
}
.base-accordion__header:hover {
  background-color: #ececec;
}
</style>
