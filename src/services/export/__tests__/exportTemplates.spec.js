import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_TEMPLATE,
  isDefaultTemplate,
  loadTemplates,
  saveTemplates,
  parseTemplatesFile,
  loadSelectedTemplateId,
  saveSelectedTemplateId,
} from "@/services/export/exportTemplates";

describe("export templates storage", () => {
  beforeEach(() => localStorage.clear());

  it("should fall back to the default template", () => {
    expect(loadTemplates().map((t) => t.id)).toEqual([DEFAULT_TEMPLATE.id]);
    localStorage.setItem("exportTemplates", "{not json");
    expect(loadTemplates().map((t) => t.id)).toEqual([DEFAULT_TEMPLATE.id]);
  });

  it("should always keep the default template first when it is missing", () => {
    saveTemplates([{ id: "x", name: "Mine" }]);
    expect(loadTemplates().map((t) => t.id)).toEqual([
      DEFAULT_TEMPLATE.id,
      "x",
    ]);
  });

  it("should migrate the former Catalogue template to the default one", () => {
    saveTemplates([{ id: "catalogue", name: "Catalogue", sortBy: "Title" }]);
    const templates = loadTemplates();
    expect(templates).toHaveLength(1);
    expect(isDefaultTemplate(templates[0])).toBe(true);
    expect(templates[0].sortBy).toBe("Title");
  });

  it("should round-trip saved templates and fill missing options", () => {
    saveTemplates([{ id: "x", name: "Mine" }]);
    const [, template] = loadTemplates();
    expect(template.name).toBe("Mine");
    expect(template.itemTitle).toBe("**{Identifier}** - {Title}");
    expect(template.fields).toEqual([]);
  });

  it("should drop the layout and Word options of older templates", () => {
    saveTemplates([
      { id: "x", name: "Old", layout: "listing", docx: { font: "Georgia" } },
    ]);
    const [, template] = loadTemplates();
    expect(template).not.toHaveProperty("layout");
    expect(template).not.toHaveProperty("docx");
  });
});

describe("selected template id storage", () => {
  beforeEach(() => localStorage.clear());

  const templates = [{ id: "a" }, { id: "b" }];

  it("should return the first template when nothing is stored", () => {
    expect(loadSelectedTemplateId(templates)).toBe("a");
  });

  it("should return the stored id when it matches an existing template", () => {
    saveSelectedTemplateId("b");
    expect(loadSelectedTemplateId(templates)).toBe("b");
  });

  it("should fall back to the first template when the stored id no longer exists", () => {
    saveSelectedTemplateId("deleted");
    expect(loadSelectedTemplateId(templates)).toBe("a");
  });
});

describe("parseTemplatesFile", () => {
  it("should import templates under new ids", () => {
    const [template] = parseTemplatesFile(
      JSON.stringify({ id: "shared", name: "Shared", layout: "listing" }),
    );
    expect(template.name).toBe("Shared");
    expect(template.id).not.toBe("shared");
  });

  it("should not import the default template again", () => {
    const imported = parseTemplatesFile(
      JSON.stringify([
        { id: "default", name: "" },
        { id: "catalogue", name: "Catalogue" },
        { id: "mine", name: "Mine" },
      ]),
    );
    expect(imported.map((t) => t.name)).toEqual(["Mine"]);
  });

  it("should reject files that are not templates", () => {
    expect(() => parseTemplatesFile("[1, 2]")).toThrow();
    expect(() => parseTemplatesFile("nope")).toThrow();
  });
});
