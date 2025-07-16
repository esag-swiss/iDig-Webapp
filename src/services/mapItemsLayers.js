import L from "leaflet";
import { geoSerializedToGeojson } from "@/services/json2geojson";
import { colorForSurvey } from "@/services/coloring.js";

// style for GeoJSON features
function getFeatureStyle(feature) {
  const col = colorForSurvey(feature.properties.type, "type");
  return {
    color: col,
    fillColor: col,
    fillOpacity: 0.7,
    weight: 2,
    opacity: 0.7,
  };
}

// marker for points
function getPointToLayer(feature, latlng) {
  const col = colorForSurvey(feature.properties.type, "type");
  return L.circleMarker(latlng, {
    radius: 5,
    fillColor: col,
    color: col,
    weight: 2,
    opacity: 0.7,
    fillOpacity: 0.7,
  });
}

// bind tooltip and click
function bindFeatureCallbacks(feature, layer) {
  if (feature.properties?.id) {
    const html = `<strong>${feature.properties.Trench} ${feature.properties.id}</strong><br/>${feature.properties.title}`;
    const url = `#/Item/${feature.properties.Trench}/${feature.properties.IdentifierUUID}`;
    layer.on("click", () => window.open(url, "_blank"));
    layer.bindTooltip(html, { direction: "top", offset: [0, -10] });
  }
}

export function loadItemsLayer(
  map,
  currentItemsLayer,
  checkedTrenchesItemsSelectedTypeAndSearched
) {
  // Vérifier si un layer existant doit être retiré
  if (currentItemsLayer && map.hasLayer(currentItemsLayer)) {
    map.removeLayer(currentItemsLayer);
  }
  const newItemsLayer = L.geoJSON(
    geoSerializedToGeojson(checkedTrenchesItemsSelectedTypeAndSearched),
    {
      onEachFeature: bindFeatureCallbacks,
      style: getFeatureStyle,
      pointToLayer: getPointToLayer,
    }
  );
  const bounds = newItemsLayer.getBounds();
  map.fitBounds(
    bounds.isValid()
      ? bounds
      : L.latLngBounds([
          [35, 20], // Greece south west corner
          [42, 30], // Greece north east corner
        ])
  );
  newItemsLayer.addTo(map);
  return newItemsLayer; // Retourne le nouveau layer pour mise à jour
}
