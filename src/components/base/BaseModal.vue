<template>
  <q-dialog v-model="isOpen">
    <q-card class="base-modal">
      <q-card-section class="d-flex align-items-center justify-content-between">
        <div class="text-h6">
          <slot name="title" />
        </div>
        <BaseButton
          icon="close"
          aria-label="Close"
          data-test="base-modal-close"
          @click="isOpen = false"
        />
      </q-card-section>

      <q-card-section class="base-modal__content">
        <slot name="content" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import BaseButton from "@/components/base/BaseButton.vue";

const isOpen = defineModel({ type: Boolean, default: false });
</script>

<style scoped>
.base-modal {
  min-width: 300px;
  max-width: 600px;
}
.base-modal__content {
  max-height: 60vh;
  overflow-y: auto;
}
</style>
