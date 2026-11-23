import { describe, it, expect } from "vitest";
import {
  createPhotoItem,
  addUuidToRelation,
  removeUuidFromRelation,
} from "@/services/photoItem";

const PARENT = {
  Identifier: "4132-1",
  IdentifierUUID: "0058330C-5DC7-4188-A415-80495B8541A7",
  Trench: "AMA24-S22C",
};
const PHOTO_UUID = "1B02E22E-0B2C-463E-85EB-3FD47DB81B09";

function createTestPhotoItem() {
  return createPhotoItem({
    parent: PARENT,
    uuid: PHOTO_UUID,
    extension: "jpg",
    date: new Date("2026-11-23T10:15:30.123Z"),
    timeZone: "Europe/Madrid",
  });
}

describe("photoItem", () => {
  describe("createPhotoItem", () => {
    it("should name the attachment after the photo item uuid", () => {
      const { attachment } = createTestPhotoItem();

      expect(attachment.name).toBe(`${PHOTO_UUID}.jpg`);
    });

    it("should use the date of the addition, to the second, as checksum", () => {
      const { attachment } = createTestPhotoItem();

      expect(attachment.checksum).toBe("2026-11-23T10:15:30Z");
    });

    it("should attach the photo to the photo item, like the iPad app", () => {
      const { item } = createTestPhotoItem();

      expect(item.RelationAttachments).toBe(
        `n=${PHOTO_UUID}.jpg\nd=2026-11-23T10:15:30Z`,
      );
    });

    it("should link the photo item to its parent", () => {
      const { item } = createTestPhotoItem();

      expect(item.RelationBelongsToUUID).toBe(PARENT.IdentifierUUID);
    });

    it("should create an Image item with the identifier and trench of its parent", () => {
      const { item } = createTestPhotoItem();

      expect(item).toMatchObject({
        Type: "Image",
        Identifier: PARENT.Identifier,
        Source: PARENT.Trench,
        Trench: PARENT.Trench,
      });
    });

    it("should date the photo item with the date of the addition", () => {
      const { item } = createTestPhotoItem();

      expect(item).toMatchObject({
        DateEarliest: "2026-11-23T10:15:30Z",
        DateLatest: "2026-11-23T10:15:30Z",
        DateTimeZone: "Europe/Madrid",
      });
    });
  });

  describe("addUuidToRelation", () => {
    it("should add the uuid on a new line", () => {
      expect(addUuidToRelation({ relationUuids: "A\nB", uuid: "C" })).toBe(
        "A\nB\nC",
      );
    });

    it("should create the relation when it is empty", () => {
      expect(addUuidToRelation({ relationUuids: undefined, uuid: "C" })).toBe(
        "C",
      );
    });

    it("should not add a uuid twice", () => {
      expect(addUuidToRelation({ relationUuids: "A\nC", uuid: "C" })).toBe(
        "A\nC",
      );
    });
  });

  describe("removeUuidFromRelation", () => {
    it("should remove the uuid and keep the others", () => {
      expect(
        removeUuidFromRelation({ relationUuids: "A\nC\nB", uuid: "C" }),
      ).toBe("A\nB");
    });

    it("should return an empty relation when the uuid was the only one", () => {
      expect(removeUuidFromRelation({ relationUuids: "C", uuid: "C" })).toBe(
        "",
      );
    });
  });
});
