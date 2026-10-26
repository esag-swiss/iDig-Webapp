import { describe, it, expect } from "vitest";
import {
  isArchived,
  findModifiedArchivedItems,
} from "@/services/archivedItems";

const archived = {
  IdentifierUUID: "A",
  Identifier: "1",
  RightsStatus: "Archived",
};
const open = { IdentifierUUID: "B", Identifier: "2", RightsStatus: "All Done" };

describe("isArchived", () => {
  it("matches the Archived status only", () => {
    expect(isArchived(archived)).toBe(true);
    expect(isArchived(open)).toBe(false);
    expect(isArchived(null)).toBe(false);
  });
});

describe("findModifiedArchivedItems", () => {
  it("ignores unchanged archived items and edits on other items", () => {
    const next = [{ ...archived }, { ...open, Title: "changed" }];
    expect(findModifiedArchivedItems([archived, open], next)).toEqual([]);
  });

  it("treats a missing field and an empty one as equal", () => {
    const next = [{ ...archived, Description: "" }];
    expect(findModifiedArchivedItems([archived], next)).toEqual([]);
  });

  it("reports an archived item whose fields changed", () => {
    const next = [{ ...archived, Title: "changed" }];
    expect(findModifiedArchivedItems([archived], next)).toEqual([archived]);
  });

  it("reports an archived item that was un-archived or removed", () => {
    expect(
      findModifiedArchivedItems(
        [archived],
        [{ ...archived, RightsStatus: "" }],
      ),
    ).toEqual([archived]);
    expect(findModifiedArchivedItems([archived], [])).toEqual([archived]);
  });

  it("allows archiving an item", () => {
    const next = [{ ...open, RightsStatus: "Archived" }];
    expect(findModifiedArchivedItems([open], next)).toEqual([]);
  });
});
