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
import {
  openDB,
  addImageToDB,
  getImageFromDB,
} from "@/services/indexedDbManager";
import { createMapsOverlay, createIndexedDBMap } from "@/services/idigMap.js";

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
      if (this.itemsLayer && this.map) {
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
      this.map.fitBounds(this.itemsLayer.getBounds());
    },

    async createMapsOverlays() {
      const promises = this.checkedTrenchesItemsPlans.map((obj) => {
        if (obj.RelationAttachments?.includes("\n\n")) {
          return this.createMapsOverlay(obj.RelationAttachments, obj.Trench);
        } else if (obj.RelationAttachments?.includes(").")) {
          return createIndexedDBMap(
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

    async createMapsOverlay(RelationAttachments, Trench) {
      const imageTitle = RelationAttachments.split("\n")[0]
        .split("=")[1]
        .split(".")[0];

      let planURL;
      let planlatLngBounds;
      const db = await openDB();
      const result = await getImageFromDB(db, imageTitle);
      if (result) {
        const imageURL = URL.createObjectURL(result.imageBlob);

        planURL = {
          imageTitle: result.imageTitle,
          imageURL: imageURL,
          width: result.width,
          height: result.height,
        };
        planlatLngBounds = result.planlatLngBounds;
      } else {
        await apiFetchImageSRC(RelationAttachments, Trench).then(
          async (response) => {
            const blob = new Blob([response.data], {
              type: response.headers["content-type"],
            });
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

            planURL = {
              imageTitle: imageTitle,
              imageBlob: blob,
              imageURL: imageURL,
              width: img.width,
              height: img.height,
            };
          }
        );
        planlatLngBounds = await apiFetchPlanWld(
          RelationAttachments,
          Trench
        ).then(async (textContent) => {
          const wldCoefficients = textContent.split("\n");
          const width = planURL.width;
          const height = planURL.height;

          async function wldToExtent(wldCoefficients, width, height) {
            const [scaleX, rotationY, rotationX, scaleY, West, North] =
              wldCoefficients.map((value) => parseFloat(value));
            const South = North + scaleY * height;
            const East = West + scaleX * width;

            return {
              SW: [West, South],
              NE: [East, North],
            };
          }
          return wldToExtent(wldCoefficients, width, height);
        });
        // mettre à jour Update IndexedDB
        const db = await openDB();
        addImageToDB(
          db,
          planURL.imageBlob,
          imageTitle,
          planURL.width,
          planURL.height,
          planlatLngBounds
        );
      }

      const latLngBounds = L.latLngBounds([
        [
          convertToEPSG4326(
            planlatLngBounds.SW,
            this.projectPreferencesCRS
          ).coords.reverse(),
        ],
        [
          convertToEPSG4326(
            planlatLngBounds.NE,
            this.projectPreferencesCRS
          ).coords.reverse(),
        ], // SWNE
      ]);

      const imageOverlay = L.imageOverlay(planURL.imageURL, latLngBounds, {
        opacity: 0.8,
      });

      return {
        [planURL.imageTitle]: imageOverlay,
      };
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
