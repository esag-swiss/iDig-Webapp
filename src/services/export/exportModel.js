import dayjs from "dayjs";
import { fieldsSchema } from "@/assets/nativeFields";

const TECHNICAL_FIELDS = new Set([
  "Trench",
  "IdentifierUUID",
  "RelationAttachments",
  "RelationURLs",
  "iDigFieldsRules",
  "DateTimeZone",
  "RightsTrashed",
  "RightsDeleted",
]);
const TECHNICAL_PREFIXES = ["Coverage", "Spatial", "Format"];

function isTechnicalField(field) {
  return (
    TECHNICAL_FIELDS.has(field) ||
    TECHNICAL_PREFIXES.some((prefix) => field.startsWith(prefix))
  );
}

function isEmpty(value) {
  return value === undefined || value === null || value === "";
}

function compareValues(a, b) {
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

function fieldLabel(field, context) {
  return (
    context.fieldLabels?.[field] ||
    fieldsSchema[field]?.labels?.[context.lang] ||
    field
  );
}

function typeLabel(item, context) {
  return (
    context.typeLabels?.[item.Subtype] ||
    context.typeLabels?.[item.Type] ||
    item.Type ||
    ""
  );
}

function formatValue(field, item, context) {
  const value = item[field];
  if (isEmpty(value)) {
    return "";
  }

  if (field === "Type" || field === "Subtype") {
    return context.typeLabels?.[value] ?? String(value);
  }

  const type = fieldsSchema[field]?.type;
  if (type === "boolean") {
    return String(value) === "1" ? "✓" : "";
  }
  if (type === "DateUTC") {
    const date = dayjs(value);
    return date.isValid() ? date.format("DD/MM/YYYY") : String(value);
  }
  if (type === "link") {
    return String(value)
      .split("\n")
      .filter(Boolean)
      .map((uuid) => {
        const linked = context.itemsByUuid?.get(uuid);
        return linked
          ? `${typeLabel(linked, context)} ${linked.Identifier ?? ""}`.trim()
          : uuid;
      })
      .join(", ");
  }

  return String(value);
}

function fillPattern(pattern, resolve) {
  return String(pattern ?? "")
    .replace(/\{(\w+)\}/g, (match, token) => resolve(token) ?? "")
    .replace(/\*\*\s*\*\*/g, "")
    .replace(/^[\s—:|,-]+|[\s—:|,-]+$/g, "");
}

function boldRuns(text) {
  return String(text)
    .split(/\*\*(.+?)\*\*/s)
    .map((part, index) => ({ text: part, bold: index % 2 === 1 }))
    .filter((run) => run.text !== "");
}

function columnFields(template, items, context) {
  if (template.fieldsMode === "custom") {
    return template.fields;
  }
  if (template.fieldsMode === "table") {
    return context.tableFields ?? [];
  }

  const filled = new Set();
  items.forEach((item) =>
    Object.keys(item).forEach((field) => {
      if (
        !isTechnicalField(field) &&
        formatValue(field, item, context) !== ""
      ) {
        filled.add(field);
      }
    }),
  );
  const known = Object.keys(fieldsSchema).filter((field) => filled.has(field));
  const others = [...filled]
    .filter((field) => !(field in fieldsSchema))
    .sort(compareValues);
  return [...known, ...others];
}

function buildExportModel(items, template, context) {
  const byType = new Map();
  items.forEach((item) => {
    const key = item.Type || "";
    if (!byType.has(key)) {
      byType.set(key, []);
    }
    byType.get(key).push(item);
  });

  const typeOrder = context.typeOrder ?? [];
  const rank = (key) =>
    typeOrder.includes(key) ? typeOrder.indexOf(key) : typeOrder.length;
  const groupKeys = [...byType.keys()].sort(
    (a, b) => rank(a) - rank(b) || compareValues(a, b),
  );

  const groups = groupKeys.map((key) => {
    const groupItems = [...byType.get(key)].sort((a, b) =>
      compareValues(a[template.sortBy], b[template.sortBy]),
    );
    const columns = columnFields(template, groupItems, context).map(
      (field) => ({ field, label: fieldLabel(field, context) }),
    );

    return {
      key,
      label:
        context.typePluralLabels?.[key] || context.typeLabels?.[key] || key,
      columns,
      items: groupItems.map((item) => {
        const heading =
          fillPattern(template.itemTitle, (field) =>
            formatValue(field, item, context),
          ) ||
          item.Identifier ||
          "";
        const headingRuns = boldRuns(heading);
        return {
          heading: headingRuns.map((run) => run.text).join(""),
          headingRuns,
          values: columns.map(({ field }) => formatValue(field, item, context)),
        };
      }),
    };
  });

  const date = context.date ?? new Date();
  const titleTokens = {
    project: context.project,
    trenches: (context.trenchNames ?? []).join(", "),
    date: dayjs(date).format("DD/MM/YYYY"),
    count: String(items.length),
  };
  const title = fillPattern(template.title, (token) => titleTokens[token]);

  return {
    title,
    date: dayjs(date).format("DD/MM/YYYY"),
    count: items.length,
    skipEmpty: template.skipEmpty,
    groups,
  };
}

function catalogueRows(group, item, skipEmpty) {
  return group.columns
    .map((column, index) => ({
      label: column.label,
      value: item.values[index],
    }))
    .filter((row) => !skipEmpty || row.value !== "");
}

function exportFileName(model, extension) {
  const base = (model.title || "export")
    .replace(/[\\/:*?"<>|]+/g, "-")
    .trim()
    .slice(0, 120);
  return `${base}.${extension}`;
}

export {
  fieldLabel,
  formatValue,
  fillPattern,
  buildExportModel,
  catalogueRows,
  exportFileName,
};
