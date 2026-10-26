import { catalogueRows } from "@/services/export/exportModel";
import { DEFAULT_DOCX_OPTIONS } from "@/services/export/exportTemplates";

function hex(color) {
  return String(color || DEFAULT_DOCX_OPTIONS.accentColor)
    .replace("#", "")
    .toUpperCase();
}

// Multi-line values (descriptions, relations) keep their line breaks.
function textRuns(docx, text, options = {}) {
  return String(text)
    .split("\n")
    .map(
      (line, index) =>
        new docx.TextRun({ text: line, break: index > 0 ? 1 : 0, ...options }),
    );
}

function cell(docx, text, options = {}) {
  return new docx.TableCell({
    children: [
      new docx.Paragraph({ children: textRuns(docx, text, options.run) }),
    ],
    shading: options.shading,
    width: options.width,
  });
}

function listingTable(docx, group, accent) {
  const header = new docx.TableRow({
    tableHeader: true,
    children: group.columns.map((column) =>
      cell(docx, column.label, {
        run: { bold: true, color: "FFFFFF" },
        shading: { type: docx.ShadingType.CLEAR, fill: accent, color: "auto" },
      }),
    ),
  });
  const rows = group.items.map(
    (item) =>
      new docx.TableRow({
        cantSplit: true,
        children: item.values.map((value) => cell(docx, value)),
      }),
  );
  return new docx.Table({
    width: { size: 100, type: docx.WidthType.PERCENTAGE },
    rows: [header, ...rows],
  });
}

function catalogueEntry(docx, group, item, options) {
  const rows = catalogueRows(group, item, options.skipEmpty).map(
    ({ label, value }) =>
      new docx.TableRow({
        cantSplit: true,
        children: [
          cell(docx, label, {
            run: { bold: true },
            width: { size: 30, type: docx.WidthType.PERCENTAGE },
          }),
          cell(docx, value, {
            width: { size: 70, type: docx.WidthType.PERCENTAGE },
          }),
        ],
      }),
  );
  const children = [
    new docx.Paragraph({
      heading: docx.HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 80 },
      pageBreakBefore: options.pageBreakBefore,
      keepNext: true,
      children: [
        new docx.TextRun({ text: item.heading, color: options.accent }),
      ],
    }),
  ];
  if (rows.length > 0) {
    children.push(
      new docx.Table({
        width: { size: 100, type: docx.WidthType.PERCENTAGE },
        rows,
      }),
    );
  }
  return children;
}

export async function toDocx(model, template) {
  const docx = await import("docx");
  const format = { ...DEFAULT_DOCX_OPTIONS, ...template.docx };
  const accent = hex(format.accentColor);
  const halfPoints = Math.round(Number(format.fontSize || 10) * 2);

  const children = [
    new docx.Paragraph({
      heading: docx.HeadingLevel.TITLE,
      children: [new docx.TextRun({ text: model.title, color: accent })],
    }),
    new docx.Paragraph({
      children: [
        new docx.TextRun({
          text: `${model.date} · ${model.count} items`,
          italics: true,
        }),
      ],
    }),
  ];

  model.groups.forEach((group, groupIndex) => {
    children.push(
      new docx.Paragraph({
        heading: docx.HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 120 },
        pageBreakBefore:
          groupIndex > 0 && ["group", "item"].includes(format.pageBreak),
        keepNext: true,
        children: [
          new docx.TextRun({
            text: `${group.label} (${group.items.length})`,
            color: accent,
          }),
        ],
      }),
    );

    if (model.layout === "catalogue") {
      group.items.forEach((item, itemIndex) => {
        children.push(
          ...catalogueEntry(docx, group, item, {
            accent,
            skipEmpty: model.skipEmpty,
            pageBreakBefore: format.pageBreak === "item" && itemIndex > 0,
          }),
        );
      });
    } else {
      children.push(listingTable(docx, group, accent));
    }
  });

  const document = new docx.Document({
    creator: "iDig webapp",
    title: model.title,
    styles: {
      default: {
        document: { run: { font: format.font, size: halfPoints } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation:
                format.orientation === "landscape"
                  ? docx.PageOrientation.LANDSCAPE
                  : docx.PageOrientation.PORTRAIT,
            },
          },
        },
        footers: {
          default: new docx.Footer({
            children: [
              new docx.Paragraph({
                alignment: docx.AlignmentType.RIGHT,
                children: [
                  new docx.TextRun({ text: `${model.title} · ` }),
                  new docx.TextRun({
                    children: [
                      docx.PageNumber.CURRENT,
                      " / ",
                      docx.PageNumber.TOTAL_PAGES,
                    ],
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return docx.Packer.toBlob(document);
}
