<template>
  <div class="container-fluid px-1 q-gutter-sm">
    <h3>{{ $t("app.export") }}</h3>
    <BaseButton
      variant="primary"
      size="sm"
      icon="download"
      :label="$t('app.export_open')"
      @click="isExportOpen = true"
    />
    <TheExportModal v-model="isExportOpen" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import BaseButton from "@/components/base/BaseButton.vue";
import TheExportModal from "@/components/TheExportModal.vue";

const isExportOpen = ref(false);
</script>
