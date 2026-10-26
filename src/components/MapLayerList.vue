<template>
  <BaseAccordion
    class="map-layer-list"
    :initial-open="initialOpen"
    :toggle-aria-label="toggleAriaLabel"
  >
    <template #title>
      <span v-if="checkboxLabel === null" class="text-bold map-layer-list__title">
        <slot name="title" />
      </span>
      <BaseCheckbox
        v-else
        class="text-bold map-layer-list__title map-layer-list__checkbox"
        :model-value="isAllVisible"
        :label="checkboxLabel"
        @update:model-value="(checked) => $emit('toggle-group', checked)"
      />
    </template>
    <template #content>
      <div v-for="plan in plans" :key="plan.id">
        <MapLayerListItem
          :plan="plan"
          :checked="isPlanVisible(plan)"
          :favorite="isFavorite(plan)"
          @toggle-visible="$emit('toggle-visible', plan)"
          @toggle-favorite="$emit('toggle-favorite', plan)"
        />
      </div>
    </template>
  </BaseAccordion>
</template>

<script>
import BaseAccordion from "@/components/base/BaseAccordion.vue";
import BaseCheckbox from "@/components/base/BaseCheckbox.vue";
import MapLayerListItem from "@/components/MapLayerListItem.vue";

export default {
  name: "MapLayerList",
  components: { BaseAccordion, BaseCheckbox, MapLayerListItem },
  props: {
    plans: { type: Array, required: true },
    visiblePlanIds: { type: Array, required: true },
    favoritePlanIds: { type: Array, required: true },
    checkboxLabel: { type: String, default: null },
    initialOpen: { type: Boolean, default: false },
    toggleAriaLabel: { type: String, default: "Toggle group" },
  },
  emits: ["toggle-visible", "toggle-favorite", "toggle-group"],
  computed: {
    isAllVisible() {
      return (
        this.plans.length > 0 &&
        this.plans.every((plan) => this.isPlanVisible(plan))
      );
    },
  },
  methods: {
    isPlanVisible(plan) {
      return this.visiblePlanIds.includes(plan.id);
    },
    isFavorite(plan) {
      return this.favoritePlanIds.includes(plan.id);
    },
  },
};
</script>

<style scoped>
.map-layer-list__title {
  font-size: 0.95rem;
}
.map-layer-list :deep(.base-accordion__header) {
  min-height: 32px;
  font-size: 0.9rem;
}
.map-layer-list :deep([data-test="accordion-toggle"]) {
  padding: 6px !important;
}
.map-layer-list__checkbox :deep(input) {
  width: 17px;
  height: 17px;
}
</style>
