<template>
  <div v-show="!isItemSelected" id="mapContainer"></div>
  <div v-show="!isItemSelected" class="the-map__top-right-controls">
    <div class="the-map__top-right-row">
      <TheMapNoCoordinatesToggle />
      <TheMapBaseLayerSwitch
        :labels="baseLayerLabels"
        :selected-label="selectedBaseLayerLabel"
        @select="selectBaseLayer"
      />
    </div>
    <TheMapLayerModal
      :plans="overlayPlans"
      :visible-plan-ids="visiblePlanIds"
      @toggle-visible="togglePlanVisible"
    />
  </div>
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
import { markRaw } from "vue";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { mapActions, mapState } from "pinia";
import { useDataStore } from "@/stores/data";
import { useAppStore } from "@/stores/app";
import {
  createMapsOverlaysList,
  baseLayersTree,
  defaultBaseLayer,
} from "@/services/mapOverlays.js";
import {
  fitMapOnNoCoordinatesItemsOnly,
  loadItemsLayer,
  loadNoCoordinatesItemsLayer,
  updateNoCoordinatesMarkersRadius,
} from "@/services/mapItemsLayers.js";
import { exportMapAsCompositeSVG } from "@/services/mapExport.js";
import TheMapBaseLayerSwitch from "@/components/TheMapBaseLayerSwitch.vue";
import TheMapLayerModal from "@/components/TheMapLayerModal.vue";
import TheMapNoCoordinatesToggle from "@/components/TheMapNoCoordinatesToggle.vue";

export default {
  name: "TheMap",
  components: {
    TheMapBaseLayerSwitch,
    TheMapLayerModal,
    TheMapNoCoordinatesToggle,
  },
  data() {
    return {
      map: null,
      itemsLayer: null,
      noCoordinatesItemsLayer: null,
      noCoordinatesFittedBounds: null,
      overlayPlans: [],
      isProcessingTrenchItemsPlans: false,
      latestMapInitId: 0,
      enableScrollWheelZoom: true,
      wheelDebounceTime: 140,
      wheelPxPerZoomLevel: 180,
      baseLayerLabels: baseLayersTree.children.map(({ label }) => label),
      selectedBaseLayerLabel: baseLayersTree.children.find(
        ({ layer }) => layer === defaultBaseLayer,
      ).label,
    };
  },
  computed: {
    ...mapState(useAppStore, [
      "isMapMinimized",
      "loadingCount",
      "isItemSelected",
      "showItemsWithoutCoordinates",
      "visiblePlanIds",
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
    selectedBaseLayer() {
      return baseLayersTree.children.find(
        ({ label }) => label === this.selectedBaseLayerLabel,
      ).layer;
    },
  },
  watch: {
    isMapMinimized: function () {
      this.rebuildMap();
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
    checkedTrenchesItemsPlans: function () {
      if (this.map || this.isProcessingTrenchItemsPlans) {
        this.rebuildMap();
      }
    },
  },
  beforeUnmount() {
    this.destroyMap();
  },
  methods: {
    ...mapActions(useAppStore, ["setVisiblePlanIds"]),

    async rebuildMap() {
      this.isProcessingTrenchItemsPlans = true;
      try {
        this.destroyMap();
        await this.$nextTick();
        await this.initMap();
      } catch (error) {
        console.error(error);
      } finally {
        this.isProcessingTrenchItemsPlans = false;
      }
    },

    destroyMap() {
      this.latestMapInitId += 1;
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

      this.overlayPlans = [];

      this.map.off();
      this.map.remove();
      this.map = null;
    },

    async initMap() {
      const mapInitId = ++this.latestMapInitId;
      const overlayPlans = await createMapsOverlaysList(
        this.checkedTrenchesItemsPlans,
        this.projectPreferencesCRS,
      );
      // A newer init or a destroy happened while the plans were loading: building this map
      // too would leave its rasters on screen, out of reach of the plans panel
      if (mapInitId !== this.latestMapInitId) {
        return;
      }
      // Leaflet objects stay out of Vue reactivity: through a proxy, map.off() misses
      // its listeners and zooming crashes on a closed tooltip
      this.overlayPlans = overlayPlans.map((plan) => ({
        ...plan,
        layer: markRaw(plan.layer),
      }));

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
          layers: this.selectedBaseLayer,
        }),
      );

      this.map.on("zoomend", () => {
        if (this.noCoordinatesItemsLayer) {
          updateNoCoordinatesMarkersRadius({
            map: this.map,
            layer: this.noCoordinatesItemsLayer,
          });
        }
      });

      this.overlayPlans
        .filter((plan) => this.isPlanVisible(plan))
        .forEach((plan) => plan.layer.addTo(this.map));

      L.control
        .scale({ position: "bottomleft", imperial: false })
        .addTo(this.map);

      this.loadItemsLayer(true);
      this.loadNoCoordinatesItemsLayer();
    },

    selectBaseLayer(label) {
      if (this.map) {
        this.selectedBaseLayer.remove();
      }
      this.selectedBaseLayerLabel = label;
      if (this.map) {
        this.selectedBaseLayer.addTo(this.map);
      }
    },

    isPlanVisible(plan) {
      return this.visiblePlanIds.includes(plan.id);
    },

    togglePlanVisible(plan) {
      if (this.isPlanVisible(plan)) {
        plan.layer.remove();
        this.setVisiblePlanIds(
          this.visiblePlanIds.filter((id) => id !== plan.id),
        );
      } else {
        plan.layer.addTo(this.map);
        this.setVisiblePlanIds([...this.visiblePlanIds, plan.id]);
      }
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
.the-map__top-right-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}
.the-map__top-right-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
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
