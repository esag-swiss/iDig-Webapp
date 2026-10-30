import { afterEach, beforeEach, describe, it, expect } from "vitest";
import L from "leaflet";
import {
  fitMapOnNoCoordinatesItemsOnly,
  noCoordinatesRadiusForZoom,
} from "@/services/mapItemsLayers";

const INITIAL_VIEW = { lat: 10, lng: 10, zoom: 5 };

function pointLayer(...latlngs) {
  return L.featureGroup(latlngs.map((latlng) => L.circleMarker(latlng)));
}

function createMap() {
  const container = document.createElement("div");
  Object.defineProperty(container, "clientWidth", { value: 800 });
  Object.defineProperty(container, "clientHeight", { value: 600 });
  return L.map(container).setView(
    [INITIAL_VIEW.lat, INITIAL_VIEW.lng],
    INITIAL_VIEW.zoom,
  );
}

function viewOf(map) {
  const { lat, lng } = map.getCenter();
  return { lat, lng, zoom: map.getZoom() };
}

describe("mapItemsLayers", () => {
  describe("noCoordinatesRadiusForZoom", () => {
    it("should keep the full size at low zoom", () => {
      expect(noCoordinatesRadiusForZoom(6)).toBe(7);
    });

    it("should keep the full size at the shrink start zoom", () => {
      expect(noCoordinatesRadiusForZoom(18)).toBe(7);
    });

    it("should shrink progressively between the shrink zooms", () => {
      expect(noCoordinatesRadiusForZoom(20.5)).toBeCloseTo(5.5);
    });

    it("should reach the minimum size at the shrink end zoom", () => {
      expect(noCoordinatesRadiusForZoom(23)).toBe(4);
    });

    it("should stay bounded beyond the shrink end zoom", () => {
      expect(noCoordinatesRadiusForZoom(25)).toBe(4);
    });
  });

  describe("fitMapOnNoCoordinatesItemsOnly", () => {
    const noCoordinatesLayer = pointLayer([38.39, 23.81], [38.4, 23.82]);
    let map;
    let bounds;

    beforeEach(() => {
      map = createMap();
    });

    afterEach(() => {
      map.remove();
    });

    describe("when items without coordinates are alone", () => {
      beforeEach(() => {
        bounds = fitMapOnNoCoordinatesItemsOnly({
          map,
          itemsLayer: pointLayer(),
          noCoordinatesLayer,
          lastFittedBounds: null,
        });
      });

      it("should return their bounds", () => {
        expect(bounds.equals(noCoordinatesLayer.getBounds())).toBe(true);
      });

      it("should show all of them", () => {
        expect(map.getBounds().contains(bounds)).toBe(true);
      });

      it("should zoom in on them", () => {
        expect(map.getZoom()).toBeGreaterThan(INITIAL_VIEW.zoom);
      });
    });

    describe("when items without coordinates share the same position", () => {
      it("should cap the zoom", () => {
        fitMapOnNoCoordinatesItemsOnly({
          map,
          itemsLayer: pointLayer(),
          noCoordinatesLayer: pointLayer([38.39, 23.81], [38.39, 23.81]),
          lastFittedBounds: null,
        });

        expect(map.getZoom()).toBe(19);
      });
    });

    describe("when the extent is unchanged", () => {
      it("should not move the map", () => {
        fitMapOnNoCoordinatesItemsOnly({
          map,
          itemsLayer: pointLayer(),
          noCoordinatesLayer,
          lastFittedBounds: noCoordinatesLayer.getBounds(),
        });

        expect(viewOf(map)).toEqual(INITIAL_VIEW);
      });
    });

    describe("when items with coordinates are listed", () => {
      beforeEach(() => {
        bounds = fitMapOnNoCoordinatesItemsOnly({
          map,
          itemsLayer: pointLayer([38.39, 23.81]),
          noCoordinatesLayer,
          lastFittedBounds: null,
        });
      });

      it("should return null", () => {
        expect(bounds).toBeNull();
      });

      it("should not move the map", () => {
        expect(viewOf(map)).toEqual(INITIAL_VIEW);
      });
    });

    describe("when nothing can be displayed", () => {
      beforeEach(() => {
        bounds = fitMapOnNoCoordinatesItemsOnly({
          map,
          itemsLayer: pointLayer(),
          noCoordinatesLayer: pointLayer(),
          lastFittedBounds: null,
        });
      });

      it("should return null", () => {
        expect(bounds).toBeNull();
      });

      it("should not move the map", () => {
        expect(viewOf(map)).toEqual(INITIAL_VIEW);
      });
    });
  });
});
