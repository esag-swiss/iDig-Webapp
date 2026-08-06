import dayjs from "dayjs";
import { resolveFieldDefinition } from "@/services/fieldDefinition";

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fieldLabel(field, group, options) {
  return (
    field.labels?.[options.lang] ||
    options.projectPreferencesFieldsWithTranslation?.[field.field] ||
    options.fieldsSchema?.[field.field]?.labels?.[options.lang] ||
    field.field
  );
}

function itemTypeLabel(item, typeTranslations) {
  if (!item) {
    return "Unknown";
  }

  return (
    typeTranslations[item.Subtype] ||
    typeTranslations[item.Type] ||
    item.Type ||
    ""
  );
}

function relationRows(fieldName, options) {
  const raw = options.selectedItem[fieldName];
  if (!raw) {
    return [];
  }

  const uuids = String(raw)
    .split("\n")
    .map((uuid) => uuid.trim())
    .filter(Boolean);
  const trenchItems =
    options.checkedTrenchesData?.[options.selectedItem.Trench] || [];

  return uuids.map((uuid) => {
    const item = trenchItems.find((candidate) =>
      candidate.IdentifierUUID.includes(uuid),
    );

    return {
      type: item
        ? itemTypeLabel(item, options.projectPreferencesTypesTranslation)
        : "Unknown",
      identifier: item?.Identifier || "",
      title: item?.Title || "",
    };
  });
}

function scalarValue(fieldName, group, options) {
  const value = options.selectedItem[fieldName];
  if (value === undefined || value === null || value === "") {
    return "";
  }

  if (fieldName === "Type") {
    return (
      options.projectPreferencesTypesTranslation[
        options.selectedItem.Subtype
      ] ||
      options.projectPreferencesTypesTranslation[value] ||
      value
    );
  }

  if (fieldName === "CoverageSerialized") {
    return "geodata";
  }

  if (options.fieldsSchema[fieldName]?.type === "boolean") {
    return String(value) === "1" ? "Yes" : "No";
  }

  if (options.fieldsSchema[fieldName]?.type === "DateUTC") {
    return dayjs(value).format("DD/MM/YYYY");
  }

  const definition = resolveFieldDefinition({
    field: fieldName,
    groupObject: group,
    item: options.selectedItem,
    projectPreferencesTypes: options.projectPreferencesTypes,
    projectPreferencesFields: options.projectPreferencesFields,
    fieldsSchema: options.fieldsSchema,
  });

  if (
    options.fieldsSchema[fieldName]?.type === "link" ||
    Object.hasOwn(definition, "link")
  ) {
    return relationRows(fieldName, options)
      .sort((a, b) =>
        String(a.identifier).localeCompare(String(b.identifier), undefined, {
          numeric: true,
          sensitivity: "base",
        }),
      )
      .map((row) =>
        [row.type, row.identifier, row.title].filter(Boolean).join(" | "),
      )
      .join("\n");
  }

  return String(value);
}

export function generateItemPrintHtml(options) {
  const sections = options.groups
    .map((group) => {
      const rows = group.fields
        .filter(
          (field) =>
            options.fieldsOfCurrentItem.includes(field.field) &&
            field.field !== "Subtype",
        )
        .map((field) => {
          const label = escapeHtml(fieldLabel(field, group, options));
          const value = escapeHtml(
            scalarValue(field.field, group, options),
          ).replace(/\n/g, "<br>");

          return `<tr><th style="width: 15%;">${label}</th><td>${value}</td></tr>`;
        })
        .join("");

      if (!rows) {
        return "";
      }

      const groupLabel = escapeHtml(
        group.labels ? group.labels[options.lang] : group.group,
      );

      return `
        <section>
          <h2>${groupLabel}</h2>
          <table>
            <tbody>${rows}</tbody>
          </table>
        </section>
      `;
    })
    .join("");

  const type =
    options.projectPreferencesTypesTranslation[
      options.selectedItem.Subtype
    ] ||
    options.projectPreferencesTypesTranslation[options.selectedItem.Type] ||
    options.selectedItem.Type ||
    "";
  const title =
    `${options.project} ${type} ${options.selectedItem.Identifier || ""}`.trim();
  const escapedTitle = escapeHtml(title);

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapedTitle}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #000;
            background: #fff;
            margin: 40px;
            font-size: 12px;
            line-height: 1.4;
          }
          h1 {
            font-size: 22px;
            margin: 0 0 12px 0;
          }
          h2 {
            font-size: 14px;
            margin: 18px 0 8px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
          }
          th,
          td {
            border: 1px solid #333;
            padding: 6px;
            text-align: left;
            vertical-align: top;
          }
          th {
            width: 30%;
            background: #f2f2f2;
          }
          @media print {
            body {
              margin: 40px;
            }
          }
        </style>
      </head>
      <body>
        <h1>${escapedTitle}</h1>
        ${sections}
      </body>
    </html>
  `;
}

export function printItemSheet(options, documentRef = document) {
  const iframe = documentRef.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  documentRef.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDocument = frameWindow?.document;
  if (!frameWindow || !frameDocument) {
    documentRef.body.removeChild(iframe);
    return;
  }

  frameDocument.open();
  frameDocument.write(generateItemPrintHtml(options));
  frameDocument.close();

  const runPrint = () => {
    frameWindow.focus();
    frameWindow.print();
    setTimeout(() => {
      if (documentRef.body.contains(iframe)) {
        documentRef.body.removeChild(iframe);
      }
    }, 300);
  };

  if (frameDocument.readyState === "complete") {
    runPrint();
  } else {
    iframe.onload = runPrint;
  }
}
