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
import "leaflet.control.layers.tree";
import "leaflet.control.layers.tree/L.Control.Layers.Tree.css";
import { mapState } from "pinia";
import { useDataStore } from "@/stores/data";
import { useAppStore } from "@/stores/app";
import {
  createMapsOverlaysTree,
  baseLayersTree,
} from "@/services/mapOverlays.js";
import { loadItemsLayer } from "@/services/mapItemsLayers.js";
import { exportMapAsCompositeSVG } from "@/services/mapExport.js";
import CustomLayersTree from "@/services/CustomLayersTree.js";

export default {
  name: "TheMap",
  data() {
    return {
      map: null,
      itemsLayer: null,
      overlayLayers: null,
      baseLayersTree: null,
      overlaysTree: null,
      treeLayerControl: null,
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
      }
    },
    // reload items layer when removing trenches
    checkedTrenchesItemsSelectedTypeAndSearched: function () {
      if (this.loadingCount === 0 && this.map) {
        this.loadItemsLayer();
      }
    },
    // reload overlays tree when changing trenches
    checkedTrenchesItemsPlans: async function () {
      if (this.map && !this.isProcessingTrenchItemsPlans) {
        this.isProcessingTrenchItemsPlans = true;
        try {
          // Remove the current map instance
          this.map.remove();
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
  methods: {
    async initMap() {
      this.baseLayersTree = baseLayersTree;
      this.overlaysTree = await createMapsOverlaysTree(
        this.checkedTrenchesItemsPlans,
        this.projectPreferencesCRS
      );

      // Creation de la carte
      this.map = L.map("mapContainer", {
        attributionControl: false,
        zoomControl: true,
        zoomDelta: 0.25,
        zoomSnap: 0,
        layers: this.baseLayersTree.children[3].layer,
      });

      // Ajout du control de couches en arborescence
      this.treeLayerControl = L.control.layers.tree(
        baseLayersTree,
        this.overlaysTree
      );
      this.treeLayerControl.addTo(this.map);

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
