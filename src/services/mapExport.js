import html2canvas from "html2canvas";

export function exportMapAsPNG() {
  const mapElement = document.getElementById("mapContainer");
  // Utiliser html2canvas pour capturer l'élément de la carte
  html2canvas(mapElement, {
    ignoreElements: function (element) {
      if (
        element.classList.contains("leaflet-control-zoom") ||
        element.classList.contains("leaflet-control-layers")
      ) {
        return true;
      }
    },
    useCORS: true,
    async: true,
  }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    link.download = "map_export.png";
    link.click();
  });
}

export async function exportMapAsCompositeSVG() {
  const mapElement = document.getElementById("mapContainer");
  const svgLayer = document.querySelector(
    "#mapContainer .leaflet-overlay-pane svg",
  );
  if (!mapElement || !svgLayer) {
    alert("Impossible de trouver le fond raster ou la couche SVG.");
    return;
  }

  // 1. Capture le raster en PNG (base64)
  const canvas = await html2canvas(mapElement, {
    ignoreElements: function (element) {
      // Ignore les overlays SVG et les contrôles
      if (
        element.classList.contains("leaflet-control-zoom") ||
        element.classList.contains("leaflet-top") ||
        element.tagName === "svg"
      ) {
        return true;
      }
    },
    useCORS: true,
    async: true,
  });
  const imgData = canvas.toDataURL("image/png");

  // 2. Prépare le SVG vectoriel
  const svgClone = svgLayer.cloneNode(true);
  // Récupère la taille du conteneur
  const width = mapElement.offsetWidth;
  const height = mapElement.offsetHeight;

  // 3. Crée un SVG composite
  const serializer = new XMLSerializer();
  const svgContent = serializer.serializeToString(svgClone);
  // Reconstruis le SVG pour Illustrator en ajoutant le namespace xlink et en passant à xlink:href
  const compositeSVG = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <image xlink:href="${imgData}" x="0" y="0" width="${width}" height="${height}"/>
    ${svgContent}
  </svg>`;
  // 4. Télécharge le SVG composite
  const blob = new Blob([compositeSVG], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "map_composite_export.svg";
  link.click();
  URL.revokeObjectURL(url);
}
