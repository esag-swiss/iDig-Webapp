import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_TEMPLATES,
  loadTemplates,
  saveTemplates,
  parseTemplatesFile,
} from "@/services/export/exportTemplates";

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
