<template>
  <div id="mapContainer"></div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { geoSerializedToGeojson } from "@/services/json2geojson";
import { mapState } from "pinia";
import { useDataStore } from "@/stores/data";

export default {
  name: "TheMap",
  data() {
    return {
      map: null,
      layer: null,
    };
  },
  computed: {
    ...mapState(useDataStore, ["checkedTrenchesItems"]),
    fileData() {
      return geoSerializedToGeojson(this.checkedTrenchesItems);
    },
  },
  watch: {
    checkedTrenchesItems: function () {
      this.layer.clearLayers();
      var geojsonMarkerOptions = {
        radius: 10,
        fillColor: "grey",
        color: "grey",
        weight: 2,
        opacity: 0.2,
        fillOpacity: 0.2,
      };
      var layerStyle = {
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
                fillOpacity: 0.1,
                weight: 1,
                opacity: 0.1,
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
    },
  },
  mounted() {
    this.map = L.map("mapContainer", {
      attributionControl: false,
      zoomControl: true,
      //   note that Leaflet supports very few coordinate systems: CRS:3857, CRS:3395 and CRS:4326 see also L.CRS.Simple.
    }).setView([38.387439747787127, 23.909183519017891], 19);

    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
      maxZoom: 25,
      maxNativeZoom: 19,
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // use a mix of renderers
    var customPane = this.map.createPane("customPane");
    customPane.style.zIndex = 399; // put just behind the standard overlay pane which is at 400

    var geojsonMarkerOptions = {
      radius: 8,
      fillColor: "grey",
      color: "grey",
      weight: 2,
      opacity: 0.2,
      fillOpacity: 0.2,
    };
    var layerStyle = {
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
    this.map.fitBounds(this.layer.getBounds()); // Doesn't work because some feature got 0,0 coordinates
  },
  onBeforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
  methods: {
    onEachFeature(feature, layer) {
      // does this feature have a property named id ?
      if (feature.properties && feature.properties.id) {
        layer.bindPopup(
          feature.properties.id + "<br>" + feature.properties.title
        );
      }
    },
  },
};
</script>

<style scoped>
#mapContainer {
  height: 50vh;
}
.leaflet-interactive:hover {
  fill-opacity: 1;
}
</style>
