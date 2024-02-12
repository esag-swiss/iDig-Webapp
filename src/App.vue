<template>
  <TheSpinner></TheSpinner>

  <!-- HEADER -->
  <TheHeader class="sticky-top"></TheHeader>

  <div class="container-fluid">
    <div v-if="isLoaded" class="row">
      <!-- SIDEBAR -->
      <nav class="col-2 d-block bg-light sidebar">
        <div class="sidebar-sticky hidescrollbar p-1">
          <TheControlSearch></TheControlSearch>
          <TheControlTrenches> </TheControlTrenches>
          <TheControlFields> </TheControlFields>
          <TheControlExport> </TheControlExport>
        </div>
      </nav>

      <!-- MAIN FRAME The map and tab goes here -->
      <div class="col-10 p-1">
        <div
          v-if="checkedTrenchesItemsSelectedType.length > 0"
          class="theTableDiv"
          :class="{ toggled: isMapMinimized }"
        >
          <TheTable> </TheTable>
        </div>

        <div v-else class="d-flex justify-content-center mt-5">
          Pas de données sélectionnées
        </div>

        <div
          v-if="checkedTrenchesItemsSelectedType.length > 0"
          class="theMapDiv"
          :class="{ toggled: isMapMinimized }"
        >
          <TheMap></TheMap>
        </div>
        <div
          v-if="checkedTrenchesItemsSelectedType.length > 0"
          :class="{ miniMap: isMapMinimized }"
          class="theToggle"
          @click="toggleMap"
        ></div>
      </div>
    </div>
    <div v-else class="d-flex justify-content-center mt-5">
      Veuillez vous connecter
    </div>
  </div>
</template>

<script>
import TheControlTrenches from "@/components/TheControlTrenches.vue";
import TheHeader from "@/components/TheHeader.vue";
import TheControlFields from "@/components/TheControlFields.vue";
import TheTable from "@/components/TheTable.vue";
import TheSpinner from "@/components/TheSpinner.vue";
import TheControlExport from "@/components/TheControlExport.vue";
import TheMap from "@/components/TheMap.vue";
import { mapActions, mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import { useDataStore } from "@/stores/data";
import TheControlSearch from "@/components/TheControlSearch.vue";

export default {
  name: "App",
  components: {
    TheControlSearch,
    TheSpinner,
    TheControlTrenches,
    TheControlFields,
    TheTable,
    TheHeader,
    TheControlExport,
    TheMap,
  },
  computed: {
    ...mapState(useAppStore, ["isLoaded", "isMapMinimized"]),
    ...mapState(useDataStore, ["checkedTrenchesItemsSelectedType"]),
  },

  methods: {
    toggleMap() {
      this.setIsMapMinimized(!this.isMapMinimized);
    },
    ...mapActions(useAppStore, ["setIsMapMinimized"]),
  },
};
</script>

<style>
#app h3 {
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 0rem;
}

.theToggle:hover {
  cursor: pointer;
}

.theToggle,
.theMapDiv.toggled,
.theTableDiv {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 100px;
  height: 100px;
  border-radius: 25px;
  font-size: 30%;
  z-index: 1022;
  overflow: hidden;
  transition: width 0.3s, height 0.3s;
}

.miniMap {
  background-image: url("@/assets/plan.PNG");
  background-size: contain;
}

.theMapDiv {
  z-index: 1000;
}

.theMapDiv,
.theTableDiv.toggled {
  position: relative;
  bottom: 0px;
  right: 1px;
  width: 100%;
  height: 100%;
  border-radius: 0px;
  font-size: 100%;
}

/*
 * Sidebar 
 */

.sidebar {
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100; /* Behind the navbar */
  padding: 0;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.1);
}

.sidebar-sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 48px; /* Height of navbar */
  height: calc(100vh - 48px);
  padding-top: 0.5rem;
  overflow-x: hidden;
  overflow-y: auto; /* Scrollable contents if viewport is shorter than content. */
}

.sidebar .nav-link {
  font-weight: 500;
  color: #333;
}

.sidebar .nav-link .feather {
  margin-right: 4px;
  color: #999;
}

.sidebar .nav-link.active {
  color: #007bff;
}

.sidebar .nav-link:hover .feather,
.sidebar .nav-link.active .feather {
  color: inherit;
}

.sidebar-heading {
  font-size: 0.75rem;
  text-transform: uppercase;
}

/*
 * Navbar
 */

.navbar-brand {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  font-size: 1rem;
  background-color: rgba(0, 0, 0, 0.25);
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.25);
}

.navbar .form-control {
  padding: 0.75rem 1rem;
  border-width: 0;
  border-radius: 0;
}

.form-control-dark {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
}

.form-control-dark:focus {
  border-color: transparent;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25);
}

/*
 * Utilities
 */

.border-top {
  border-top: 1px solid #e5e5e5;
}
.border-bottom {
  border-bottom: 1px solid #e5e5e5;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.hidescrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.hidescrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
