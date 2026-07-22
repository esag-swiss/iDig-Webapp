import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useDataStore } from "@/stores/data";

function makeStore() {
  const store = useDataStore();
  store.checkedTrenchesData = {
    T1: [
      { Type: "Context", IdentifierUUID: "c-use", Phase: "Use", Trench: "T1" },
      {
        Type: "Context",
        IdentifierUUID: "c-fill",
        Phase: "Fill",
        Trench: "T1",
      },
      {
        Type: "Context",
        IdentifierUUID: "c-accent",
        Phase: "Élevé",
        Trench: "T1",
      },
      {
        Type: "Artifact",
        Identifier: "A1",
        IdentifierUUID: "a1",
        RelationBelongsToUUID: "c-use",
        Trench: "T1",
      },
      {
        Type: "Artifact",
        Identifier: "A2",
        IdentifierUUID: "a2",
        RelationBelongsToUUID: "c-fill",
        Trench: "T1",
      },
      {
        Type: "Artifact",
        Identifier: "A3",
        IdentifierUUID: "a3",
        RelationBelongsToUUID: "c-accent",
        Trench: "T1",
      },
      {
        Type: "Artifact",
        Identifier: "A4",
        IdentifierUUID: "a4",
        RelationBelongsToUUID: "c-in-t2",
        Trench: "T1",
      },
    ],
    T2: [
      {
        Type: "Context",
        IdentifierUUID: "c-in-t2",
        Phase: "Use",
        Trench: "T2",
      },
    ],
  };
  return store;
}

describe("data store — relational filter engine", () => {
  beforeEach(() => setActivePinia(createPinia()));

  describe("uuidIndexByTrench", () => {
    it("should build one UUID index per trench", () => {
      const store = makeStore();
      expect(store.uuidIndexByTrench.T1.get("c-use").Phase).toBe("Use");
      expect(store.uuidIndexByTrench.T2.get("c-in-t2").Phase).toBe("Use");
      expect(store.uuidIndexByTrench.T1.has("c-in-t2")).toBe(false);
    });
  });

  describe("checkedTrenchesItemsRelationFiltered", () => {
    it("should return the searched list untouched when no filter is set", () => {
      const store = makeStore();
      expect(store.checkedTrenchesItemsRelationFiltered).toEqual(
        store.checkedTrenchesItemsSelectedTypeAndSearched,
      );
    });

    it("should keep only items whose related item matches the property", () => {
      const store = makeStore();
      store.setRelationFilter({
        relation: "RelationBelongsToUUID",
        property: "Phase",
        value: "use",
      });
      const identifiers = store.checkedTrenchesItemsRelationFiltered.map(
        (item) => item.Identifier,
      );
      expect(identifiers).toEqual(["A1"]);
    });

    it("should be accent-insensitive on the related property", () => {
      const store = makeStore();
      store.setRelationFilter({
        relation: "RelationBelongsToUUID",
        property: "Phase",
        value: "eleve",
      });
      const identifiers = store.checkedTrenchesItemsRelationFiltered.map(
        (item) => item.Identifier,
      );
      expect(identifiers).toEqual(["A3"]);
    });

    it("should not resolve relations across trenches", () => {
      const store = makeStore();
      store.setRelationFilter({
        relation: "RelationBelongsToUUID",
        property: "Phase",
        value: "use",
      });
      const identifiers = store.checkedTrenchesItemsRelationFiltered.map(
        (item) => item.Identifier,
      );
      expect(identifiers).not.toContain("A4");
    });

    it("should ignore a filter with an empty value", () => {
      const store = makeStore();
      store.setRelationFilter({
        relation: "RelationBelongsToUUID",
        property: "Phase",
        value: "   ",
      });
      expect(store.checkedTrenchesItemsRelationFiltered).toEqual(
        store.checkedTrenchesItemsSelectedTypeAndSearched,
      );
    });
  });
});
