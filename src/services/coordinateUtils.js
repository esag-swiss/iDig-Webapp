import proj4 from "proj4";

// Définition des systèmes de coordonnées
proj4.defs([
  [
    "EPSG:2100",
    "+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000 +y_0=0 +datum=GGRS87 +units=m +no_defs ",
  ],
  [
    "Amarynthos", // Based on EPSG2100 with X -400000 and Y -4200000
    "+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=100000 +y_0=-4200000 +datum=GGRS87 +units=m +no_defs ",
  ],
  ["EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs"],
  ["WGS84", "+proj=longlat +datum=WGS84 +no_defs"],
  [
    "Agora",
    "+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=24900 +y_0=-4202575 +datum=GGRS87 +units=m +no_defs ",
  ],
  [
    "AgoraQGIS",
    "+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=24757 +y_0=-4202880 +datum=GGRS87 +units=m +no_defs ",
  ],
]);

export function convertToEPSG4326(xyArray, crs) {
  let sourceSystem = crs;
  let targetSystem = "EPSG:4326";

  const coords = proj4(sourceSystem, targetSystem, xyArray);
  return { coords };
}
