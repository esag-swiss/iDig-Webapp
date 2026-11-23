const TOKEN = /\{(\w+)\}/g;
const MERGEABLE_PUNCTUATION = /[.,;:]/;
const DANGLING_SEPARATORS = /^[\s,;:–—-]+|[\s,;:–—-]+$/g;

const EXAMPLE_COMPOSITION = [
  "{Identifier}",
  { separator: ". " },
  { fields: ["Title", "Description"], separator: ". " },
  { separator: ". " },
  { field: "Source", format: "({value})" },
  { separator: "." },
];

function hasTokens(pattern) {
  return new RegExp(TOKEN.source).test(pattern);
}

function fillTokens({ pattern, valueOf }) {
  if (!hasTokens(pattern)) {
    return pattern;
  }
  let anyValue = false;
  const filled = pattern.replace(TOKEN, (match, field) => {
    const value = valueOf(field);
    anyValue ||= value !== "";
    return value;
  });
  // "{Trench}, FK{Identifier}, {InventoryNumber}" without inventory number
  // must not end with ", ".
  return anyValue ? filled.replace(DANGLING_SEPARATORS, "") : "";
}

function asList(fields) {
  return [fields].flat().filter(Boolean);
}

function firstFilledValue({ fields, valueOf }) {
  for (const field of asList(fields)) {
    const value = valueOf(field);
    if (value !== "") {
      return value;
    }
  }
  return "";
}

function fieldText({ spec, valueOf }) {
  if (typeof spec === "string") {
    return valueOf(spec);
  }
  const value = firstFilledValue({
    fields: [spec.field, ...asList(spec.fallback)],
    valueOf,
  });
  if (value === "") {
    return "";
  }
  const formatted = spec.format
    ? spec.format.replaceAll("{value}", value)
    : value;
  return `${spec.prefix ?? ""}${formatted}${spec.suffix ?? ""}`;
}

// "Local (K ?)." followed by ". " gives "Local (K ?). ", not "Local (K ?).. ".
function appendSeparator({ text, separator }) {
  const mark = separator.trimStart()[0];
  const trimmed = text.trimEnd();
  if (mark && MERGEABLE_PUNCTUATION.test(mark) && trimmed.endsWith(mark)) {
    return trimmed + separator.trimStart().slice(1);
  }
  return text + separator;
}

function joinFilled({ texts, separator }) {
  return texts
    .filter((text) => text !== "")
    .reduce((joined, text) =>
      appendSeparator({ text: joined, separator }) + text,
    );
}

function partText({ part, valueOf }) {
  if (typeof part === "string") {
    return fillTokens({ pattern: part, valueOf });
  }
  if (Array.isArray(part.fields)) {
    const texts = part.fields.map((spec) => fieldText({ spec, valueOf }));
    if (texts.every((text) => text === "")) {
      return "";
    }
    return joinFilled({ texts, separator: part.separator ?? " " });
  }
  return fieldText({ spec: part, valueOf });
}

function isSeparatorOnly(part) {
  return (
    typeof part === "object" &&
    !Array.isArray(part.fields) &&
    part.field === undefined &&
    typeof part.separator === "string"
  );
}

// A separator is written only between two filled parts, except the last one
// of the composition (the final "."). Several separators in a row, around
// empty parts, collapse into the last one.
function composeText({ composition, valueOf }) {
  let text = "";
  let pendingSeparator = null;

  for (const part of composition) {
    if (isSeparatorOnly(part)) {
      if (text !== "") {
        pendingSeparator = part.separator;
      }
      continue;
    }
    const value = partText({ part, valueOf });
    if (value === "") {
      continue;
    }
    if (pendingSeparator !== null) {
      text = appendSeparator({ text, separator: pendingSeparator });
      pendingSeparator = null;
    }
    text += value;
  }

  if (pendingSeparator !== null) {
    text = appendSeparator({ text, separator: pendingSeparator });
  }
  return text.trim();
}

function isFieldSpec(spec) {
  return (
    typeof spec === "string" ||
    (typeof spec === "object" &&
      spec !== null &&
      typeof spec.field === "string")
  );
}

function isValidPart(part) {
  if (typeof part === "string") {
    return true;
  }
  if (typeof part !== "object" || part === null) {
    return false;
  }
  if (part.fields !== undefined) {
    return Array.isArray(part.fields) && part.fields.every(isFieldSpec);
  }
  return isFieldSpec(part) || isSeparatorOnly(part);
}

function isValidComposition(composition) {
  return Array.isArray(composition) && composition.every(isValidPart);
}

export { EXAMPLE_COMPOSITION, composeText, isValidComposition };
