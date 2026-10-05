import { describe, it, expect } from "vitest";
import { normalize } from "@/services/helpers/textHelper";

describe("normalize", () => {
  it("should lowercase the text", () => {
    expect(normalize("Début DU Chantier")).toBe("debut du chantier");
  });

  it("should strip accents and diacritics", () => {
    expect(normalize("Éèêë àç ôœ")).toBe("eeee ac oœ");
    expect(normalize("Αρχειοθετημένο")).toBe("αρχειοθετημενο");
  });

  it("should accept non-string values", () => {
    expect(normalize(42)).toBe("42");
  });
});
