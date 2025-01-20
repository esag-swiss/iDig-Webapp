<template>
  <div v-show="!isItemSelected" id="mapContainer"></div>
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
import {
  createMapsOverlays,
  createTileLayers,
} from "@/services/mapOverlays.js";
import { loadItemsLayer } from "@/services/mapItemsLayers.js";
import { exportMapAsPNG } from "@/services/mapExport.js";

export default {
  name: "TheMap",
  data() {
    return {
      map: null,
      itemsLayer: null,
      overlayLayers: null,
      baseLayers: null,
      layerControl: null,
      firstMapShowed: true,
      isProcessingTrenchItemsPlans: false,
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
    ]),
  },
  watch: {
    // initialize map when first toggled on
    isMapMinimized: async function () {
      if (this.firstMapShowed) {
        this.initMap();
        this.firstMapShowed = false;
      }
    },
    // load items layer only when all selected trenches are loaded
    loadingCount: function (newLoadingCount, oldLoadingCount) {
      if (oldLoadingCount === 1 && newLoadingCount === 0 && this.map) {
        this.loadItemsLayer();
        this.layerControl.remove();
      }
    },
    // when removing trenches load items layer
    checkedTrenchesItemsSelectedTypeAndSearched: function () {
      if (this.loadingCount === 0 && this.map) {
        this.loadItemsLayer();
        if (this.map) {
          // removes mapslayers
          for (const layerName in this.overlayLayers) {
            if (
              Object.prototype.hasOwnProperty.call(
                this.overlayLayers,
                layerName
              )
            ) {
              const layerToRemove = this.overlayLayers[layerName];
              this.map.removeLayer(layerToRemove);
            }
          }
        }
      }
    },

    checkedTrenchesItemsPlans: async function () {
      if (this.map && !this.isProcessingTrenchItemsPlans) {
        this.isProcessingTrenchItemsPlans = true;
        try {
          await this.layerControl.remove();
          this.overlayLayers = await createMapsOverlays(
            this.checkedTrenchesItemsPlans,
            this.projectPreferencesCRS
          );
          this.layerControl = L.control
            .layers(this.baseLayers, this.overlayLayers, {
              sortLayers: true,
            })
            .addTo(this.map);
        } finally {
          this.isProcessingTrenchItemsPlans = false;
        }
      }
    },
  },
  methods: {
    async initMap() {
      // Definition de baseLayers et overlayLayers
      this.baseLayers = createTileLayers();

      this.overlayLayers = await createMapsOverlays(
        this.checkedTrenchesItemsPlans,
        this.projectPreferencesCRS
      );

      this.layerControl = L.control.layers(
        this.baseLayers,
        this.overlayLayers,
        {
          sortLayers: true,
        }
      );

      // Creation de la carte
      this.map = L.map("mapContainer", {
        attributionControl: false,
        zoomControl: true,
        zoomDelta: 0.25,
        zoomSnap: 0,
        layers: this.baseLayers["Satellite"],
      });

      // Ajout du control de couches
      this.layerControl.addTo(this.map);

      // Ajout de l'échelle
      L.control
        .scale({ position: "bottomleft", imperial: false })
        .addTo(this.map);

      // Ajout des items
      this.loadItemsLayer();
    },

    loadItemsLayer() {
      this.itemsLayer = loadItemsLayer(
        this.map,
        this.itemsLayer, // Passe l'ancien layer pour suppression
        this.checkedTrenchesItemsSelectedTypeAndSearched
      );
    },

    exportMapAsPNG() {
      exportMapAsPNG(this.map);
    },
  },
};
</script>

<style scoped>
#exportButtons {
  position: fixed;
  bottom: 10px;
  right: 43px;
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
/* .leaflet-popup-content {
} */

.leaflet-popup-content-wrapper:hover {
  background-color: #f8f9fab4;
  cursor: pointer;
}
</style>
