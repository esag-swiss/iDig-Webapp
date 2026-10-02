import { geoSerializedToGeojson } from "@/services/json2geojson";

function toJson(items) {
  return new Blob([JSON.stringify(items)], { type: "application/json" });
}

function toTab(items) {
  const header = [...new Set(items.flatMap((item) => Object.keys(item)))];
  const replacer = (key, value) => (value === null ? "" : value);
  const lines = [
    header.join("\t"),
    ...items.map((item) =>
      header
        .map((field) => JSON.stringify(item[field], replacer) ?? "")
        .join("\t"),
    ),
  ];
  return new Blob([lines.join("\r\n")], {
    type: "text/tab-separated-values",
  });
}

function toGeojson(items) {
  return new Blob([JSON.stringify(geoSerializedToGeojson(items))], {
    type: "application/geo+json",
  });
}

export { toJson, toTab, toGeojson };
