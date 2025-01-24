import { convertToEPSG4326 } from "@/services/coordinateUtils";
import L from "leaflet";
import {
  openDB,
  addPlanToDB,
  getImageFromDB,
} from "@/services/indexedDbManager";
import { apiFetchImageSRC, apiFetchPlanWld } from "@/services/ApiClient";

// BASE LAYERS or TILES LAYERS
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

export const baseLayersTree = {
  label: "Base Layers",
  children: [
    { label: "OSM", layer: osmLayer },
    { label: "Light", layer: Minimaliste },
    { label: "Dark", layer: Sombre },
    { label: "Satellite", layer: Satellite },
  ],
};

// OVERLAYS TREE ------------------------------

async function createMapsOverlayTree(
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

  // Vérification et récupération des détails depuis IndexedDB
  imageName = RelationAttachments.split("\n")[0].split("=")[1].split(".")[0];
  const db = await openDB();
  const result = await getImageFromDB(db, imageName);

  if (result) {
    imageUrl = URL.createObjectURL(result.imageBlob);
    planlatLngBounds = result.planlatLngBounds;
  } else {
    const fetchImage = async () => {
      const response = await apiFetchImageSRC(RelationAttachments, Trench);
      imageBlob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      imageUrl = URL.createObjectURL(imageBlob);

      // Charger les dimensions de l'image
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve) => (img.onload = resolve));
      imageWidth = img.width;
      imageHeight = img.height;
    };

    const fetchBounds = async () => {
      if (RelationAttachments.includes("\n\n")) {
        const textContent = await apiFetchPlanWld(RelationAttachments, Trench);
        const wldCoefficients = textContent.split("\n").map(parseFloat);

        const [scaleX, rotationY, rotationX, scaleY, West, North] =
          wldCoefficients;
        const East = scaleX * imageWidth + rotationX * imageHeight + West;
        const South = rotationY * imageWidth + scaleY * imageHeight + North;

        return { SW: [West, South], NE: [East, North] };
      } else if (RelationAttachments.includes(").")) {
        const NESW = RelationAttachments.split("\n")[0]
          .split("=")[1]
          .match(/\(([^)]+)\)/)[1]
          .split(",")
          .map(parseFloat);
        return { SW: [NESW[2], NESW[3]], NE: [NESW[0], NESW[1]] };
      }
    };

    await fetchImage();
    planlatLngBounds = await fetchBounds();

    // Stocker les détails dans IndexedDB
    addPlanToDB(db, imageName, imageBlob, planlatLngBounds);
  }

  // Conversion des coordonnées pour Leaflet
  const leafletLatLngBounds = L.latLngBounds([
    convertToEPSG4326(
      planlatLngBounds.SW,
      projectPreferencesCRS
    ).coords.reverse(),
    convertToEPSG4326(
      planlatLngBounds.NE,
      projectPreferencesCRS
    ).coords.reverse(),
  ]);

  // Création de l'overlay
  const imageOverlay = L.imageOverlay(imageUrl, leafletLatLngBounds, {
    opacity: 0.8,
  });

  return { label: imageTitle, layer: imageOverlay };
}

export async function createMapsOverlaysTree(
  checkedTrenchesItemsPlans,
  projectPreferencesCRS
) {
  const groupedOverlays = {};

  for (const obj of checkedTrenchesItemsPlans) {
    if (
      obj.RelationAttachments?.includes("\n\n") ||
      obj.RelationAttachments?.includes(").")
    ) {
      const overlay = await createMapsOverlayTree(
        obj.RelationAttachments,
        obj.Trench,
        projectPreferencesCRS,
        obj.Title
      );

      // Extraire le préfixe des 5 premières lettres de `Title`
      const prefix = obj.Title.substring(0, 5);

      // Créer un groupe pour chaque préfixe si nécessaire
      if (!groupedOverlays[prefix]) {
        groupedOverlays[prefix] = {
          label: prefix,
          selectAllCheckbox: true,
          collapsed: true,
          children: [],
        };
      }

      // Ajouter l'overlay à l'entrée correspondante
      groupedOverlays[prefix].children.push(overlay);
    }
  }

  // Trier les groupedOverlays par ordre alphabétique des labels
  const sortedGroupedOverlays = Object.values(groupedOverlays).sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  const result = {
    label: "Plans Orthophotos",
    selectAllCheckbox: "Un/select all",
    children: sortedGroupedOverlays,
  };

  return result;
}
