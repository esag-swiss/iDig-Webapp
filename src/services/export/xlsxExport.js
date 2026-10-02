const MAX_SHEET_NAME = 31;

function sheetName(label, usedNames) {
  const base =
    String(label || "Items")
      .replace(/[[\]:*?/\\]/g, " ")
      .trim()
      .slice(0, MAX_SHEET_NAME) || "Items";
  let name = base;
  for (let i = 2; usedNames.has(name.toLowerCase()); i++) {
    const suffix = ` (${i})`;
    name = base.slice(0, MAX_SHEET_NAME - suffix.length) + suffix;
  }
  usedNames.add(name.toLowerCase());
  return name;
}

const HEADER_COLOR = "FF26A69A";

async function toXlsx(model) {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "iDig webapp";
  workbook.title = model.title;
  workbook.created = new Date();

  const usedNames = new Set();
  model.groups.forEach((group) => {
    const sheet = workbook.addWorksheet(sheetName(group.label, usedNames), {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    sheet.columns = group.columns.map((column, index) => {
      const longest = Math.max(
        column.label.length,
        ...group.items.map((item) =>
          Math.max(
            ...String(item.values[index])
              .split("\n")
              .map((line) => line.length),
          ),
        ),
      );
      return {
        header: column.label,
        key: column.field,
        width: Math.min(Math.max(longest + 2, 8), 60),
      };
    });
    group.items.forEach((item) => sheet.addRow(item.values));

    const header = sheet.getRow(1);
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_COLOR },
    };
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.alignment = { vertical: "top", wrapText: true };
      }
    });
    if (group.columns.length > 0) {
      sheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: group.columns.length },
      };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export { sheetName, toXlsx };
