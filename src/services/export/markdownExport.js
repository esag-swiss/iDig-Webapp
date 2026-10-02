import { catalogueRows } from "@/services/export/exportModel";

function escapeInline(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/([*_`#[\]|])/g, "\\$1")
    .replace(/\r?\n/g, "<br>");
}

function headingText(item) {
  return item.headingRuns
    .map(({ text, bold }) =>
      bold ? `**${escapeInline(text)}**` : escapeInline(text),
    )
    .join("");
}

function catalogueEntries(group, skipEmpty) {
  return group.items
    .map((item) => {
      const rows = catalogueRows(group, item, skipEmpty).map(
        ({ label, value }) =>
          `- **${escapeInline(label)}** : ${escapeInline(value)}`,
      );
      return [`### ${headingText(item)}`, "", ...rows].join("\n");
    })
    .join("\n\n");
}

function toMarkdown(model) {
  const sections = model.groups.map((group) => {
    const body = catalogueEntries(group, model.skipEmpty);
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

export { toMarkdown };
