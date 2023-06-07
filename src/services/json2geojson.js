var geojson = {
  type: "FeatureCollection",
  name: "trenches",

  features: [],
};

//
// Prendre en compte
// "CoverageGEO" : "GEOMETRYCOLLECTION (POLYGON ((

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
      }
      if (json1[i].CoverageGEO.split(" ")[0] == "POLYGON") {
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
      } else {
        return geojson;
      }
    }
  }
}

// "CoverageSerialized" :
export function geoSerializedToGeojson(json) {
  for (var i = 0; i < json.length; i++) {
    if (Object.prototype.hasOwnProperty.call(json[i], "CoverageSerialized")) {
      let geoType = ""; //Point.LineString, Polygon, MultiPoint, MultiLineString MultiPolygon.
      // types utilisés par Bruce GeometryCollection
      let polyStrings = json[i].CoverageSerialized;
      let ccw = "";
      if (polyStrings.includes("\n\n\n")) {
        polyStrings = polyStrings.split("\n\n\n");

        if (polyStrings[0].includes("\n\n")) {
          if (polyStrings[0].split("\n\n").length < 4) {
            geoType = "MultiLineString";
            polyStrings = polyStrings.map((v) =>
              v.split("\n\n").map((v) =>
                v.split("\n").reduce((v, or) => {
                  if (
                    or.split("=")[0] == "x" ||
                    or.split("=")[0] == "y" ||
                    or.split("=")[0] == "z"
                  ) {
                    v.push(hexToDecimal(or.split("=")[1]));
                  }

                  return v;
                }, [])
              )
            );
          } else {
            geoType = "MultiPolygon";
            polyStrings = polyStrings.map((v) => [
              makePolyClockwise(
                v.split("\n\n").map((v) =>
                  v.split("\n").reduce((v, or) => {
                    if (
                      or.split("=")[0] == "x" ||
                      or.split("=")[0] == "y" ||
                      or.split("=")[0] == "z"
                    ) {
                      v.push(hexToDecimal(or.split("=")[1]));
                    }
                    return v;
                  }, [])
                )
              ),
            ]);
          }
        } else {
          // pour gérer le cas super rare ou /n/n/n mais pas de /n/n !
          geoType = "Point";
          polyStrings = polyStrings[0].split("\n");
          polyStrings = polyStrings.reduce((v, or) => {
            if (
              or.split("=")[0] == "x" ||
              or.split("=")[0] == "y" ||
              or.split("=")[0] == "z"
            ) {
              v.push(hexToDecimal(or.split("=")[1]));
            }
            return v;
          }, []);
          // pour gérer les cas où CoverageSerialized exist mais n'a pas de coordonnées
          if (polyStrings.length === 0) {
            polyStrings = [0, 0, 0];
          }
        }
      } else if (polyStrings.includes("\n\n")) {
        polyStrings = polyStrings.split("\n\n");

        if (polyStrings.length < 4) {
          geoType = "LineString";
          polyStrings = polyStrings.map((v) =>
            v.split("\n").reduce((v, or) => {
              if (
                or.split("=")[0] == "x" ||
                or.split("=")[0] == "y" ||
                or.split("=")[0] == "z"
              ) {
                v.push(hexToDecimal(or.split("=")[1]));
              }
              return v;
            }, [])
          );
        } else {
          geoType = "Polygon";
          polyStrings = [
            makePolyClockwise(
              polyStrings.map((v) =>
                v.split("\n").reduce((v, or) => {
                  if (
                    or.split("=")[0] == "x" ||
                    or.split("=")[0] == "y" ||
                    or.split("=")[0] == "z"
                  ) {
                    v.push(hexToDecimal(or.split("=")[1]));
                  }
                  return v;
                }, [])
              )
            ),
          ];
          ccw = "Polygon";
        }
      } else if (polyStrings.includes("\n")) {
        geoType = "Point";
        polyStrings = polyStrings.split("\n");
        polyStrings = polyStrings.reduce((v, or) => {
          if (
            or.split("=")[0] == "x" ||
            or.split("=")[0] == "y" ||
            or.split("=")[0] == "z"
          ) {
            v.push(hexToDecimal(or.split("=")[1]));
          }
          return v;
        }, []);
        // pour gérer les cas où CoverageSerialized exist mais n'a pas de coordonnées
        if (polyStrings.length === 0) {
          polyStrings = [0, 0, 0];
        }
      }

      geojson.features.push({
        type: "Feature",
        ccw: ccw,
        geometry: {
          type: geoType,
          coordinates: polyStrings,
        },
        properties: { id: json[i].Identifier },
      });
    }
  }
  return geojson;
}

function hexToDecimal(hex) {
  const match = /^0X([0-9A-Fa-f]+).([0-9A-Fa-f]+)P([+-]?\d+)$/i.exec(hex);

  if (match) {
    const hexadecimal = match[1];
    const fractionalPart = match[2] || "";
    const exponent = match[3];

    let decimal = 0;
    let power = 0;

    for (let i = hexadecimal.length - 1; i >= 0; i--) {
      const digit = parseInt(hexadecimal[i], 16);
      decimal += digit * 16 ** power;
      power++;
    }

    let fractional = 0;
    power = -1;

    for (let i = 0; i < fractionalPart.length; i++) {
      const digit = parseInt(fractionalPart[i], 16);
      fractional += digit * 16 ** power;
      power--;
    }

    decimal += fractional;
    decimal *= 2 ** exponent;
    // Spécifique au projet Amarynthos
    return decimal > 90000
      ? 400000 + Number(decimal)
      : decimal > 40000
      ? 4200000 + Number(decimal)
      : Number(decimal);
  }
  return 0;
}

function makePolyClockwise(poly) {
  var sum = 0;
  for (var i = 0; i < poly.length - 1; i++) {
    var cur = poly[i],
      next = poly[i + 1];
    sum += (next[0] - cur[0]) * (next[1] + cur[1]);
  }
  return sum < 0 ? poly.slice().reverse() : poly;
}
function makePolyCCW(poly) {
  var sum = 0;
  for (var i = 0; i < poly.length - 1; i++) {
    sum += (poly[i + 1][0] - poly[i][0]) * (poly[i + 1][1] + poly[i][1]);
  }
  return sum > 0 ? poly.slice().reverse() : poly;
}
