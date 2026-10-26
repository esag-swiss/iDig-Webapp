// @vitest-environment node
import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { normalizeTemplate } from "@/services/export/exportTemplates";
import { sheetName, toXlsx } from "@/services/export/xlsxExport";
import { toDocx } from "@/services/export/docxExport";

const model = {
  title: "Amarynthos – T1",
  date: "02/10/2026",
  count: 3,
  layout: "catalogue",
  skipEmpty: true,
  groups: [
    {
      key: "Artifact",
      label: "Objets: inventaire [2026]",
      columns: [
        { field: "Identifier", label: "Identifier" },
        { field: "Description", label: "Description" },
      ],
      items: [
        { heading: "FK1", values: ["FK1", "line 1\nline 2"] },
        { heading: "FK2", values: ["FK2", ""] },
      ],
    },
    {
      key: "Context",
      label: "Contextes",
      columns: [{ field: "Identifier", label: "Identifier" }],
      items: [{ heading: "10", values: ["10"] }],
    },
  ],
};

describe("sheetName", () => {
  it("removes forbidden characters, truncates and deduplicates", () => {
    const used = new Set();
    expect(sheetName("A/B: [C]", used)).toBe("A B   C");
    expect(sheetName("x".repeat(40), used)).toHaveLength(31);
    expect(sheetName("x".repeat(40), used)).toBe("x".repeat(27) + " (2)");
  });
});

describe("toXlsx", () => {
  it("writes one sheet per type with a header row", async () => {
    const blob = await toXlsx(model, normalizeTemplate({ layout: "listing" }));
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await blob.arrayBuffer());

    expect(workbook.worksheets.map((s) => s.name)).toEqual([
      "Objets  inventaire  2026",
      "Contextes",
    ]);
    const sheet = workbook.worksheets[0];
    expect(sheet.getRow(1).values.slice(1)).toEqual([
      "Identifier",
      "Description",
    ]);
    expect(sheet.getRow(2).values.slice(1)).toEqual(["FK1", "line 1\nline 2"]);
    expect(sheet.rowCount).toBe(3);
  });
});

describe("toDocx", () => {
  it("writes a Word document with the configured formatting", async () => {
    const template = normalizeTemplate({
      layout: "catalogue",
      docx: { orientation: "landscape", font: "Georgia", pageBreak: "item" },
    });
    const blob = await toDocx(model, template);
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const documentXml = await zip.file("word/document.xml").async("string");
    const stylesXml = await zip.file("word/styles.xml").async("string");

    expect(documentXml).toContain("Amarynthos – T1");
    expect(documentXml).toContain("FK2");
    expect(documentXml).toContain('w:orient="landscape"');
    expect(documentXml).toContain("<w:pageBreakBefore/>");
    expect(stylesXml).toContain("Georgia");
  });
});
