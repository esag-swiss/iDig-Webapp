import { convertToEPSG4326 } from "@/services/coordinateUtils";
import { useDataStore } from "@/stores/data";

// "CoverageSerialized" :
export function geoSerializedToGeojson(json) {
  let geojson = {
    type: "FeatureCollection",
    name: "trenches",
    features: [],
  };
  for (let i = 0; i < json.length; i++) {
    if (
      json[i] &&
      Object.prototype.hasOwnProperty.call(json[i], "CoverageSerialized")
    ) {
      let geoType = ""; //  list of type used by iDig in field CoverageSerialized  are : Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, and GeometryCollection?

      let polyStrings = json[i].CoverageSerialized;
      if (polyStrings.includes("\n\n\n")) {
        polyStrings = polyStrings.split("\n\n\n");

        if (polyStrings[0].includes("\n\n")) {
          if (polyStrings[0].split("\n\n").length < 4) {
            geoType = "MultiLineString";
            polyStrings = polyStrings.map((v) =>
              v
                .split("\n\n")
                .map((v) => CoverageSerializedXYZToGeojsonPosition(v))
            );
          } else {
            geoType = "MultiPolygon";
            polyStrings = polyStrings.map((v) => [
              makePolyClockwise(
                v
                  .split("\n\n")
                  .map((v) => CoverageSerializedXYZToGeojsonPosition(v))
              ),
            ]);
          }
        } else {
          // pour gérer le cas super rare ou /n/n/n mais pas de /n/n !
          geoType = "Point";
          polyStrings = CoverageSerializedXYZToGeojsonPosition(polyStrings[0]);
        }
      } else if (polyStrings.includes("\n\n")) {
        polyStrings = polyStrings.split("\n\n");

        if (polyStrings.length < 4) {
          // it seems this wrongly assume that >= 4 are Polygones but it may be LineString
          geoType = "LineString";
          polyStrings = polyStrings.map((v) =>
            CoverageSerializedXYZToGeojsonPosition(v)
          );
        } else {
          geoType = "Polygon";
          polyStrings = [
            makePolyClockwise(
              polyStrings.map((v) => CoverageSerializedXYZToGeojsonPosition(v))
            ),
          ];
        }
      } else if (polyStrings.includes("\n")) {
        geoType = "Point";
        polyStrings = CoverageSerializedXYZToGeojsonPosition(polyStrings);
      }

      // END of cases
      if (polyStrings !== null) {
        geojson.features.push({
          type: "Feature",
          geometry: {
            type: geoType,
            coordinates: polyStrings,
          },
          // As properties we only send back few fields to produce a lighter output
          properties: {
            id: json[i].Identifier,
            type: json[i].Type,
            title: json[i].Title,
          },
        });
      } else {
        console.log("coord err IdentifierUUID  : " + json[i].Identifier);
      }
    }
  }
  return geojson;
}

// Convert coordinates from iDig format to geojson position in EPSG4326
// Geojson position is the fundamental geometry construct
function CoverageSerializedXYZToGeojsonPosition(XYZ) {
  let coordinates = XYZ.split("\n");
  coordinates = coordinates.reduce((v, or) => {
    if (
      or.split("=")[0] == "x" ||
      or.split("=")[0] == "y" ||
      or.split("=")[0] == "z"
    ) {
      v.push(hexToDecimal(or.split("=")[1]));
    }
    return v;
  }, []);
  // convert coords if valid else apply null and will handle at next step
  const { projectPreferencesCRS } = useDataStore();
  if (coordinates.length > 1) {
    coordinates = convertToEPSG4326(coordinates, projectPreferencesCRS).coords;
  } else {
    coordinates = null;
  }
  return coordinates;
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

    return Number(decimal);
  }
  return 0;
}

// to be a valid geojson we need coordinates of polygones to be clockwise
function makePolyCCW(poly) {
  let sum = 0;
  for (let i = 0; i < poly.length - 1; i++) {
    let cur = poly[i],
      next = poly[i + 1];
    sum += (next[0] - cur[0]) * (next[1] + cur[1]);
  }
  return sum < 0 ? poly.slice().reverse() : poly;
}
function makePolyClockwise(poly) {
  let sum = 0;
  for (let i = 0; i < poly.length - 1; i++) {
    sum += (poly[i + 1][0] - poly[i][0]) * (poly[i + 1][1] + poly[i][1]);
  }
  return sum > 0 ? poly.slice().reverse() : poly;
}
