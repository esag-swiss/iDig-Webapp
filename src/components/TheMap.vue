<template>
  <div id="mapContainer"></div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { geoSerializedToGeojson } from "@/services/json2geojson";
import { mapState } from "pinia";
import { useDataStore } from "@/stores/data";
import { useAppStore } from "@/stores/app";
import { createMapsOverlay } from "@/services/idigMap.js";

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
    };
  },
  computed: {
    ...mapState(useAppStore, ["isMapMinimized", "loadingCount"]),
    ...mapState(useDataStore, [
      "checkedTrenchesItemsPlans",
      "checkedTrenchesItems",
      "checkedTrenchesItemsSelectedTypeAndSearched",
      "checkedTrenchesItemsPlans",
      "projectPreferencesCRS",
    ]),
  },
  watch: {
    isMapMinimized: async function () {
      if (this.isMapMinimized) {
        this.layerControl.remove();
        this.map.removeControl(this.map.zoomControl);
      } else if (this.firstMapShowed) {
        this.initMap();
        this.firstMapShowed = false;
      } else {
        this.mapsLayers = await this.createMapsOverlays();
        this.layerControl = L.control.layers(this.baseLayers, this.mapsLayers);
        this.layerControl.addTo(this.map);
        this.map.addControl(this.map.zoomControl);
      }
    },
    checkedTrenchesItemsSelectedTypeAndSearched: function () {
      if (this.loadingCount === 0 && this.map) {
        this.loadItemsLayer();
      }
    },
    loadingCount: function (newLoadingCount, oldLoadingCount) {
      if (oldLoadingCount === 1 && newLoadingCount === 0 && this.map) {
        this.loadItemsLayer();
      }
    },
  },
  methods: {
    async initMap() {
      this.map = L.map("mapContainer", {
        attributionControl: false,
        zoomControl: true,
      });
      const osmLayer = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        maxZoom: 25,
        maxNativeZoom: 19,
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      });

      var Minimaliste = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 25,
        }
      );

      var Sombre = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 25,
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
        OSM: osmLayer,
        Minimaliste: Minimaliste,
        Sombre: Sombre,
        Ortho: wmsLayer,
      };

      this.mapsLayers = await this.createMapsOverlays();
      this.layerControl = L.control.layers(this.baseLayers, this.mapsLayers);
      this.layerControl.addTo(this.map);

      this.loadItemsLayer();
    },

    loadItemsLayer() {
      if (this.itemsLayer) {
        this.map.removeLayer(this.itemsLayer);
      }
      let geojsonMarkerOptions = {
        radius: 8,
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
      this.itemsLayer.addTo(this.map);
      const greeceBounds = L.latLngBounds(
        L.latLng(35, 20), // Coin sud-ouest de la Grèce
        L.latLng(42, 30) // Coin nord-est de la Grèce
      );
      let bounds = this.itemsLayer.getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds);
      } else {
        this.map.fitBounds(greeceBounds);
      }

      this.map.fitBounds(this.itemsLayer.getBounds());
    },

    async createMapsOverlays() {
      const promises = this.checkedTrenchesItemsPlans.map((obj) => {
        if (
          obj.RelationAttachments?.includes("\n\n") ||
          obj.RelationAttachments?.includes(").")
        ) {
          return createMapsOverlay(
            obj.RelationAttachments,
            obj.Trench,
            this.projectPreferencesCRS
          );
        }
      });
      // Attendre que toutes les promesses soient résolues
      const overlays = await Promise.all(promises);
      // Combine toutes les overlays dans un seul objet
      const result = overlays.reduce((acc, overlay) => {
        return { ...acc, ...overlay };
      }, {});

      return result;
    },

    onEachFeature(feature, itemsLayer) {
      if (feature.properties && feature.properties.id) {
        itemsLayer.bindPopup(
          feature.properties.id + "<br>" + feature.properties.title
        );
      }
    },
  },
};
</script>

<style>
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
