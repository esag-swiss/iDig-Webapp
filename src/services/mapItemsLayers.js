import L from "leaflet";
import { geoSerializedToGeojson } from "@/services/json2geojson";
import { colorForSurvey } from "@/services/coloring.js";

const DEFAULT_BOUNDS = L.latLngBounds([
  [35, 20], // Greece south west corner
  [42, 30], // Greece north east corner
]);

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
  checkedTrenchesItemsSelectedTypeAndSearched,
  options = {}
) {
  const { fitBounds = true, fitBoundsOnEmpty = true } = options;
  const geojsonData = geoSerializedToGeojson(
    checkedTrenchesItemsSelectedTypeAndSearched || []
  );
  
  let itemsLayer = currentItemsLayer;
  // Vérifier si un layer existant doit être retiré
  if (!itemsLayer) {
    itemsLayer = L.geoJSON(geojsonData, {
      onEachFeature: bindFeatureCallbacks,
      style: getFeatureStyle,
      pointToLayer: getPointToLayer,
    });
    itemsLayer.addTo(map);
  } else {
    itemsLayer.clearLayers();
    itemsLayer.addData(geojsonData);
    if (!map.hasLayer(itemsLayer)) {
      itemsLayer.addTo(map);
    }
  }

  if (fitBounds) {
    const bounds = itemsLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds);
    } else if (fitBoundsOnEmpty) {
      map.fitBounds(DEFAULT_BOUNDS);
    }
  }

  return itemsLayer; // Retourne le nouveau layer pour mise à jour
}
