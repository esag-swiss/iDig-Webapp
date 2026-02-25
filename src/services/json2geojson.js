import { convertToEPSG4326 } from "@/services/coordinateUtils";
import { useDataStore } from "@/stores/data";

const LEVEL_2_SEPARATOR = "\n\n";
const LEVEL_3_SEPARATOR = "\n\n\n";
const FEATURE_COLLECTION_NAME = "trenches";
const COVERAGE_KEY = "CoverageSerialized";
const COORDINATE_PREFIXES = ["x", "y", "z"];

export function determineGeoType(coverageSerialized) {
  let geoType = "";
  const level3 = cleanMulti(coverageSerialized);

  if (level3.length > 1) {
    geoType = "MultiPolygon";
  } // prevoir aussi MultiLineString
  else {
    level3.forEach((geometryBlock) => {
      const level2Blocks = geometryBlock.split(LEVEL_2_SEPARATOR).length;

      if (level2Blocks < 2) {
        geoType = "Point";
      } else if (level2Blocks < 4) {
        geoType = "LineString";
      } else {
        geoType = "Polygon";
      }
    });
  }

  return geoType;
}

function cleanMulti(coverageSerialized) {
  return coverageSerialized.split(LEVEL_3_SEPARATOR).reduce((result, block) => {
    if (block.includes("x=")) {
      result.push(block);
    }
    return result;
  }, []);
}

function processLevel2(coverageSerialized2ndLevel) {
  let level2 = coverageSerialized2ndLevel.split(LEVEL_2_SEPARATOR);

  if (level2.length < 2) {
    if (coverageSerialized2ndLevel.includes("x=")) {
      return CoverageSerializedXYZToGeojsonPosition(coverageSerialized2ndLevel);
    }

    return level2;
  }

  if (level2.length < 4) {
    return level2.map((v) => CoverageSerializedXYZToGeojsonPosition(v));
  }

  level2 = processPolygon(level2);
  return level2;
}

function processPolygon(coverageSerialized2ndLevel) {
  return [
    makePolyClockwise(
      coverageSerialized2ndLevel.map((v) =>
        CoverageSerializedXYZToGeojsonPosition(v)
      )
    ),
  ];
}

function buildFeature(item, geoType, geojsonCoordinates) {
  return {
    type: "Feature",
    geometry: {
      type: geoType,
      coordinates: geojsonCoordinates,
    },
    properties: {
      id: item.Identifier,
      type: item.Type,
      title: item.Title,
      Trench: item.Trench,
      IdentifierUUID: item.IdentifierUUID,
    },
  };
}

export function geoSerializedToGeojson(json) {
  const geojson = {
    type: "FeatureCollection",
    name: FEATURE_COLLECTION_NAME,
    features: [],
  };

  for (let i = 0; i < json.length; i++) {
    const item = json[i];

    if (
      item &&
      Object.prototype.hasOwnProperty.call(item, COVERAGE_KEY) &&
      item.CoverageSerialized.includes("x=")
    ) {
      let geojsonCoordinates = "";
      let geoType = ""; // Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon. and GeometryCollection?
      let polyStrings = item.CoverageSerialized;

      if (polyStrings.includes(LEVEL_3_SEPARATOR)) {
        polyStrings = cleanMulti(polyStrings);

        if (polyStrings[0].includes(LEVEL_2_SEPARATOR)) {
          geoType = "MultiPolygon";
          geojsonCoordinates = polyStrings.map((v) => [
            makePolyClockwise(
              v.split(LEVEL_2_SEPARATOR).map((coordinateRow) =>
                CoverageSerializedXYZToGeojsonPosition(coordinateRow)
              )
            ),
          ]);
        } else {
          // pour gérer le cas super rare ou /n/n/n mais pas de /n/n !
          geoType = "Point";
          geojsonCoordinates = CoverageSerializedXYZToGeojsonPosition(
            polyStrings[0]
          );
        }
      } else {
        geoType = determineGeoType(polyStrings);
        geojsonCoordinates = processLevel2(polyStrings);
      }

      if (geojsonCoordinates !== null) {
        // As properties we only send back few fields to produce a lighter output
        geojson.features.push(buildFeature(item, geoType, geojsonCoordinates));
      } else {
        console.log("coord error on : " + item.CoverageSerialized);
      }
    }
  }

  return geojson;
}

// Convert coordinates from iDig format to geojson position in EPSG4326
// Geojson position is the fundamental geometry construct
export function CoverageSerializedXYZToGeojsonPosition(XYZ) {
  let coordinates = XYZ.split("\n");
  coordinates = coordinates.reduce((values, rawCoordinate) => {
    const [key, value] = rawCoordinate.split("=");

    if (COORDINATE_PREFIXES.includes(key)) {
      values.push(hexToDecimal(value));
    }

    return values;
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
function makePolyClockwise(poly) {
  let sum = 0;
  for (let i = 0; i < poly.length - 1; i++) {
    sum += (poly[i + 1][0] - poly[i][0]) * (poly[i + 1][1] + poly[i][1]);
  }
  return sum > 0 ? poly.slice().reverse() : poly;
}
