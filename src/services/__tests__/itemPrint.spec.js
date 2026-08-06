import { describe, expect, it } from "vitest";
import { generateItemPrintHtml } from "@/services/itemPrint";

function printOptions(overrides = {}) {
  return {
    selectedItem: {
      Type: "Context",
      Identifier: "CTX-1",
      Title: "A <special> context",
      Related: "uuid-10\nuuid-2",
      Trench: "T1",
    },
    groups: [
      {
        group: "Identity",
        labels: { en: "Identity & description" },
        fields: [
          { field: "Type" },
          { field: "Title", labels: { en: "Title" } },
          { field: "Related", link: true },
        ],
      },
    ],
    fieldsOfCurrentItem: ["Type", "Identifier", "Title", "Related", "Trench"],
    lang: "en",
    project: "My Project",
    projectPreferencesTypes: [],
    projectPreferencesTypesTranslation: {
      Context: "Archaeological context",
      Find: "Find",
    },
    projectPreferencesFields: [],
    projectPreferencesFieldsWithTranslation: {
      Related: "Relations",
    },
    fieldsSchema: {
      Type: { type: "string" },
      Title: { type: "string" },
      Related: { type: "link" },
    },
    checkedTrenchesData: {
      T1: [
        {
          IdentifierUUID: "uuid-10",
          Type: "Find",
          Identifier: "F10",
          Title: "Later",
        },
        {
          IdentifierUUID: "uuid-2",
          Type: "Find",
          Identifier: "F2",
          Title: "Earlier",
        },
      ],
    },
    ...overrides,
  };
}

describe("generateItemPrintHtml", () => {
  it("generates the item title and escaped field content", () => {
    const html = generateItemPrintHtml(printOptions());

    expect(html).toContain(
      "<title>My Project Archaeological context CTX-1</title>",
    );
    expect(html).toContain("<h2>Identity &amp; description</h2>");
    expect(html).toContain("A &lt;special&gt; context");
  });

  it("sorts relation rows naturally by identifier", () => {
    const html = generateItemPrintHtml(printOptions());

    expect(html.indexOf("Find | F2 | Earlier")).toBeLessThan(
      html.indexOf("Find | F10 | Later"),
    );
  });
});
