import { convertToEPSG4326 } from "@/services/coordinateUtils";
import L from "leaflet";
import {
  openDB,
  addPlanToDB,
  getImageFromDB,
} from "@/services/indexedDbManager";
import { apiFetchImageSRC, apiFetchPlanWld } from "@/services/ApiClient";

// OVERLAYS LAYERS
export async function createMapsOverlay(
  RelationAttachments,
  Trench,
  projectPreferencesCRS,
  imageTitle
) {
  let imageName;
  let imageUrl;

  let imageBlob;
  let imageWidth;
  let imageHeight;
  let planlatLngBounds;
  let leafletLatLngBounds;

  //look if plan is present in indexedDB and fetch details
  imageName = RelationAttachments.split("\n")[0].split("=")[1].split(".")[0];
  const db = await openDB();
  const result = await getImageFromDB(db, imageName);

  if (result) {
    imageUrl = URL.createObjectURL(result.imageBlob);
    planlatLngBounds = result.planlatLngBounds;
  } else if (RelationAttachments.includes("\n\n")) {
    await apiFetchImageSRC(RelationAttachments, Trench).then(
      async (response) => {
        imageBlob = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        // Créer l'URL objet pour l'image
        imageUrl = URL.createObjectURL(imageBlob);
        // Créer une nouvelle instance de l'objet Image
        const img = new Image();
        // Charger l'image
        img.src = imageUrl;
        // Attendre que l'image soit chargée
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        imageWidth = img.width;
        imageHeight = img.height;
      }
    );

    planlatLngBounds = await apiFetchPlanWld(RelationAttachments, Trench).then(
      async (textContent) => {
        const wldCoefficients = textContent.split("\n");
        async function wldToExtent(wldCoefficients, width, height) {
          const [scaleX, rotationY, rotationX, scaleY, West, North] =
            wldCoefficients.map((value) => parseFloat(value));

          const East = scaleX * width + rotationX * height + West;
          const South = rotationY * width + scaleY * height + North;

          return {
            SW: [West, South],
            NE: [East, North],
          };
        }

        return wldToExtent(wldCoefficients, imageWidth, imageHeight);
      }
    );

    // stocker le plan dans IndexedDB
    const db = await openDB();
    addPlanToDB(db, imageName, imageBlob, planlatLngBounds);
  } else if (RelationAttachments.includes(").")) {
    let fetchPlan = await apiFetchImageSRC(RelationAttachments, Trench);

    imageBlob = new Blob([fetchPlan.data]);
    imageUrl = URL.createObjectURL(imageBlob);

    let NESW = RelationAttachments.split("\n")[0]
      .split("=")[1]
      .match(/\(([^)]+)\)/)[1];
    NESW = NESW.split(",").map((value) => parseFloat(value));
    planlatLngBounds = {
      SW: [NESW[2], NESW[3]],
      NE: [NESW[0], NESW[1]],
    };

    // stocker le plan dans IndexedDB
    const db = await openDB();
    addPlanToDB(db, imageName, imageBlob, planlatLngBounds);
  }

  // Leaflet à besoin de coordonnées formatées SWNE et en EPSG4326 (WGS84)
  leafletLatLngBounds = L.latLngBounds([
    [
      convertToEPSG4326(
        planlatLngBounds.SW,
        projectPreferencesCRS
      ).coords.reverse(),
    ],
    [
      convertToEPSG4326(
        planlatLngBounds.NE,
        projectPreferencesCRS
      ).coords.reverse(),
    ],
  ]);

  const imageOverlay = L.imageOverlay(imageUrl, leafletLatLngBounds, {
    opacity: 0.8,
  });

  //RETURN
  return {
    [imageTitle]: imageOverlay,
  };
}
export async function createMapsOverlays(
  checkedTrenchesItemsPlans,
  projectPreferencesCRS
) {
  const promises = checkedTrenchesItemsPlans
    .filter(
      (obj) =>
        obj.RelationAttachments?.includes("\n\n") ||
        obj.RelationAttachments?.includes(").")
    )
    .map((obj) =>
      createMapsOverlay(
        obj.RelationAttachments,
        obj.Trench,
        projectPreferencesCRS,
        obj.Title
      )
    );

  const overlays = await Promise.all(promises);
  // Combine overlays in one object
  const result = overlays.reduce((acc, overlay) => {
    return { ...acc, ...overlay };
  }, {});

  return result;
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
