// Unicode range of combining diacritical marks (accents, cedillas, etc.)
// isolated by the NFD decomposition below.
const COMBINING_DIACRITICAL_MARKS = /[\u0300-\u036f]/g;

// Normalizes text for case- and accent-insensitive comparison: decomposes
// accented characters into (base letter + separate diacritic) via NFD,
// then strips those diacritics. E.g. "Éléphant" -> "elephant".
export function normalizeForSearch(text) {
  return String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICAL_MARKS, "");
}
