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
import { apiFetchImageSRC, apiFetchPlanWld } from "@/services/ApiClient";
import { convertToEPSG4326 } from "@/services/coordinateUtils";

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
    ...mapState(useDataStore, [
      "checkedTrenchesItemsPlans",
      "checkedTrenchesItems",
      "checkedTrenchesItemsPlans",
    ]),
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
    async initMap() {
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
      }).addTo(this.map);

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
        map: osmLayer,
        ortho: wmsLayer,
      };

      const overlayMaps = await this.createMapsOverlays();

      // Ajouter le contrôle de couches à la carte
      L.control.layers(baseLayers, overlayMaps).addTo(this.map);

      this.refreshMap();
    },
    async createMapsOverlays() {
      const promises = this.checkedTrenchesItemsPlans.map((obj) => {
        if (obj.RelationAttachments) {
          return this.createMapsOverlay(obj.RelationAttachments, obj.Trench);
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

    async createMapsOverlay(RelationAttachments, Trench) {
      const planURL = await apiFetchImageSRC(RelationAttachments, Trench).then(
        async (response) => {
          let blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });
          const imageTitle = RelationAttachments.split("\n")[0]
            .split("=")[1]
            .split(".")[0];
          // Créer l'URL objet pour l'image
          const imageURL = URL.createObjectURL(blob);

          // Créer une nouvelle instance de l'objet Image
          const img = new Image();

          // Charger l'image
          img.src = imageURL;

          // Attendre que l'image soit chargée
          await new Promise((resolve) => {
            img.onload = resolve;
          });

          return {
            [imageTitle]: {
              imageURL: imageURL,
              width: img.width,
              height: img.height,
            },
          };
        }
      );

      const planlatLngBounds = await apiFetchPlanWld(
        RelationAttachments,
        Trench
      )
        .then((textContent) => {
          const wldCoefficients = textContent.split("\n");
          // Dimensions de l'image raster
          const width = planURL[Object.keys(planURL)[0]].width;
          const height = planURL[Object.keys(planURL)[0]].height;

          function wldToExtent(wldCoefficients, width, height) {
            const [scaleX, rotationY, rotationX, scaleY, West, North] =
              wldCoefficients.map((value) => parseFloat(value));

            // Calcul des SWNE
            const South = North + scaleY * height;
            const East = West + scaleX * width;

            return {
              SW: [West, South],
              NE: [East, North],
            };
          }
          // Appel de la fonction
          return wldToExtent(wldCoefficients, width, height);
        })
        .catch((error) => {
          console.error(error);
        });

      const latLngBounds = L.latLngBounds([
        [convertToEPSG4326(planlatLngBounds.SW, "Amarynthos").coords.reverse()],
        [convertToEPSG4326(planlatLngBounds.NE, "Amarynthos").coords.reverse()], // SWNE
      ]);

      const imageOverlay = L.imageOverlay(
        planURL[Object.keys(planURL)[0]].imageURL,
        latLngBounds,
        {
          opacity: 0.8,
          interactive: true,
        }
      );

      return {
        [Object.keys(planURL)[0]]: imageOverlay,
      };
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
      this.layer = L.geoJSON(
        geoSerializedToGeojson(this.checkedTrenchesItems),
        {
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
        }
      );
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
