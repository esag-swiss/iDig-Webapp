import { convertToEPSG4326 } from "@/services/coordinateUtils";
import L from "leaflet";
import { fromBlob as geotiffFromBlob } from "geotiff";
import {
  openDB,
  addPlanToDB,
  getImageFromDB,
} from "@/services/indexedDbManager";
import { apiFetchImage, apiFetchWld } from "@/services/ApiClient";

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
  },
);

let Sombre = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 25,
  },
);

let Satellite = L.tileLayer(
  "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    maxZoom: 25,
    maxNativeZoom: 19,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  },
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

export async function createMapsOverlaysTree(
  checkedTrenchesItemsPlans,
  projectPreferencesCRS,
) {
  const groupedOverlays = {};
  const seenTitles = new Set();

  for (const obj of checkedTrenchesItemsPlans) {
    if (!obj?.Title) {
      continue;
    }
    if (seenTitles.has(obj.Title)) {
      continue;
    }
    seenTitles.add(obj.Title);

    // il y a deux façon dont les plans sont attachés : soit avec un RelationAttachments contruit avec le champ FormatImage (aka file name) qui contient les coordonnées entre parenthèses (ΒΓ West (408,300,421,315).png) et le checksum (un timestamp) soit avec un RelationAttachments construit de la sorte : n=AMA15-Stoa nord sond.png\nd=2015-07-27T11:00:18Z\n\nn=AMA15-Stoa nord sond.wld\nd=2017-02-14T08:16:50Z c'est à dire avec un champ FormatImage qui contient le nom du fichier et un champ FormatWld qui contient le nom du fichier wld et son checksum. On vérifie la présence de "\n\n" ou de ")." pour différencier les deux formats.
    if (
      obj.RelationAttachments?.includes(".wld") ||
      obj.RelationAttachments?.includes(".tfw") ||
      obj.RelationAttachments?.includes(").")
    ) {
      const overlay = await createOverlay(
        obj.RelationAttachments,
        obj.Trench,
        projectPreferencesCRS,
        obj.Title,
      );

      if (!overlay) {
        continue;
      }

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
    a.label.localeCompare(b.label),
  );

  const result = {
    label: "Plans Orthophotos",
    selectAllCheckbox: "Un/select all",
    children: sortedGroupedOverlays,
  };

  return result;
}

async function createOverlay(
  RelationAttachments,
  Trench,
  projectPreferencesCRS,
  imageTitle,
) {
  let imageName;
  let imageUrl;
  let imageBlob;
  let imageWidth;
  let imageHeight;
  let planlatLngBounds;

  const parsedRelationAttachments =
    parseRelationAttachments(RelationAttachments);

  // récupération des détails depuis IndexedDB si existent sinon fetch depuis API et stockage dans IndexedDB pour la prochaine fois
  imageName = parsedRelationAttachments.imageEntry.name.split(".")[0];
  const db = await openDB();
  const result = await getImageFromDB(db, imageName);

  if (result) {
    imageUrl = URL.createObjectURL(result.imageBlob);
    planlatLngBounds = result.planlatLngBounds;
  } else {
    const fetchImage = async () => {
      const response = await apiFetchImage(
        parsedRelationAttachments.imageEntry.name,
        parsedRelationAttachments.imageEntry.checksum,
        Trench,
      );
      if (!response?.data) {
        throw new Error("Image non récupérée depuis l'API");
      }

      const rawBlob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });

      const isTiff =
        /tiff/i.test(rawBlob.type) ||
        /\.tiff?$/i.test(parsedRelationAttachments.imageEntry?.name || "");

      if (isTiff) {
        const { pngBlob, width, height } =
          await convertGeoTiffBlobToPngBlob(rawBlob);
        imageBlob = pngBlob; // on stocke le PNG décodé pour Leaflet/IndexedDB
        imageWidth = width;
        imageHeight = height;
      } else {
        imageBlob = rawBlob;
      }

      imageUrl = URL.createObjectURL(imageBlob);

      // si non tiff, on récupère dimensions via <img>
      if (!isTiff) {
        const img = new Image();
        img.src = imageUrl;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () =>
            reject(
              new Error(
                `Format image non supporté par le navigateur pour imageOverlay: ${
                  imageBlob.type || "unknown"
                }`,
              ),
            );
        });

        imageWidth = img.width;
        imageHeight = img.height;
      }
    };

    const fetchBounds = async () => {
      // Priorité au fichier WLD s'il est présent
      if (parsedRelationAttachments.hasWld) {
        const textContent = await apiFetchWld(
          parsedRelationAttachments.wldEntry.name,
          parsedRelationAttachments.wldEntry.checksum,
          Trench,
        );
        // convertit le contenu du WLD en coordonnées géographiques
        const wldCoefficients = textContent
          .split(/\r?\n/)
          .map((value) => Number.parseFloat(value))
          .filter(Number.isFinite);

        if (wldCoefficients.length < 6) {
          return null;
        }

        const [scaleX, rotationY, rotationX, scaleY, West, North] =
          wldCoefficients;
        const East = scaleX * imageWidth + rotationX * imageHeight + West;
        const South = rotationY * imageWidth + scaleY * imageHeight + North;

        return { SW: [West, South], NE: [East, North] };
      }

      if (parsedRelationAttachments.boundsNESW) {
        const NESW = parsedRelationAttachments.boundsNESW;
        return { SW: [NESW[2], NESW[3]], NE: [NESW[0], NESW[1]] };
      }
      return null;
    };

    try {
      await fetchImage();
      planlatLngBounds = await fetchBounds();
    } catch (error) {
      console.log(
        `[Overlay] skipped: échec fetch/decode (Trench: ${Trench}, Title: ${imageTitle})`,
        error,
      );
      return null;
    }

    // Stocker les détails dans IndexedDB
    await addPlanToDB(db, imageName, imageBlob, planlatLngBounds);
  }

  // Conversion des coordonnées pour Leaflet
  const leafletLatLngBounds = buildLeafletBounds(
    planlatLngBounds,
    projectPreferencesCRS,
  );

  if (!leafletLatLngBounds || !leafletLatLngBounds.isValid()) {
    console.log(
      `[Overlay] skipped: conversion CRS invalide (Trench: ${Trench}, Title: ${imageTitle})`,
    );
    return null;
  }

  // Création de l'overlay
  const imageOverlay = L.imageOverlay(imageUrl, leafletLatLngBounds, {
    opacity: 0.8,
  });

  return { label: imageTitle, layer: imageOverlay };
}

function parseRelationAttachments(RelationAttachments) {
  // passe les blocs en array propre
  const lines = RelationAttachments.split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const entries = [];
  let pendingName = null;

  for (const line of lines) {
    if (line.startsWith("n=")) {
      pendingName = line.slice(2).trim();
      continue;
    }

    if (line.startsWith("d=") && pendingName) {
      entries.push({
        name: pendingName,
        checksum: line.slice(2).trim(),
      });
      pendingName = null;
    }
  }

  const imageEntry = entries.find(
    (entry) =>
      entry.name.toLowerCase().endsWith(".png") ||
      entry.name.toLowerCase().endsWith(".tif") ||
      entry.name.toLowerCase().endsWith(".tiff") ||
      entry.name.toLowerCase().endsWith(".jpg") ||
      entry.name.toLowerCase().endsWith(".jpeg"),
  );

  const boundsMatch = RelationAttachments.match(/\(([^)]+)\)/)?.[1] ?? null;
  const parsedBounds = boundsMatch
    ? boundsMatch
        .split(",")
        .map((value) => Number.parseFloat(value.trim()))
        .filter(Number.isFinite)
    : null;

  const boundsNESW = parsedBounds?.length === 4 ? parsedBounds : null;

  const wldEntry = entries.find(
    (entry) =>
      entry.name.toLowerCase().endsWith(".wld") ||
      entry.name.toLowerCase().endsWith(".tfw"),
  );
  const hasWld = Boolean(wldEntry);

  return {
    imageEntry,
    wldEntry,
    boundsNESW,
    hasWld,
  };
}

function buildLeafletBounds(planlatLngBounds, projectPreferencesCRS) {
  const swConverted = convertToEPSG4326(
    planlatLngBounds.SW,
    projectPreferencesCRS,
  )?.coords;
  const neConverted = convertToEPSG4326(
    planlatLngBounds.NE,
    projectPreferencesCRS,
  )?.coords;

  if (!Array.isArray(swConverted) || !Array.isArray(neConverted)) {
    return null;
  }

  if (![...swConverted, ...neConverted].every(Number.isFinite)) {
    return null;
  }

  return L.latLngBounds([swConverted.reverse(), neConverted.reverse()]);
}

function toByte(value, bitsPerSample = 8) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const max = Math.max(1, Math.pow(2, bitsPerSample) - 1);
  return Math.max(0, Math.min(255, Math.round((value / max) * 255)));
}

async function convertGeoTiffBlobToPngBlob(tiffBlob) {
  const tiff = await geotiffFromBlob(tiffBlob);
  const image = await tiff.getImage();

  const width = image.getWidth();
  const height = image.getHeight();
  const samplesPerPixel =
    image.getSamplesPerPixel?.() ?? image.fileDirectory?.SamplesPerPixel ?? 1;

  const bitsRaw =
    image.getBitsPerSample?.() ?? image.fileDirectory?.BitsPerSample ?? 8;
  const bits = Array.isArray(bitsRaw) ? bitsRaw : [bitsRaw];

  const raster = await image.readRasters({ interleave: true });
  const rgba = new Uint8ClampedArray(width * height * 4);

  for (let i = 0, p = 0; i < width * height; i++, p += 4) {
    const base = i * samplesPerPixel;

    if (samplesPerPixel === 1) {
      const g = toByte(raster[base], bits[0] ?? 8);
      rgba[p] = g;
      rgba[p + 1] = g;
      rgba[p + 2] = g;
      rgba[p + 3] = 255;
    } else {
      rgba[p] = toByte(raster[base], bits[0] ?? 8);
      rgba[p + 1] = toByte(raster[base + 1], bits[1] ?? bits[0] ?? 8);
      rgba[p + 2] = toByte(raster[base + 2], bits[2] ?? bits[0] ?? 8);
      rgba[p + 3] =
        samplesPerPixel >= 4
          ? toByte(raster[base + 3], bits[3] ?? bits[0] ?? 8)
          : 255;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.putImageData(new ImageData(rgba, width, height), 0, 0);

  const pngBlob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png",
    ),
  );

  return { pngBlob, width, height };
}
