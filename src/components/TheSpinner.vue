<template>
  <div
    v-if="appState.isLoading"
    class="spinner-TheItem vh-100 vw-100 position-absolute"
  >
    <div class="d-flex justify-content-center align-items-center vh-100">
      <div class="spinner-border text-light" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { useAppState } from "@/services/useAppState";

export default {
  name: "TheSpinner",
  setup() {
    const { appState } = useAppState();
    return { appState };
  },
};
</script>

<style scoped>
.spinner-TheItem {
  background-color: rgb(0, 0, 0, 0.85);
  z-index: 10000;
}

.spinner-border {
  width: 5rem;
  height: 5rem;
}
</style>
