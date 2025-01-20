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
    // Crée un lien de téléchargement
    const link = document.createElement("a");
    link.href = imgData;
    link.download = "map_export.png";
    link.click();
  });
}
