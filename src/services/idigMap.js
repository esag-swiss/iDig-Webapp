import { convertToEPSG4326 } from "@/services/coordinateUtils";
import L from "leaflet";
import {
  openDB,
  addPlanToDB,
  getImageFromDB,
} from "@/services/indexedDbManager";
import { apiFetchImageSRC, apiFetchPlanWld } from "@/services/ApiClient";

export async function createMapsOverlay(
  RelationAttachments,
  Trench,
  projectPreferencesCRS
) {
  let imageTitle;
  let imageUrl;

  let imageBlob;
  let imageWidth;
  let imageHeight;
  let planlatLngBounds;
  let leafletLatLngBounds;

  //look if plan is present in indexedDB and fetch details
  imageTitle = RelationAttachments.split("\n")[0].split("=")[1].split(".")[0];
  const db = await openDB();
  const result = await getImageFromDB(db, imageTitle);

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
          const South = North + scaleY * height;
          const East = West + scaleX * width;
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
    addPlanToDB(db, imageTitle, imageBlob, planlatLngBounds);
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
    addPlanToDB(db, imageTitle, imageBlob, planlatLngBounds);
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
