<template>
  <div v-show="!isItemSelected" id="mapContainer"></div>
  <div v-show="!isItemSelected" id="exportButtons">
    <q-btn
      v-show="!isItemSelected && !isMapMinimized"
      align="left"
      padding="2px"
      color="secondary"
      icon="download"
      @click="exportMapAsPNG"
      ><q-tooltip class="bg-accent">export map</q-tooltip></q-btn
    >
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { geoSerializedToGeojson } from "@/services/json2geojson";
import { mapState } from "pinia";
import { useDataStore } from "@/stores/data";
import { useAppStore } from "@/stores/app";
import { createMapsOverlay } from "@/services/idigMap.js";
import html2canvas from "html2canvas";

export default {
  name: "TheMap",
  data() {
    return {
      map: null,
      itemsLayer: null,
      mapsLayers: null,
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
          for (const layerName in this.mapsLayers) {
            if (
              Object.prototype.hasOwnProperty.call(this.mapsLayers, layerName)
            ) {
              const layerToRemove = this.mapsLayers[layerName];
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
          this.mapsLayers = await this.createMapsOverlays();
          this.layerControl = L.control
            .layers(this.baseLayers, this.mapsLayers, {
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
      this.map = L.map("mapContainer", {
        attributionControl: false,
        zoomControl: true,
        zoomDelta: 0.25,
        zoomSnap: 0,
        renderer: L.canvas(),
      });

      // Ajouter l'échelle à la carte
      L.control
        .scale({ position: "bottomleft", imperial: false })
        .addTo(this.map);

      const osmLayer = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        maxZoom: 25,
        maxNativeZoom: 19,
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      });

      const Minimaliste = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 25,
        }
      );

      const Sombre = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 25,
        }
      );

      const Satellite = L.tileLayer(
        "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        {
          maxZoom: 25,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
        }
      ).addTo(this.map);
      // WMS layer from Dipylon. To be used in dev only for not overload their server
      const wmsLayer = L.tileLayer.wms(
        "http://116.202.128.162:83/geoserver/wms?SERVICE=WMS?",
        {
          layers: "amarynthos:AMA22_complete_GGRS87",
          attribution: "ESAG",
          transparent: true,
          maxZoom: 25,
        }
      );

      this.baseLayers = {
        Satellite: Satellite,
        OSM: osmLayer,
        Minimaliste: Minimaliste,
        Sombre: Sombre,
      };

      this.mapsLayers = await this.createMapsOverlays();
      this.layerControl = L.control.layers(this.baseLayers, this.mapsLayers, {
        sortLayers: true,
      });
      this.layerControl.addTo(this.map);

      this.loadItemsLayer();
    },

    loadItemsLayer() {
      if (this.itemsLayer) {
        this.map.removeLayer(this.itemsLayer);
      }
      let geojsonMarkerOptions = {
        radius: 5,
        fillColor: "grey",
        color: "grey",
        weight: 2,
        opacity: 0.2,
        fillOpacity: 0.2,
      };
      let layerStyle = {
        fillColor: "grey",
        fillOpacity: 0.2,
        weight: 2,
        opacity: 0.2,
      };
      this.itemsLayer = L.geoJSON(
        geoSerializedToGeojson(
          this.checkedTrenchesItemsSelectedTypeAndSearched
        ),
        {
          onEachFeature: this.onEachFeature,
          style: function (feature) {
            switch (feature.properties.type) {
              case "Context":
                return {
                  color: "#f6ceb7",
                  fillOpacity: 0.5,
                  weight: 2,
                  opacity: 0.5,
                };

              case "Feature":
                return {
                  color: "#fcf80a",
                  fillOpacity: 0.5,
                  weight: 2,
                  opacity: 0.5,
                };
              case "Artifact":
                return {
                  color: "#fc9797",
                  fillOpacity: 0.8,
                  weight: 3,
                  opacity: 0.8,
                };

              default:
                return layerStyle;
            }
          },
          pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions);
          },
        }
      );

      const greeceBounds = L.latLngBounds(
        L.latLng(35, 20), // Greece south west corner
        L.latLng(42, 30) // Greece north east corner
      );
      let bounds = this.itemsLayer.getBounds();
      if (bounds.isValid()) {
        this.itemsLayer.addTo(this.map);
        this.map.fitBounds(bounds);
      } else {
        this.map.fitBounds(greeceBounds);
      }
    },

    async createMapsOverlays() {
      const promises = this.checkedTrenchesItemsPlans
        .filter(
          (obj) =>
            obj.RelationAttachments?.includes("\n\n") ||
            obj.RelationAttachments?.includes(").")
        )
        .map((obj) =>
          createMapsOverlay(
            obj.RelationAttachments,
            obj.Trench,
            this.projectPreferencesCRS,
            obj.Title
          )
        );

      const overlays = await Promise.all(promises);
      // Combine overlays in one object
      const result = overlays.reduce((acc, overlay) => {
        return { ...acc, ...overlay };
      }, {});

      return result;
    },

    onEachFeature(feature, itemsLayer) {
      if (feature.properties && feature.properties.id) {
        itemsLayer.bindPopup(
          feature.properties.source +
            " " +
            feature.properties.id +
            "<br>" +
            feature.properties.title
        );
      }
    },
    async exportMapAsPNG() {
      const mapElement = document.getElementById("mapContainer");
      // Utiliser html2canvas pour capturer l'élément de la carte
      html2canvas(mapElement, {
        ignoreElements: function (element) {
          if (
            element.classList.contains("leaflet-control-zoom") ||
            element.classList.contains("leaflet-control-layers")
          ) {
            return true;
          }
        },
        useCORS: true,
        async: true,
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        // Crée un lien de téléchargement
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "map_export.png";
        link.click();
      });
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
</style>

<style>
#mapWrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
#mapContainer {
  position: relative;
  width: 100%;
  height: 100%;
}

.leaflet-interactive:hover {
  fill-opacity: 1;
  stroke-opacity: 1;
  stroke-width: 4;
}
</style>
