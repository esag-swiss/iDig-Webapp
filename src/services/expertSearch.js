import { compile, search } from "@jmespath-community/jmespath";

export function validateExpression(expression) {
  const trimmed = expression.trim();
  if (trimmed === "") {
    return { valid: true, error: null };
  }
  try {
    compile(trimmed);
    return { valid: true, error: null };
  } catch (error) {
    return { valid: false, error: error?.message ?? String(error) };
  }
}

export function runExpression(items, expression) {
  const trimmed = expression.trim();
  if (trimmed === "") {
    return items;
  }
  try {
    const result = search(items, trimmed);
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}
