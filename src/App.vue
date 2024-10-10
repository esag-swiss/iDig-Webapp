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
          <TheControlTrenches></TheControlTrenches>
          <TheControlFields></TheControlFields>
          <TheControlExport></TheControlExport>
        </div>
      </nav>

      <!-- MAIN FRAME The map and tab goes here -->
      <div class="col-10 p-1">
        <div
          v-if="checkedTrenchesItemsSelectedType.length > 0"
          class="theTableDiv"
          :class="{ minimized: !isMapMinimized }"
        >
          <TheTable></TheTable>
        </div>

        <div v-else class="d-flex justify-content-center mt-5">
          Pas de données sélectionnées
        </div>

        <div
          v-if="checkedTrenchesItemsSelectedType.length > 0"
          class="theMapDiv"
          :class="{ minimized: isMapMinimized }"
        >
          <TheMap></TheMap>
        </div>
        <div v-show="isLoaded" class="mapbtn">
          <q-btn
            v-show="
              checkedTrenchesItemsSelectedType.length > 0 &&
              isMapMinimized &&
              !isItemSelected
            "
            align="left"
            padding="2px"
            color="secondary"
            icon="map"
            @click="toggleMap"
            ><q-tooltip
              class="bg-accent"
              anchor="top middle"
              self="center right"
              :offset="[100, 20]"
              >map view</q-tooltip
            ></q-btn
          >
          <q-btn
            v-show="
              checkedTrenchesItemsSelectedType.length > 0 && !isMapMinimized
            "
            align="left"
            padding="2px"
            color="secondary"
            icon="format_list_bulleted"
            @click="toggleMap"
            ><q-tooltip class="bg-accent">list view</q-tooltip></q-btn
          >
        </div>
      </div>
    </div>
    <div v-else class="d-flex justify-content-center mt-5">
      Veuillez vous connecter
    </div>
  </div>
</template>

<script>
import TheHeader from "@/components/TheHeader.vue";
import TheControlSearch from "@/components/TheControlSearch.vue";
import TheControlTrenches from "@/components/TheControlTrenches.vue";
import TheControlFields from "@/components/TheControlFields.vue";
import TheControlExport from "@/components/TheControlExport.vue";
import TheTable from "@/components/TheTable.vue";
import TheSpinner from "@/components/TheSpinner.vue";
import TheMap from "@/components/TheMap.vue";
import { mapActions, mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import { useDataStore } from "@/stores/data";

export default {
  name: "App",
  components: {
    TheHeader,
    TheSpinner,
    TheControlSearch,
    TheControlTrenches,
    TheControlFields,
    TheControlExport,
    TheTable,
    TheMap,
  },
  computed: {
    ...mapState(useAppStore, ["isLoaded", "isMapMinimized", "isItemSelected"]),
    ...mapState(useDataStore, ["checkedTrenchesItemsSelectedType"]),
  },
  watch: {
    checkedTrenchesItemsSelectedType: function () {
      if (Object.keys(this.checkedTrenchesItemsSelectedType).length === 0) {
        this.setIsMapMinimized(true);
      }
    },
  },
  methods: {
    toggleMap() {
      this.setIsMapMinimized(!this.isMapMinimized);
    },
    ...mapActions(useAppStore, ["setIsMapMinimized"]),
  },
};
</script>

<style scoped>
.mapbtn {
  position: fixed;
  bottom: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 1022;
}

.theTableDiv {
  overflow: hidden;
  height: 93vh;
}

.theMapDiv {
  height: 100%;
}
.theMapDiv,
.theTableDiv {
  position: relative;

  width: 100%;
}

.theMapDiv.minimized {
  transition: width 0.5s, height 0.5s;
}

.minimized {
  position: fixed;
  bottom: 20px;
  right: 30px;
  width: 5px;
  height: 5px;
  z-index: 1022;
  overflow: hidden;
}
</style>

<style>
h3 {
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 0rem;
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

/* Hide scrollbar for Chrome, Safari and Opera */
.hidescrollbar::-webkit-scrollbar {
  display: none;
}
.hidescrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
