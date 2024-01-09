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

export default {
  name: "TheMap",
  data() {
    return {
      map: null,
      layer: null,
    };
  },
  computed: {
    ...mapState(useAppStore, ["isToggled"]),
    ...mapState(useDataStore, ["checkedTrenchesItems"]),
    fileData() {
      return geoSerializedToGeojson(this.checkedTrenchesItems);
    },
  },
  watch: {
    isToggled: function () {
      this.map.remove();
      this.initMap();
    },
    checkedTrenchesItems: function () {
      this.layer.clearLayers();
      this.refreshMap();
    },
  },
  mounted() {
    this.initMap();
  },

  methods: {
    initMap() {
      this.map = L.map("mapContainer", {
        attributionControl: false,
        zoomControl: !this.isToggled,
      });

      // Ajouter les couches de tuiles de base
      const osmLayer = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
        maxZoom: 25,
        maxNativeZoom: 19,
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      });

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

      // Créer un objet de contrôle de couches
      const baseLayers = {
        OpenStreetMap: osmLayer,
        "WMS Layer": wmsLayer,
      };

      // Ajouter le contrôle de couches à la carte
      L.control.layers(baseLayers).addTo(this.map);

      // Sélectionner la couche OpenStreetMap par défaut
      osmLayer.addTo(this.map);

      this.refreshMap();
    },
    onEachFeature(feature, layer) {
      if (feature.properties && feature.properties.id) {
        layer.bindPopup(
          feature.properties.id + "<br>" + feature.properties.title
        );
      }
    },

    refreshMap() {
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
      this.layer = L.geoJSON(this.fileData, {
        onEachFeature: this.onEachFeature,
        style: function (feature) {
          switch (feature.properties.type) {
            case "Context":
              return {
                color: "#f6ceb7",
                fillOpacity: 0.2,
                weight: 2,
                opacity: 0.2,
              };

            case "Feature":
              return {
                color: "#ecc6d3",
                fillOpacity: 0.2,
                weight: 2,
                opacity: 0.2,
              };
            case "Artifact":
              return {
                color: "#7ebcff",
                fillOpacity: 0.2,
                weight: 2,
                opacity: 0.2,
              };

            default:
              return layerStyle;
          }
        },
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, geojsonMarkerOptions);
        },
      });
      this.layer.addTo(this.map);
      this.map.fitBounds(this.layer.getBounds());
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
