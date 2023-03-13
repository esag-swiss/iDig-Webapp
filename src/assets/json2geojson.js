export var geojson = {
  type: "FeatureCollection",
  name: "trenches",
  features: [],
};

//
// Prendre en compte
// "CoverageGEO" : "GEOMETRYCOLLECTION (POLYGON ((
// et "CoverageSerialized" :

export function json2geojson(json1) {
  for (var i = 0; i < json1.length; i++) {
    if (Object.prototype.hasOwnProperty.call(json1[i], "CoverageGEO")) {
      if (json1[i].CoverageGEO.split(" ")[0] == "POINT") {
        geojson.features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              400000 + Number(json1[i].CoveragePosition.split(", ")[0]),
              4200000 + Number(json1[i].CoveragePosition.split(", ")[1]),
            ],
          },
          properties: json1[i],
        });
      } else if (json1[i].CoverageGEO.split(" ")[0] == "POLYGON") {
        var coordinates = json1[i].CoverageGEO.split(" ((")[1];
        coordinates = coordinates.replace("))", "");
        coordinates = coordinates.split(", ");
        coordinates = coordinates.map((x) =>
          x.split(" ").map((n) => {
            if (n > 91000) {
              return 400000 + Number(n);
            } else {
              return 4200000 + Number(n);
            }
          })
        );
        coordinates = [coordinates];
        geojson.features.push({
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: coordinates,
          },
          properties: json1[i],
        });
      }
    }
  }
}
