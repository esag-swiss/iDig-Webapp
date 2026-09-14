<template>
  <div v-show="!isItemSelected" id="mapContainer"></div>
  <TheMapLayerModal
    v-show="!isItemSelected"
    :plans="overlayPlans"
    :visible-plan-ids="visiblePlanIds"
    @toggle-visible="togglePlanVisible"
  />
  <div v-show="!isItemSelected" id="exportButtons">
    <q-btn
      v-show="!isItemSelected && !isMapMinimized"
      align="left"
      padding="2px"
      color="secondary"
      icon="download"
      @click="exportMapAsPNG()"
      ><q-tooltip class="bg-accent">export map</q-tooltip></q-btn
    >
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { mapState } from "pinia";
import { useDataStore } from "@/stores/data";
import { useAppStore } from "@/stores/app";
import { createMapsOverlaysList, baseLayersTree } from "@/services/mapOverlays.js";
import { loadItemsLayer } from "@/services/mapItemsLayers.js";
import { exportMapAsCompositeSVG } from "@/services/mapExport.js";
import TheMapLayerModal from "@/components/TheMapLayerModal.vue";

export default {
  name: "TheMap",
  components: { TheMapLayerModal },
  data() {
    return {
      map: null,
      itemsLayer: null,
      baseLayersTree: null,
      overlayPlans: [],
      visiblePlanIds: [],
      baseLayerControl: null,
      firstMapShowed: true,
      isProcessingTrenchItemsPlans: false,
      enableScrollWheelZoom: true,
      wheelDebounceTime: 140,
      wheelPxPerZoomLevel: 180,
      selectedBaseLayer: null,
    };
  },
  computed: {
    ...mapState(useAppStore, [
      "isMapMinimized",
      "loadingCount",
      "isItemSelected",
    ]),
    ...mapState(useDataStore, [
      "checkedTrenchesItemsPlans",
      "checkedTrenchesItemsSelectedTypeAndSearched",
      "projectPreferencesCRS",
      "tableFilteredCheckedTrenchesItems",
    ]),
    itemsForMap() {
      return (
        this.tableFilteredCheckedTrenchesItems ??
        this.checkedTrenchesItemsSelectedTypeAndSearched
      );
    },
  },
  watch: {
    // initialize map when first toggled on
    isMapMinimized: async function () {
      try {
        this.destroyMap();
        await this.$nextTick();
        // Reinitialize the map
        await this.initMap();
      } catch (error) {
        console.error(error);
      }
    },
    // load items layer after all selected trenches are loaded
    loadingCount: function (newLoadingCount, oldLoadingCount) {
      if (
        oldLoadingCount === 1 &&
        newLoadingCount === 0 &&
        this.map &&
        !this.isProcessingTrenchItemsPlans
      ) {
        this.loadItemsLayer(false);
      }
    },
    // reload items layer after removing trenches or when table pushes filtered data
    itemsForMap: function () {
      if (
        this.loadingCount === 0 &&
        this.map &&
        !this.isProcessingTrenchItemsPlans
      ) {
        this.loadItemsLayer(false);
      }
    },
    // reload overlays tree when changing trenches
    checkedTrenchesItemsPlans: async function () {
      if (this.map && !this.isProcessingTrenchItemsPlans) {
        this.isProcessingTrenchItemsPlans = true;
        try {
          this.destroyMap();
          await this.$nextTick();
          // Reinitialize the map
          await this.initMap();
        } catch (error) {
          console.error(error);
        } finally {
          this.isProcessingTrenchItemsPlans = false;
        }
      }
    },
  },
  beforeUnmount() {
    this.destroyMap();
  },
  methods: {
    destroyMap() {
      if (!this.map) {
        return;
      }

      try {
        this.map.stop();
      } catch {
        // noop
      }

      if (this.itemsLayer) {
        this.itemsLayer.remove();
        this.itemsLayer = null;
      }

      if (this.baseLayerControl) {
        this.baseLayerControl.remove();
        this.baseLayerControl = null;
      }

      this.overlayPlans = [];
      this.visiblePlanIds = [];

      this.map.off();
      this.map.remove();
      this.map = null;
    },

    async initMap() {
      this.baseLayersTree = baseLayersTree;
      this.overlayPlans = await createMapsOverlaysList(
        this.checkedTrenchesItemsPlans,
        this.projectPreferencesCRS,
      );
      this.visiblePlanIds = this.overlayPlans.map((plan) => plan.id);

      // Creation de la carte
      this.map = L.map("mapContainer", {
        attributionControl: false,
        zoomControl: true,
        zoomDelta: 0.25,
        zoomSnap: 0.25,
        zoomAnimation: false,
        fadeAnimation: false,
        markerZoomAnimation: false,
        scrollWheelZoom: this.enableScrollWheelZoom,
        wheelDebounceTime: this.wheelDebounceTime,
        wheelPxPerZoomLevel: this.wheelPxPerZoomLevel,
        layers: this.selectedBaseLayer ?? this.baseLayersTree.children[3].layer,
      });

      const baseLayersObject = Object.fromEntries(
        this.baseLayersTree.children.map((baseLayer) => [
          baseLayer.label,
          baseLayer.layer,
        ]),
      );
      this.baseLayerControl = L.control
        .layers(baseLayersObject, null, {
          collapsed: false,
          position: "topleft",
        })
        .addTo(this.map);

      this.map.on("baselayerchange", (event) => {
        this.selectedBaseLayer = event.layer;
      });

      this.overlayPlans.forEach((plan) => plan.layer.addTo(this.map));

      // Ajout de l'échelle
      L.control
        .scale({ position: "bottomleft", imperial: false })
        .addTo(this.map);

      // Ajout des items
      this.loadItemsLayer(true);
    },

    togglePlanVisible(plan) {
      const isVisible = this.visiblePlanIds.includes(plan.id);
      if (isVisible) {
        plan.layer.remove();
        this.visiblePlanIds = this.visiblePlanIds.filter((id) => id !== plan.id);
      } else {
        plan.layer.addTo(this.map);
        this.visiblePlanIds = [...this.visiblePlanIds, plan.id];
      }
    },

    loadItemsLayer(shouldFitBounds = false) {
      // Prefer Tabulator visible data when available (set by TheTable.vue)
      this.itemsLayer = loadItemsLayer(
        this.map,
        this.itemsLayer, // Passe l'ancien layer pour suppression
        this.itemsForMap,
        {
          fitBounds: shouldFitBounds,
          fitBoundsOnEmpty: true,
        },
      );
    },

    exportMapAsPNG() {
      exportMapAsCompositeSVG(this.map);
    },
  },
};
</script>

<style scoped>
#exportButtons {
  position: fixed;
  bottom: 15px;
  right: 38px;
  z-index: 1000;
}
#mapContainer {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>

<style>
.leaflet-interactive:hover {
  fill-opacity: 1;
  stroke-opacity: 1;
  stroke-width: 4;
}

.leaflet-popup-content-wrapper:hover {
  background-color: #f8f9fab4;
  cursor: pointer;
}
</style>
