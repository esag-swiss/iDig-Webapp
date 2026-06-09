import { describe, it, expect, beforeEach, vi } from "vitest";
import proj4 from "proj4";
import {
  CRS_FORMAT,
  detectCrsFormat,
  resolveProjectCrs,
  convertToEPSG4326,
} from "@/services/coordinateUtils";

describe("detectCrsFormat", () => {
  it("should recognise EPSG codes with and without prefix", () => {
    expect(detectCrsFormat("EPSG:2100")).toBe(CRS_FORMAT.EPSG);
    expect(detectCrsFormat("epsg:32634")).toBe(CRS_FORMAT.EPSG);
    expect(detectCrsFormat("2100")).toBe(CRS_FORMAT.EPSG);
  });

  it("should recognise PROJ4 strings", () => {
    expect(
      detectCrsFormat("+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000")
    ).toBe(CRS_FORMAT.PROJ4);
    expect(detectCrsFormat("  +proj=longlat +datum=WGS84 +no_defs")).toBe(
      CRS_FORMAT.PROJ4
    );
  });

  it("should recognise WKT strings", () => {
    expect(
      detectCrsFormat('PROJCS["GGRS87 / Greek Grid",GEOGCS["GGRS87",...]]')
    ).toBe(CRS_FORMAT.WKT);
    expect(detectCrsFormat('GEOGCRS["WGS 84",DATUM["WGS_1984",...]]')).toBe(
      CRS_FORMAT.WKT
    );
  });

  it("should recognise hardcoded named CRS", () => {
    expect(detectCrsFormat("Amarynthos")).toBe(CRS_FORMAT.NAMED);
    expect(detectCrsFormat("Agora")).toBe(CRS_FORMAT.NAMED);
    expect(detectCrsFormat("UTM zone 34")).toBe(CRS_FORMAT.NAMED);
  });

  it("should return UNKNOWN for empty or non-string input", () => {
    expect(detectCrsFormat("")).toBe(CRS_FORMAT.UNKNOWN);
    expect(detectCrsFormat("   ")).toBe(CRS_FORMAT.UNKNOWN);
    expect(detectCrsFormat(null)).toBe(CRS_FORMAT.UNKNOWN);
    expect(detectCrsFormat(undefined)).toBe(CRS_FORMAT.UNKNOWN);
    expect(detectCrsFormat(2100)).toBe(CRS_FORMAT.UNKNOWN);
  });

  it("should return UNKNOWN for unrecognised free text", () => {
    expect(detectCrsFormat("SomeProjectWeDoNotKnow")).toBe(CRS_FORMAT.UNKNOWN);
  });
});

describe("resolveProjectCrs", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("should return the value as-is for a known named CRS", () => {
    expect(resolveProjectCrs("Amarynthos", "Amarynthos")).toBe("Amarynthos");
    expect(resolveProjectCrs("Agora", "Agora")).toBe("Agora");
  });

  it("should normalise EPSG codes and accept bare numeric codes", () => {
    expect(resolveProjectCrs("epsg:2100", "Amarynthos")).toBe("EPSG:2100");
    expect(resolveProjectCrs("2100", "Amarynthos")).toBe("EPSG:2100");
  });

  it("should fall back to the project name for unknown EPSG codes", () => {
    expect(resolveProjectCrs("EPSG:9999", "Amarynthos")).toBe("Amarynthos");
  });

  it("should register PROJ4 strings dynamically and return a stable key", () => {
    const key = resolveProjectCrs(
      "+proj=tmerc +lat_0=0 +lon_0=24 +k=0.9996 +x_0=500000 +y_0=0 +datum=GGRS87 +units=m +no_defs",
      "MyCustomProject"
    );
    expect(key).toBe("MyCustomProject__fromPreferences");
    expect(proj4.defs(key)).toBeTruthy();
  });

  it("should register WKT strings dynamically", () => {
    const wkt =
      'PROJCS["GGRS87 / Greek Grid",GEOGCS["GGRS87",DATUM["Greek_Geodetic_Reference_System_1987",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",24],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1]]';
    const key = resolveProjectCrs(wkt, "WktProject");
    expect(key).toBe("WktProject__fromPreferences");
    expect(proj4.defs(key)).toBeTruthy();
  });

  it("should fall back to the hardcoded project name when crs is missing", () => {
    expect(resolveProjectCrs(undefined, "Agora")).toBe("Agora");
    expect(resolveProjectCrs(null, "Amarynthos")).toBe("Amarynthos");
    expect(resolveProjectCrs("", "Agora")).toBe("Agora");
  });

  it("should return null when no fallback is available", () => {
    expect(resolveProjectCrs(undefined, "UnknownProject")).toBeNull();
    expect(resolveProjectCrs("ZeroIdea", "AlsoUnknown")).toBeNull();
  });
});

describe("convertToEPSG4326", () => {
  it("should convert coordinates using a resolved CRS key", () => {
    const key = resolveProjectCrs("Amarynthos", "Amarynthos");
    const { coords } = convertToEPSG4326([100000, 0], key);
    expect(Array.isArray(coords)).toBe(true);
    expect(coords).toHaveLength(2);
    expect(coords.every(Number.isFinite)).toBe(true);
  });

  it("should work after dynamic registration of a PROJ4 string", () => {
    const key = resolveProjectCrs(
      "+proj=utm +zone=34 +datum=WGS84 +units=m +no_defs",
      "DynamicUtm"
    );
    const { coords } = convertToEPSG4326([500000, 4000000], key);
    expect(coords.every(Number.isFinite)).toBe(true);
  });
});
