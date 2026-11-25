import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_TEMPLATES,
  loadTemplates,
  normalizeTemplate,
  saveTemplates,
  parseTemplatesFile,
} from "@/services/export/exportTemplates";
import { EXAMPLE_COMPOSITION } from "@/services/export/composedText";

describe("export templates storage", () => {
  beforeEach(() => localStorage.clear());

  it("falls back to the default templates", () => {
    expect(loadTemplates().map((t) => t.id)).toEqual(
      DEFAULT_TEMPLATES.map((t) => t.id),
    );
    localStorage.setItem("exportTemplates", "{not json");
    expect(loadTemplates()).toHaveLength(DEFAULT_TEMPLATES.length);
  });

  it("round-trips saved templates and fills missing options", () => {
    saveTemplates([{ id: "x", name: "Mine", layout: "catalogue", docx: {} }]);
    const [template] = loadTemplates();
    expect(template.name).toBe("Mine");
    expect(template.docx.font).toBe("Calibri");
    expect(template.fields).toEqual([]);
  });
});

describe("parseTemplatesFile", () => {
  it("imports templates under new ids", () => {
    const [template] = parseTemplatesFile(
      JSON.stringify({ id: "catalogue", name: "Shared", layout: "listing" }),
    );
    expect(template.name).toBe("Shared");
    expect(template.id).not.toBe("catalogue");
  });

  it("rejects files that are not templates", () => {
    expect(() => parseTemplatesFile("[1, 2]")).toThrow();
    expect(() => parseTemplatesFile("nope")).toThrow();
  });
});

describe("DEFAULT_TEMPLATES", () => {
  it("should offer a composed text template filled with the example", () => {
    const composed = DEFAULT_TEMPLATES.find((t) => t.layout === "modular");
    expect(composed.composition).toEqual(EXAMPLE_COMPOSITION);
  });
});

describe("normalizeTemplate", () => {
  describe("when importing a composition written by hand", () => {
    const template = normalizeTemplate({
      layout: "modular",
      template: ["{Identifier}"],
    });

    it("should read the parts list as the composition", () => {
      expect(template.composition).toEqual(["{Identifier}"]);
    });

    it("should drop the hand written key", () => {
      expect(template).not.toHaveProperty("template");
    });
  });
});
