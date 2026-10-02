const STORAGE_KEY = "exportTemplates";
const SELECTED_TEMPLATE_ID_KEY = "exportTemplateId";
const DEFAULT_TEMPLATE_ID = "default";
const LEGACY_DEFAULT_TEMPLATE_ID = "catalogue";

const BASE_TEMPLATE = {
  name: "",
  title: "{project} - {trenches}",
  itemTitle: "**{Identifier}** - {Title}",
  fieldsMode: "all",
  fields: [],
  sortBy: "Identifier",
  skipEmpty: true,
};

const DEFAULT_TEMPLATE = { ...BASE_TEMPLATE, id: DEFAULT_TEMPLATE_ID };

function isDefaultTemplate(template) {
  return template?.id === DEFAULT_TEMPLATE_ID;
}

function normalizeTemplate(template) {
  const rest = { ...template };
  delete rest.layout;
  delete rest.docx;
  const id =
    rest.id === LEGACY_DEFAULT_TEMPLATE_ID ? DEFAULT_TEMPLATE_ID : rest.id;
  return {
    ...BASE_TEMPLATE,
    ...rest,
    id: id || newTemplateId(),
    fields: Array.isArray(rest.fields) ? rest.fields : [],
  };
}

function newTemplateId() {
  return `template-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function readStoredTemplates() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function loadTemplates() {
  const stored = readStoredTemplates();
  const templates = Array.isArray(stored) ? stored.map(normalizeTemplate) : [];
  return templates.some(isDefaultTemplate)
    ? templates
    : [normalizeTemplate(DEFAULT_TEMPLATE), ...templates];
}

function saveTemplates(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

function readSelectedTemplateId() {
  try {
    return localStorage.getItem(SELECTED_TEMPLATE_ID_KEY);
  } catch {
    return null;
  }
}

function loadSelectedTemplateId(templates) {
  const storedId = readSelectedTemplateId();
  return templates.some((t) => t.id === storedId) ? storedId : templates[0]?.id;
}

function saveSelectedTemplateId(id) {
  try {
    localStorage.setItem(SELECTED_TEMPLATE_ID_KEY, id);
    return true;
  } catch {
    return false;
  }
}

function parseTemplatesFile(text) {
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : [parsed];
  if (
    !list.every((t) => t && typeof t === "object" && typeof t.name === "string")
  ) {
    throw new Error("Invalid export templates file");
  }
  return list
    .map(normalizeTemplate)
    .filter((template) => !isDefaultTemplate(template))
    .map((template) => ({ ...template, id: newTemplateId() }));
}

export {
  DEFAULT_TEMPLATE,
  isDefaultTemplate,
  normalizeTemplate,
  newTemplateId,
  loadTemplates,
  saveTemplates,
  loadSelectedTemplateId,
  saveSelectedTemplateId,
  parseTemplatesFile,
};
