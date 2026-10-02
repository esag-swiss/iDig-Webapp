const STORAGE_KEY = "exportTemplates";

export const DEFAULT_DOCX_OPTIONS = {
  orientation: "portrait", // portrait | landscape
  font: "Calibri",
  fontSize: 10, // pt
  accentColor: "#26A69A",
  pageBreak: "none", // none | group | item
};

const BASE_TEMPLATE = {
  name: "",
  layout: "listing", // catalogue: one sheet per item | listing: one table per type
  title: "{project} – {trenches}",
  itemTitle: "{Identifier} – {Title}",
  fieldsMode: "table", // table: visible table columns | all: every filled field | custom
  fields: [],
  sortBy: "Identifier",
  skipEmpty: true,
  docx: DEFAULT_DOCX_OPTIONS,
};

export const DEFAULT_TEMPLATES = [
  {
    ...BASE_TEMPLATE,
    id: "catalogue",
    name: "Catalogue",
    layout: "catalogue",
    fieldsMode: "all",
  },
  {
    ...BASE_TEMPLATE,
    id: "listing",
    name: "Listing",
    layout: "listing",
    docx: { ...DEFAULT_DOCX_OPTIONS, orientation: "landscape" },
  },
];

// Fills the keys missing from a stored or imported template with defaults, so
// templates saved by an older version keep working.
export function normalizeTemplate(template) {
  return {
    ...BASE_TEMPLATE,
    ...template,
    id: template.id || newTemplateId(),
    fields: Array.isArray(template.fields) ? template.fields : [],
    docx: { ...DEFAULT_DOCX_OPTIONS, ...template.docx },
  };
}

export function newTemplateId() {
  return `template-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function loadTemplates() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored) && stored.length > 0) {
      return stored.map(normalizeTemplate);
    }
  } catch {
    // Corrupted value: fall back to the defaults below.
  }
  return DEFAULT_TEMPLATES.map(normalizeTemplate);
}

export function saveTemplates(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

// Templates are shared between users as a JSON file.
export function parseTemplatesFile(text) {
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : [parsed];
  if (!list.every((t) => t && typeof t === "object" && t.layout)) {
    throw new Error("Invalid export templates file");
  }
  // New ids so importing never overwrites an existing template.
  return list.map((t) => normalizeTemplate({ ...t, id: newTemplateId() }));
}
