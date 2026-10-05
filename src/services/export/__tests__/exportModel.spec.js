import { describe, it, expect } from "vitest";
import {
  buildExportModel,
  catalogueRows,
  exportFileName,
  fillPattern,
  formatValue,
} from "@/services/export/exportModel";
import { normalizeTemplate } from "@/services/export/exportTemplates";
import { toMarkdown } from "@/services/export/markdownExport";

const items = [
  {
    IdentifierUUID: "C1",
    Type: "Context",
    Identifier: "10",
    Title: "Floor",
    DateEarliest: "2024-07-23T08:00:00Z",
    RelationIncludesUUID: "A2",
    CoverageSerialized: "0x1p+0",
    RightsSidelined: "0",
    Trench: "T1",
  },
  {
    IdentifierUUID: "A2",
    Type: "Artifact",
    Identifier: "2",
    Title: "Coin | bronze",
    Description: "line 1\nline 2",
    RightsLocked: "1",
  },
  { IdentifierUUID: "A1", Type: "Artifact", Identifier: "11", Title: "" },
];

const context = {
  project: "Amarynthos",
  trenchNames: ["T1", "T2"],
  lang: "en",
  fieldLabels: { Title: "Titre" },
  typeLabels: { Context: "Contexte", Artifact: "Objet" },
  typePluralLabels: { Context: "Contextes", Artifact: "Objets" },
  typeOrder: ["Artifact", "Context"],
  tableFields: ["Identifier", "Title"],
  itemsByUuid: new Map(items.map((item) => [item.IdentifierUUID, item])),
  date: new Date("2026-10-02T12:00:00Z"),
};

describe("formatValue", () => {
  it("should format dates, booleans, types and links", () => {
    expect(formatValue("DateEarliest", items[0], context)).toBe("23/07/2024");
    expect(formatValue("RightsLocked", items[1], context)).toBe("✓");
    expect(formatValue("Type", items[0], context)).toBe("Contexte");
    expect(formatValue("RelationIncludesUUID", items[0], context)).toBe(
      "Objet 2",
    );
    expect(formatValue("Missing", items[0], context)).toBe("");
  });
});

describe("fillPattern", () => {
  it("should replace tokens and trim dangling separators", () => {
    const values = { Identifier: "11", Title: "" };
    expect(fillPattern("{Identifier} - {Title}", (k) => values[k])).toBe("11");
    expect(fillPattern("{Unknown} | x", () => undefined)).toBe("x");
  });

  it("should drop bold markers left empty by a missing value", () => {
    expect(
      fillPattern(
        "**{Source}** {Identifier}",
        (k) => ({ Identifier: "11" })[k],
      ),
    ).toBe("11");
  });
});

describe("buildExportModel", () => {
  it("should group by type in preferences order and sort items naturally", () => {
    const model = buildExportModel(
      items,
      normalizeTemplate({ fieldsMode: "table" }),
      context,
    );

    expect(model.title).toBe("Amarynthos - T1, T2");
    expect(model.groups.map((g) => g.label)).toEqual(["Objets", "Contextes"]);
    expect(model.groups[0].items.map((i) => i.values[0])).toEqual(["2", "11"]);
    expect(model.groups[0].columns).toEqual([
      { field: "Identifier", label: "Identifier" },
      { field: "Title", label: "Titre" },
    ]);
  });

  it("should export every filled field except technical ones in 'all' mode", () => {
    const model = buildExportModel(
      items,
      normalizeTemplate({ fieldsMode: "all" }),
      context,
    );
    const contextFields = model.groups[1].columns.map((c) => c.field);

    expect(contextFields).toContain("RelationIncludesUUID");
    expect(contextFields).not.toContain("IdentifierUUID");
    expect(contextFields).not.toContain("CoverageSerialized");
    expect(contextFields).not.toContain("Trench");
    expect(contextFields).not.toContain("RightsSidelined");
    expect(model.groups[0].items[1].heading).toBe("11");
  });

  it("should split the item title into bold and plain runs", () => {
    const model = buildExportModel(
      items,
      normalizeTemplate({ itemTitle: "**{Type} {Identifier}**. {Title}" }),
      context,
    );
    const item = model.groups[0].items[0];

    expect(item.heading).toBe("Objet 2. Coin | bronze");
    expect(item.headingRuns).toEqual([
      { text: "Objet 2", bold: true },
      { text: ". Coin | bronze", bold: false },
    ]);
  });

  it("should use the custom field list in its order", () => {
    const model = buildExportModel(
      items,
      normalizeTemplate({ fieldsMode: "custom", fields: ["Title", "Type"] }),
      context,
    );
    expect(model.groups[0].columns.map((c) => c.field)).toEqual([
      "Title",
      "Type",
    ]);
  });
});

describe("catalogueRows and exportFileName", () => {
  it("should drop empty values when asked and build a safe file name", () => {
    const model = buildExportModel(
      items,
      normalizeTemplate({ fieldsMode: "custom", fields: ["Title", "Type"] }),
      { ...context, project: "A/B" },
    );
    const group = model.groups[0];
    expect(catalogueRows(group, group.items[1], true)).toEqual([
      { label: "Type", value: "Objet" },
    ]);
    expect(exportFileName(model, "docx")).toBe("A-B - T1, T2.docx");
  });
});

describe("toMarkdown", () => {
  it("should write one entry per item with the bold parts of its title", () => {
    const md = toMarkdown(
      buildExportModel(
        items,
        normalizeTemplate({ fieldsMode: "custom", fields: ["Description"] }),
        context,
      ),
    );
    expect(md).toContain("# Amarynthos - T1, T2");
    expect(md).toContain("## Objets (2)");
    expect(md).toContain("### **2** - Coin \\| bronze");
    expect(md).toContain("- **Description** : line 1<br>line 2");
  });

  it("should keep a plain item title when it has no bold markers", () => {
    const md = toMarkdown(
      buildExportModel(
        items,
        normalizeTemplate({ itemTitle: "{Identifier} - {Title}" }),
        context,
      ),
    );
    expect(md).toContain("### 2 - Coin \\| bronze");
  });
});
