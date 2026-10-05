import { catalogueRows } from "@/services/export/exportModel";

const ACCENT = "26A69A";
const FONT = "Calibri";
const FONT_SIZE = 20;

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
    width: options.width,
  });
}

function catalogueEntry(docx, group, item, skipEmpty) {
  const rows = catalogueRows(group, item, skipEmpty).map(
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
      keepNext: true,
      children: item.headingRuns.map(
        ({ text, bold }) => new docx.TextRun({ text, bold, color: ACCENT }),
      ),
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

async function toDocx(model) {
  const docx = await import("docx");

  const children = [
    new docx.Paragraph({
      heading: docx.HeadingLevel.TITLE,
      children: [new docx.TextRun({ text: model.title, color: ACCENT })],
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

  model.groups.forEach((group) => {
    children.push(
      new docx.Paragraph({
        heading: docx.HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 120 },
        keepNext: true,
        children: [
          new docx.TextRun({
            text: `${group.label} (${group.items.length})`,
            color: ACCENT,
          }),
        ],
      }),
      ...group.items.flatMap((item) =>
        catalogueEntry(docx, group, item, model.skipEmpty),
      ),
    );
  });

  const document = new docx.Document({
    creator: "iDig webapp",
    title: model.title,
    styles: {
      default: {
        document: { run: { font: FONT, size: FONT_SIZE } },
        heading2: { run: { bold: false } },
      },
    },
    sections: [
      {
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

export { toDocx };
