<template>
  <div class="map-layer-modal">
    <div class="d-flex justify-content-end">
      <BaseButton
        class="map-layer-modal__toggle"
        :icon="isPanelOpen ? 'close' : 'layers'"
        :label="isPanelOpen ? $t('app.close') : $t('app.plans')"
        :aria-label="isPanelOpen ? $t('app.close') : $t('app.plans')"
        @click="isPanelOpen = !isPanelOpen"
      />
    </div>

    <TheMapLayerModalContent
      v-show="isPanelOpen"
      class="map-layer-modal__content"
      :plans="plans"
      :visible-plan-ids="visiblePlanIds"
      @toggle-visible="$emit('toggle-visible', $event)"
    />
  </div>
</template>

<script>
import BaseButton from "@/components/base/BaseButton.vue";
import TheMapLayerModalContent from "@/components/TheMapLayerModalContent.vue";

export default {
  name: "TheMapLayerModal",
  components: { BaseButton, TheMapLayerModalContent },
  props: {
    plans: { type: Array, required: true },
    visiblePlanIds: { type: Array, required: true },
  },
  emits: ["toggle-visible"],
  data() {
    return {
      isPanelOpen: false,
    };
  },
};
</script>

<style scoped>
.map-layer-modal {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}
.map-layer-modal__toggle {
  background: white !important;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 6px 10px !important;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
}
.map-layer-modal__content {
  margin-top: 4px;
}
</style>
