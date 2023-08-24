<template>
  <div v-if="isLoading" class="spinner-TheItem vh-100 vw-100 position-absolute">
    <div class="d-flex justify-content-center align-items-center vh-100">
      <div class="spinner-border text-light" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useAppStore } from "@/stores/app";

export default {
  name: "TheSpinner",
  computed: {
    ...mapState(useAppStore, ["isLoading"]),
  },
};
</script>

<style scoped>
.spinner-TheItem {
  background-color: rgb(0, 0, 0, 0.85);
  z-index: 3000;
}

.spinner-border {
  width: 5rem;
  height: 5rem;
}
</style>
