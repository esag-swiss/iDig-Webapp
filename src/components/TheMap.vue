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
  <Teleport
    v-if="noCoordinatesControlElement"
    :to="noCoordinatesControlElement"
  >
    <TheMapNoCoordinatesToggle />
  </Teleport>
</template>

<script>
import { markRaw } from "vue";
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
import {
  fitMapOnNoCoordinatesItemsOnly,
  loadItemsLayer,
  loadNoCoordinatesItemsLayer,
  updateNoCoordinatesMarkersRadius,
} from "@/services/mapItemsLayers.js";
import { exportMapAsCompositeSVG } from "@/services/mapExport.js";
import TheMapNoCoordinatesToggle from "@/components/TheMapNoCoordinatesToggle.vue";

export default {
  name: "TheMap",
  components: { TheMapNoCoordinatesToggle },
  data() {
    return {
      map: null,
      itemsLayer: null,
      noCoordinatesItemsLayer: null,
      noCoordinatesFittedBounds: null,
      noCoordinatesControl: null,
      noCoordinatesControlElement: null,
      baseLayersTree: null,
      overlaysTree: null,
      treeLayerControl: null,
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
      "showItemsWithoutCoordinates",
    ]),
    ...mapState(useDataStore, [
      "checkedTrenchesItemsPlans",
      "checkedTrenchesItemsRelationFiltered",
      "projectPreferencesCRS",
      "tableFilteredCheckedTrenchesItems",
      "itemByUuid",
    ]),
    itemsForMap() {
      return (
        this.tableFilteredCheckedTrenchesItems ??
        this.checkedTrenchesItemsRelationFiltered
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
        this.loadNoCoordinatesItemsLayer();
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
        this.loadNoCoordinatesItemsLayer();
      }
    },
    showItemsWithoutCoordinates: function () {
      if (this.map && !this.isProcessingTrenchItemsPlans) {
        this.loadNoCoordinatesItemsLayer();
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

      if (this.noCoordinatesItemsLayer) {
        this.noCoordinatesItemsLayer.remove();
        this.noCoordinatesItemsLayer = null;
      }
      this.noCoordinatesFittedBounds = null;

      if (this.noCoordinatesControl) {
        this.noCoordinatesControlElement = null;
        this.noCoordinatesControl.remove();
        this.noCoordinatesControl = null;
      }

      if (this.treeLayerControl) {
        this.treeLayerControl.remove();
        this.treeLayerControl = null;
      }

      this.map.off();
      this.map.remove();
      this.map = null;
    },

    async initMap() {
      // Leaflet objects stay out of Vue reactivity: through a proxy, map.off() misses
      // its listeners and zooming crashes on a closed tooltip
      this.baseLayersTree = markRaw(baseLayersTree);
      this.overlaysTree = markRaw(
        await createMapsOverlaysTree(
          this.checkedTrenchesItemsPlans,
          this.projectPreferencesCRS,
        ),
      );

      this.map = markRaw(
        L.map("mapContainer", {
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
          layers:
            this.selectedBaseLayer ?? this.baseLayersTree.children[3].layer,
        }),
      );

      this.treeLayerControl = markRaw(
        L.control.layers.tree(baseLayersTree, this.overlaysTree),
      );
      this.addNoCoordinatesControl();
      this.treeLayerControl.addTo(this.map);

      this.map.on("baselayerchange", (event) => {
        this.selectedBaseLayer = markRaw(event.layer);
      });

      this.map.on("zoomend", () => {
        if (this.noCoordinatesItemsLayer) {
          updateNoCoordinatesMarkersRadius({
            map: this.map,
            layer: this.noCoordinatesItemsLayer,
          });
        }
      });

      L.control
        .scale({ position: "bottomleft", imperial: false })
        .addTo(this.map);

      this.loadItemsLayer(true);
      this.loadNoCoordinatesItemsLayer();
    },

    addNoCoordinatesControl() {
      const control = L.control({ position: "topright" });
      control.onAdd = () => {
        const element = L.DomUtil.create("div");
        L.DomEvent.disableClickPropagation(element);
        L.DomEvent.disableScrollPropagation(element);
        this.noCoordinatesControlElement = element;
        return element;
      };
      control.addTo(this.map);
      this.noCoordinatesControl = markRaw(control);
    },

    loadItemsLayer(shouldFitBounds = false) {
      this.itemsLayer = markRaw(
        loadItemsLayer({
          map: this.map,
          currentItemsLayer: this.itemsLayer,
          items: this.itemsForMap,
          fitBounds: shouldFitBounds,
        }),
      );
    },

    loadNoCoordinatesItemsLayer() {
      if (!this.showItemsWithoutCoordinates && !this.noCoordinatesItemsLayer) {
        return;
      }

      if (!this.showItemsWithoutCoordinates) {
        this.noCoordinatesItemsLayer.remove();
        this.noCoordinatesItemsLayer = null;
        this.noCoordinatesFittedBounds = null;
        return;
      }

      this.noCoordinatesItemsLayer = markRaw(
        loadNoCoordinatesItemsLayer({
          map: this.map,
          currentLayer: this.noCoordinatesItemsLayer,
          items: this.itemsForMap,
          itemByUuid: this.itemByUuid,
        }),
      );
      this.noCoordinatesFittedBounds = fitMapOnNoCoordinatesItemsOnly({
        map: this.map,
        itemsLayer: this.itemsLayer,
        noCoordinatesLayer: this.noCoordinatesItemsLayer,
        lastFittedBounds: this.noCoordinatesFittedBounds,
      });
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
