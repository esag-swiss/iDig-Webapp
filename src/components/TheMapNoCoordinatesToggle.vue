<template>
  <div class="toggle-container">
    <q-toggle
      :model-value="showItemsWithoutCoordinates"
      size="xs"
      dense
      color="primary"
      :label="$t('app.show_items_without_coordinates')"
      @update:model-value="setShowItemsWithoutCoordinates"
    />
    <q-tooltip class="bg-accent">
      {{ $t("app.items_without_coordinates_position") }}
    </q-tooltip>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();
const { showItemsWithoutCoordinates } = storeToRefs(appStore);
const { setShowItemsWithoutCoordinates } = appStore;
</script>

<style scoped>
.toggle-container {
  padding: 6px 10px;
  white-space: nowrap;
  background: #fff;
  border-radius: 5px;
  font-size: 12px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
}
</style>
