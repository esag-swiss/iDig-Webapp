import L from "leaflet";
import { geoSerializedToGeojson } from "@/services/json2geojson";

export function loadItemsLayer(
  map,
  currentItemsLayer,
  checkedTrenchesItemsSelectedTypeAndSearched
) {
  // Vérifier si un layer existant doit être retiré
  if (currentItemsLayer && map.hasLayer(currentItemsLayer)) {
    map.removeLayer(currentItemsLayer);
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

  // Créer un nouveau layer à partir des données
  const newItemsLayer = L.geoJSON(
    geoSerializedToGeojson(checkedTrenchesItemsSelectedTypeAndSearched),
    {
      onEachFeature: onEachFeature,
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

  // Ajuster les limites de la carte
  const bounds = newItemsLayer.getBounds();
  if (bounds.isValid()) {
    newItemsLayer.addTo(map);
    map.fitBounds(bounds);
  } else {
    map.fitBounds(greeceBounds);
  }

  return newItemsLayer; // Retourne le nouveau layer pour mise à jour
}

function onEachFeature(feature, layer) {
  if (feature.properties && feature.properties.id) {
    const popupContent = `
      <div onclick="window.open('#/Item/${feature.properties.Trench}/${feature.properties.IdentifierUUID}', '_blank')">
        <strong>${feature.properties.Trench} ${feature.properties.id}</strong><br>
        ${feature.properties.title}<br>
      </div>
    `;
    layer.bindPopup(popupContent, {
      closeButton: false,
    });
  }
}

// BASE LAYERS or TILES LAYERS

export function createTileLayers() {
  let osmLayer = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    maxZoom: 25,
    maxNativeZoom: 19,
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  });

  let Minimaliste = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 25,
    }
  );

  let Sombre = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 25,
    }
  );

  let Satellite = L.tileLayer(
    "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    {
      maxZoom: 25,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }
  );

  return {
    Satellite: Satellite,
    OSM: osmLayer,
    Minimaliste: Minimaliste,
    Sombre: Sombre,
  };
}
