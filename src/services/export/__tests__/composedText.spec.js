import { describe, it, expect } from "vitest";
import {
  EXAMPLE_COMPOSITION,
  composeText,
  isValidComposition,
} from "@/services/export/composedText";

function valuesOf(values) {
  return (field) => values[field] ?? "";
}

const catalogueComposition = [
  "{Trench}, FK{Identifier}, {InventoryNumber}",
  { separator: ". " },
  { fields: ["Title", "Description"], separator: ". " },
  { separator: ". " },
  { field: "AnalysisClay", fallback: "Provenance", prefix: "Pâte : " },
  { separator: ". " },
  { field: "Microresidues", prefix: "Microrésidus : " },
  { separator: "." },
];

describe("composedText", () => {
  describe("composeText", () => {
    it("should compose a full catalogue entry", () => {
      const text = composeText({
        composition: catalogueComposition,
        valueOf: valuesOf({
          Trench: "K",
          Identifier: "12",
          InventoryNumber: "INV 4",
          Title: "Coupe",
          Description: "Lèvre arrondie",
          AnalysisClay: "Locale",
          Microresidues: "Vin",
        }),
      });
      expect(text).toBe(
        "K, FK12, INV 4. Coupe. Lèvre arrondie. Pâte : Locale. Microrésidus : Vin.",
      );
    });

    it("should trim the separators of an empty token in a text part", () => {
      const text = composeText({
        composition: ["{Trench}, FK{Identifier}, {InventoryNumber}"],
        valueOf: valuesOf({ Trench: "K", Identifier: "12" }),
      });
      expect(text).toBe("K, FK12");
    });

    it("should skip an empty field with its prefix and separator", () => {
      const text = composeText({
        composition: catalogueComposition,
        valueOf: valuesOf({ Trench: "K", Identifier: "12", Title: "Coupe" }),
      });
      expect(text).toBe("K, FK12. Coupe.");
    });

    it("should use the fallback field when the field is empty", () => {
      const text = composeText({
        composition: [{ field: "AnalysisClay", fallback: "Provenance" }],
        valueOf: valuesOf({ Provenance: "Attique" }),
      });
      expect(text).toBe("Attique");
    });

    it("should apply the format of a field", () => {
      const text = composeText({
        composition: [{ field: "Source", format: "({value})" }],
        valueOf: valuesOf({ Source: "Secteur 3" }),
      });
      expect(text).toBe("(Secteur 3)");
    });

    it("should not double the punctuation already ending a value", () => {
      const text = composeText({
        composition: ["{Title}", { separator: ". " }, "{Description}"],
        valueOf: valuesOf({ Title: "Local (K ?).", Description: "Fin" }),
      });
      expect(text).toBe("Local (K ?). Fin");
    });

    it("should keep the final separator of the composition", () => {
      const text = composeText({
        composition: EXAMPLE_COMPOSITION,
        valueOf: valuesOf({ Identifier: "3", Title: "Lampe" }),
      });
      expect(text).toBe("3. Lampe.");
    });

    it("should return an empty text when every field is empty", () => {
      const text = composeText({
        composition: catalogueComposition,
        valueOf: valuesOf({}),
      });
      expect(text).toBe("");
    });
  });

  describe("isValidComposition", () => {
    it("should accept texts, fields, field groups and separators", () => {
      expect(isValidComposition(catalogueComposition)).toBe(true);
    });

    it("should reject a value that is not a list", () => {
      expect(isValidComposition({ separator: "." })).toBe(false);
    });

    it("should reject a part without field nor separator", () => {
      expect(isValidComposition([{ prefix: "Pâte : " }])).toBe(false);
    });
  });
});
