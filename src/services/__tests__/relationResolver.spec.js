import { describe, it, expect } from "vitest";
import {
  RELATION_FIELDS,
  parseUuidList,
  buildUuidIndex,
  resolveRelatedItems,
} from "@/services/relationResolver";

describe("relationResolver", () => {
  describe("RELATION_FIELDS", () => {
    it("should list the UUID relation fields", () => {
      expect(RELATION_FIELDS).toContain("RelationBelongsToUUID");
      expect(RELATION_FIELDS).toContain("RelationIncludesUUID");
      expect(RELATION_FIELDS).toContain("RelationIsAboveUUID");
    });

    it("should exclude non-UUID link fields", () => {
      expect(RELATION_FIELDS).not.toContain("RelationAttachments");
      RELATION_FIELDS.forEach((field) => {
        expect(field).toMatch(/^Relation.*UUID$/);
      });
    });
  });

  describe("parseUuidList", () => {
    it("should return an empty array for null or undefined", () => {
      expect(parseUuidList(null)).toEqual([]);
      expect(parseUuidList(undefined)).toEqual([]);
    });

    it("should wrap a single value in an array", () => {
      expect(parseUuidList("uuid-1")).toEqual(["uuid-1"]);
    });

    it("should split multiple values on newlines", () => {
      expect(parseUuidList("uuid-1\nuuid-2")).toEqual(["uuid-1", "uuid-2"]);
    });

    it("should drop empty segments", () => {
      expect(parseUuidList("uuid-1\n\nuuid-2\n")).toEqual(["uuid-1", "uuid-2"]);
    });
  });

  describe("buildUuidIndex", () => {
    it("should key items by their IdentifierUUID", () => {
      const items = [
        { IdentifierUUID: "u1", Title: "A" },
        { IdentifierUUID: "u2", Title: "B" },
      ];
      const index = buildUuidIndex(items);
      expect(index.get("u1").Title).toBe("A");
      expect(index.get("u2").Title).toBe("B");
    });

    it("should skip items without an IdentifierUUID", () => {
      const index = buildUuidIndex([{ Title: "no uuid" }]);
      expect(index.size).toBe(0);
    });

    it("should return an empty Map for non-array input", () => {
      expect(buildUuidIndex(null).size).toBe(0);
    });
  });

  describe("resolveRelatedItems", () => {
    const index = buildUuidIndex([
      { IdentifierUUID: "u1", Title: "Parent" },
      { IdentifierUUID: "u2", Title: "Sibling" },
    ]);

    it("should resolve every related UUID to its item", () => {
      const item = { RelationBelongsToUUID: "u1\nu2" };
      const related = resolveRelatedItems(item, "RelationBelongsToUUID", index);
      expect(related.map((r) => r.Title)).toEqual(["Parent", "Sibling"]);
    });

    it("should ignore UUIDs missing from the index", () => {
      const item = { RelationBelongsToUUID: "u1\nunknown" };
      const related = resolveRelatedItems(item, "RelationBelongsToUUID", index);
      expect(related.map((r) => r.Title)).toEqual(["Parent"]);
    });

    it("should return an empty array when the relation field is empty", () => {
      expect(resolveRelatedItems({}, "RelationBelongsToUUID", index)).toEqual(
        [],
      );
    });

    it("should return an empty array without an item or index", () => {
      expect(resolveRelatedItems(null, "RelationBelongsToUUID", index)).toEqual(
        [],
      );
      expect(
        resolveRelatedItems({ RelationBelongsToUUID: "u1" }, "x", null),
      ).toEqual([]);
    });
  });
});
