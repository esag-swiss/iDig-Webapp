import { fieldsSchema } from "@/assets/nativeFields";

export const RELATION_FIELDS = Object.keys(fieldsSchema).filter(
  (field) =>
    fieldsSchema[field]?.type === "link" && /^Relation.*UUID$/.test(field),
);

export function parseUuidList(value) {
  if (value === null || value === undefined) {
    return [];
  }
  return String(value).split("\n").filter(Boolean);
}

export function buildUuidIndex(items) {
  const index = new Map();
  if (!Array.isArray(items)) {
    return index;
  }
  for (const item of items) {
    if (item?.IdentifierUUID) {
      index.set(item.IdentifierUUID, item);
    }
  }
  return index;
}

export function resolveRelatedItems(item, relationField, index) {
  if (!item || !index) {
    return [];
  }
  return parseUuidList(item[relationField])
    .map((uuid) => index.get(uuid))
    .filter(Boolean);
}
