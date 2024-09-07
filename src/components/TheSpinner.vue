<template>
  <div v-if="loadingCount > 0" class="vh-100 vw-100 position-absolute">
    <div class="d-flex justify-content-center align-items-center vh-100">
      <div class="spinner-container">
        <div class="spinner-border text-dark" role="status"></div>
        <span class="spinner-text">{{ loadingCount }}</span>
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
    ...mapState(useAppStore, ["loadingCount"]),
  },
};
</script>

<style scoped>
.spinner-TheItem {
  background-color: rgb(0, 0, 0, 0.85);
}

.spinner-container {
  position: relative;
  z-index: 3000;
}

.spinner-border {
  width: 5rem;
  height: 5rem;
}

.spinner-text {
  color: black;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1rem; /* Ajustez la taille de la police selon vos besoins */
}
</style>
