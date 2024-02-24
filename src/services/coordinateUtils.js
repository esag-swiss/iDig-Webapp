import proj4 from "proj4";

// Définition des systèmes de coordonnées
proj4.defs([
  [
    "EPSG:2100",
    "+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000 +y_0=0 +datum=GGRS87 +units=m +no_defs ",
  ],
  [
    "GGRS87",
    "+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000 +y_0=0 +datum=GGRS87 +units=m +no_defs ",
  ],
  [
    "AEO_Aegina",
    "+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000 +y_0=0 +datum=GGRS87 +units=m +no_defs ",
  ],

  [
    "Amarynthos", // Based on EPSG2100 with X -400000 and Y -4200000
    "+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=100000 +y_0=-4200000 +datum=GGRS87 +units=m +no_defs ",
  ],
  ["EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs"],
  ["WGS84", "+proj=longlat +datum=WGS84 +no_defs"],
  ["EPSG:32634", "+proj=utm +zone=34 +datum=WGS84 +units=m +no_defs"],
  ["UTM zone 34", "+proj=utm +zone=34 +datum=WGS84 +units=m +no_defs"],
  ["EPSG:32635", "+proj=utm +zone=34 +datum=WGS84 +units=m +no_defs"],
  ["UTM zone 35", "+proj=utm +zone=35 +datum=WGS84 +units=m +no_defs"],
  [
    "Agora",
    "+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=24756 +y_0=-4202878.2 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
  ],
]);

export function convertToEPSG4326(xyArray, crs) {
  let sourceSystem = crs;
  let targetSystem = "EPSG:4326";

  const coords = proj4(sourceSystem, targetSystem, xyArray);
  return { coords };
}
