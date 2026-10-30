import L from "leaflet";
import {
  geoSerializedToGeojson,
  noCoordinatesItemsToGeojson,
} from "@/services/json2geojson";
import { colorForSurvey } from "@/services/coloring.js";
import {
  clamp,
  interpolate,
  progressBetween,
} from "@/services/helpers/numberHelper";
import i18n from "@/i18n.js";

const DEFAULT_BOUNDS = L.latLngBounds([
  [35, 20], // Greece south west corner
  [42, 30], // Greece north east corner
]);

const NO_COORDINATES_MAX_RADIUS = 7;
const NO_COORDINATES_MIN_RADIUS = 4;
const NO_COORDINATES_SHRINK_START_ZOOM = 18;
const NO_COORDINATES_SHRINK_END_ZOOM = 23;
// Items sharing one centroid have an empty extent, which would zoom to the maximum
const NO_COORDINATES_FIT_MAX_ZOOM = 19;

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

function noCoordinatesRadiusForZoom(zoom) {
  const shrinkProgress = progressBetween({
    value: zoom,
    start: NO_COORDINATES_SHRINK_START_ZOOM,
    end: NO_COORDINATES_SHRINK_END_ZOOM,
  });
  return interpolate({
    from: NO_COORDINATES_MAX_RADIUS,
    to: NO_COORDINATES_MIN_RADIUS,
    progress: clamp({ value: shrinkProgress, min: 0, max: 1 }),
  });
}

function updateNoCoordinatesMarkersRadius({ map, layer }) {
  const radius = noCoordinatesRadiusForZoom(map.getZoom());
  layer.eachLayer((marker) => marker.setRadius(radius));
}

function fitMapOnNoCoordinatesItemsOnly({
  map,
  itemsLayer,
  noCoordinatesLayer,
  lastFittedBounds,
}) {
  if (itemsLayer.getBounds().isValid()) {
    return null;
  }

  const bounds = noCoordinatesLayer.getBounds();
  if (!bounds.isValid()) {
    return null;
  }

  const hasExtentChanged = !bounds.equals(lastFittedBounds);
  if (hasExtentChanged) {
    map.fitBounds(bounds, { maxZoom: NO_COORDINATES_FIT_MAX_ZOOM });
  }

  return bounds;
}

function getNoCoordinatesPointToLayer(feature, latlng) {
  const col = colorForSurvey(feature.properties.type, "type");
  return L.circleMarker(latlng, {
    radius: NO_COORDINATES_MAX_RADIUS,
    fillColor: col,
    color: col,
    weight: 2,
    opacity: 0.9,
    fillOpacity: 0.15,
    dashArray: "3,3",
  });
}

// bind tooltip and click
function bindFeatureCallbacks(feature, layer) {
  if (feature.properties?.id) {
    const label = feature.properties.noCoordinates
      ? `<br/><em>${i18n.global.t("app.approximate_position_no_coordinates")}</em>`
      : "";
    const html = `<strong>${feature.properties.Trench} ${feature.properties.id}</strong><br/>${feature.properties.title}${label}`;
    const url = `#/Item/${feature.properties.Trench}/${feature.properties.IdentifierUUID}`;
    layer.on("click", () => window.open(url, "_blank"));
    layer.bindTooltip(html, { direction: "top", offset: [0, -10] });
  }
}

function loadItemsLayer({ map, currentItemsLayer, items, fitBounds }) {
  const geojsonData = geoSerializedToGeojson(items || []);

  let itemsLayer = currentItemsLayer;
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
    } else {
      map.fitBounds(DEFAULT_BOUNDS);
    }
  }

  return itemsLayer;
}

function loadNoCoordinatesItemsLayer({ map, currentLayer, items, itemByUuid }) {
  const geojsonData = noCoordinatesItemsToGeojson(items || [], itemByUuid);

  if (currentLayer) {
    currentLayer.clearLayers();
    currentLayer.addData(geojsonData);
    if (!map.hasLayer(currentLayer)) {
      currentLayer.addTo(map);
    }
    updateNoCoordinatesMarkersRadius({ map, layer: currentLayer });

    return currentLayer;
  }

  const layer = L.geoJSON(geojsonData, {
    onEachFeature: bindFeatureCallbacks,
    pointToLayer: getNoCoordinatesPointToLayer,
  });
  layer.addTo(map);
  updateNoCoordinatesMarkersRadius({ map, layer });

  return layer;
}

export {
  fitMapOnNoCoordinatesItemsOnly,
  loadItemsLayer,
  loadNoCoordinatesItemsLayer,
  noCoordinatesRadiusForZoom,
  updateNoCoordinatesMarkersRadius,
};
