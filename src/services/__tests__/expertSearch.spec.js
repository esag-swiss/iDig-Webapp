import { describe, it, expect } from "vitest";
import { validateExpression, runExpression } from "@/services/expertSearch";

const items = [
  { Type: "Context", Title: "FK4178", RightsStatus: "All Done" },
  { Type: "Context", Title: "FK4179", RightsStatus: "Draft" },
  { Type: "Artifact", Title: "Spindle", RightsStatus: "All Done" },
];

describe("validateExpression", () => {
  it("should return valid for a well-formed expression", () => {
    expect(validateExpression("[?Type=='Context']")).toEqual({
      valid: true,
      error: null,
    });
  });

  it("should return valid for an empty expression", () => {
    expect(validateExpression("   ")).toEqual({ valid: true, error: null });
  });

  it("should return an error message for a malformed expression", () => {
    const result = validateExpression("[?RightsStatus==]");
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe("runExpression", () => {
  it("should return all items for an empty expression", () => {
    expect(runExpression(items, "")).toBe(items);
  });

  it("should filter items matching a JMESPath filter", () => {
    const result = runExpression(items, "[?Type=='Context']");
    expect(result).toHaveLength(2);
    expect(result.map((item) => item.Title)).toEqual(["FK4178", "FK4179"]);
  });

  it("should support combined conditions", () => {
    const result = runExpression(
      items,
      "[?RightsStatus=='All Done' && contains(Title, 'FK')]",
    );
    expect(result.map((item) => item.Title)).toEqual(["FK4178"]);
  });

  it("should return an empty array for an invalid expression", () => {
    expect(runExpression(items, "[?RightsStatus==]")).toEqual([]);
  });

  it("should return an empty array when the result is not an array", () => {
    expect(runExpression(items, "length(@)")).toEqual([]);
  });
});
