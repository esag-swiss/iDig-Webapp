import { catalogueRows } from "@/services/export/exportModel";

function escapeInline(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/([*_`#[\]|])/g, "\\$1")
    .replace(/\r?\n/g, "<br>");
}

function listingTable(group) {
  const header = group.columns.map((column) => escapeInline(column.label));
  const lines = [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...group.items.map(
      (item) => `| ${item.values.map(escapeInline).join(" | ")} |`,
    ),
  ];
  return lines.join("\n");
}

function catalogueEntries(group, skipEmpty) {
  return group.items
    .map((item) => {
      const rows = catalogueRows(group, item, skipEmpty).map(
        ({ label, value }) =>
          `- **${escapeInline(label)}** : ${escapeInline(value)}`,
      );
      return [`### ${escapeInline(item.heading)}`, "", ...rows].join("\n");
    })
    .join("\n\n");
}

export function toMarkdown(model) {
  const sections = model.groups.map((group) => {
    const body =
      model.layout === "catalogue"
        ? catalogueEntries(group, model.skipEmpty)
        : listingTable(group);
    return `## ${escapeInline(group.label)} (${group.items.length})\n\n${body}`;
  });

  return [
    `# ${escapeInline(model.title)}`,
    `_${model.date} · ${model.count} items_`,
    ...sections,
  ]
    .join("\n\n")
    .concat("\n");
}
