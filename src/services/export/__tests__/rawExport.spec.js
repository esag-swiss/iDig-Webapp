import { describe, it, expect } from "vitest";
import { toGeojson, toJson, toTab } from "@/services/export/rawExport";

function read(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsText(blob);
  });
}

const items = [
  { Identifier: "1", Title: "Floor" },
  { Identifier: "2", Description: "Coin", Title: null },
];

describe("toJson", () => {
  it("should serialize the items as JSON", async () => {
    expect(JSON.parse(await read(toJson(items)))).toEqual(items);
  });
});

describe("toTab", () => {
  it("should write one column per field used by any item", async () => {
    const lines = (await read(toTab(items))).split("\r\n");
    expect(lines[0]).toBe("Identifier\tTitle\tDescription");
    expect(lines[1]).toBe('"1"\t"Floor"\t');
    expect(lines[2]).toBe('"2"\t""\t"Coin"');
  });
});

describe("toGeojson", () => {
  it("should write a GeoJSON feature collection", async () => {
    const geojson = JSON.parse(await read(toGeojson([])));
    expect(geojson.type).toBe("FeatureCollection");
  });
});
