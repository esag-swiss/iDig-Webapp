<template>
  <q-dialog v-model="model" :persistent="persistent">
    <q-card class="base-modal" :style="{ width }">
      <q-card-section class="row items-center no-wrap q-pb-none">
        <div class="text-h6" data-test="modal-title">{{ title }}</div>
        <q-space />
        <BaseButton
          icon="close"
          icon-size="sm"
          :aria-label="closeLabel"
          data-test="modal-close"
          @click="model = false"
        />
      </q-card-section>

      <q-card-section class="base-modal__body scroll" data-test="modal-body">
        <slot />
      </q-card-section>

      <q-card-actions
        v-if="$slots.actions"
        align="right"
        class="q-px-md q-pb-md"
        data-test="modal-actions"
      >
        <slot name="actions" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import BaseButton from "@/components/base/BaseButton.vue";

defineProps({
  title: { type: String, required: true },
  width: { type: String, default: "600px" },
  closeLabel: { type: String, default: "Close" },
  persistent: { type: Boolean, default: false },
});

const model = defineModel({ type: Boolean, required: true });
</script>

<style scoped>
.base-modal {
  max-width: 95vw;
}
.base-modal__body {
  max-height: 75vh;
}
</style>
