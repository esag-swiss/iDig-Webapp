export function normalizeText(value) {
  return String(value).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}