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
    "GGR87",
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

// Legacy named CRS resolved via the proj4.defs registered above. Used as a
// fallback when the `crs` field in Preferences.json is a project name rather
// than a real EPSG / WKT / PROJ4 string.
const HARDCODED_CRS_NAMES = new Set([
  "EPSG:2100",
  "GGRS87",
  "GGR87",
  "AEO_Aegina",
  "Amarynthos",
  "EPSG:4326",
  "WGS84",
  "EPSG:32634",
  "UTM zone 34",
  "EPSG:32635",
  "UTM zone 35",
  "Agora",
]);

export const CRS_FORMAT = Object.freeze({
  EPSG: "epsg",
  WKT: "wkt",
  PROJ4: "proj4",
  NAMED: "named",
  UNKNOWN: "unknown",
});

// ───────────────────────────────────────────────────────────────────────────
// Format detection
// ───────────────────────────────────────────────────────────────────────────

const EPSG_WITH_PREFIX_REGEX = /^EPSG:\d+$/i;
const EPSG_IN_TEXT_REGEX = /\bEPSG\s*:?\s*(\d{4,6})\b/i;
const EPSG_BARE_NUMERIC_REGEX = /^\d{4,6}$/;
const PROJ4_PREFIX_REGEX = /^\+proj=/i;
const WKT_ROOT_KEYWORD_REGEX =
  /^(PROJCS|GEOGCS|PROJCRS|GEOGCRS|GEOCCS|COMPDCS|COMPD_CS|VERT_CS|VERTCRS|BOUNDCRS|ENGCRS|TIMECRS)\s*\[/i;

const isEpsg = (value) =>
  EPSG_WITH_PREFIX_REGEX.test(value) ||
  EPSG_IN_TEXT_REGEX.test(value) ||
  EPSG_BARE_NUMERIC_REGEX.test(value);
const isProj4 = (value) => PROJ4_PREFIX_REGEX.test(value);
const isWkt = (value) => WKT_ROOT_KEYWORD_REGEX.test(value);
const isNamedCrs = (value) => HARDCODED_CRS_NAMES.has(value);

const FORMAT_DETECTORS = [
  [isEpsg, CRS_FORMAT.EPSG],
  [isProj4, CRS_FORMAT.PROJ4],
  [isWkt, CRS_FORMAT.WKT],
  [isNamedCrs, CRS_FORMAT.NAMED],
];

function trimmedOrNull(value) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed || null;
}

// Detect the format of a CRS string read from Preferences.json.
// EPSG: "EPSG:2100", "epsg:2100", or a bare numeric code like "2100".
// PROJ4: starts with "+proj=" (with optional leading whitespace).
// WKT: starts with one of the standard WKT root keywords + "[".
// NAMED: matches a known hardcoded label (Amarynthos, Agora, ...).
export function detectCrsFormat(crsValue) {
  const value = trimmedOrNull(crsValue);
  if (!value) {
    return CRS_FORMAT.UNKNOWN;
  }
  const match = FORMAT_DETECTORS.find(([test]) => test(value));
  return match ? match[1] : CRS_FORMAT.UNKNOWN;
}

// ───────────────────────────────────────────────────────────────────────────
// proj4 helpers
// ───────────────────────────────────────────────────────────────────────────

function normalizeEpsgCode(value) {
  const match = EPSG_IN_TEXT_REGEX.exec(value);
  const code = match
    ? match[1]
    : EPSG_WITH_PREFIX_REGEX.test(value)
      ? value.split(":")[1]
      : value;
  return `EPSG:${code}`;
}

function hasProj4Def(key) {
  try {
    return Boolean(proj4.defs(key));
  } catch {
    return false;
  }
}

function tryRegisterProj4Def(key, definition) {
  try {
    proj4.defs(key, definition);
    return true;
  } catch (e) {
    console.warn(
      `[coordinateUtils] Failed to register "${key}": ${e?.message}.`,
    );
    return false;
  }
}

function buildCustomCrsKey(projectName, value) {
  return projectName ? `${projectName}__fromPreferences` : value;
}

function warnFallback(reason, fallbackKey) {
  const target = fallbackKey ? `"${fallbackKey}"` : "none";
  console.warn(`[coordinateUtils] ${reason} Falling back to ${target}.`);
}

// ───────────────────────────────────────────────────────────────────────────
// Resolver
// ───────────────────────────────────────────────────────────────────────────

// Resolve the `crs` field from Preferences.json to a proj4 key usable with
// convertToEPSG4326. Registers WKT / PROJ4 strings on the fly; falls back
// to the hardcoded named definitions when the value is unrecognised.
export function resolveProjectCrs(crsValue, projectName) {
  const fallbackKey =
    projectName && hasProj4Def(projectName) ? projectName : null;

  const value = trimmedOrNull(crsValue);
  if (!value) {
    return fallbackKey;
  }

  switch (detectCrsFormat(value)) {
    case CRS_FORMAT.NAMED:
      return value;

    case CRS_FORMAT.EPSG: {
      const key = normalizeEpsgCode(value);
      if (hasProj4Def(key)) {
        return key;
      }
      warnFallback(`EPSG code "${key}" is not registered.`, fallbackKey);
      return fallbackKey;
    }

    case CRS_FORMAT.WKT:
    case CRS_FORMAT.PROJ4: {
      const key = buildCustomCrsKey(projectName, value);
      return tryRegisterProj4Def(key, value) ? key : fallbackKey;
    }

    default:
      // Unknown format: maybe it's a name we know via proj4 but not in our
      // hardcoded map (or registered earlier). Try it before falling back.
      if (hasProj4Def(value)) {
        return value;
      }
      warnFallback(`Unknown CRS "${value}".`, fallbackKey);
      return fallbackKey;
  }
}

// ───────────────────────────────────────────────────────────────────────────
// Coordinate conversion
// ───────────────────────────────────────────────────────────────────────────

export function convertToEPSG4326(xyArray, crs) {
  const coords = proj4(crs, "EPSG:4326", xyArray);
  return { coords };
}
