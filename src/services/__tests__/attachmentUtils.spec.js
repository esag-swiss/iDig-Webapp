import { describe, it, expect } from "vitest";
import {
  computeSHA256,
  fileExtension,
  parseAttachments,
  serializeAttachments,
  addAttachment,
  removeAttachment,
  attachmentChecksumsFromSurveys,
} from "@/services/attachmentUtils";

describe("computeSHA256", () => {
  it("should return the hex SHA-256 digest of the input bytes", async () => {
    const bytes = new TextEncoder().encode("hello");
    expect(await computeSHA256(bytes)).toBe(
      "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
    );
  });
});

describe("fileExtension", () => {
  it("should extract the lowercased extension", () => {
    expect(fileExtension("IMG_1234.JPG")).toBe("jpg");
    expect(fileExtension("photo.final.png")).toBe("png");
  });

  it("should fall back to jpg when there is no extension", () => {
    expect(fileExtension("noext")).toBe("jpg");
    expect(fileExtension("")).toBe("jpg");
    expect(fileExtension(undefined)).toBe("jpg");
  });
});

describe("parseAttachments", () => {
  it("should parse a single attachment block", () => {
    expect(parseAttachments("n=abc.jpg\nd=deadbeef")).toEqual([
      { name: "abc.jpg", checksum: "deadbeef" },
    ]);
  });

  it("should parse several blocks separated by a blank line", () => {
    const field = "n=a.jpg\nd=1111\n\nn=b.jpg\nd=2222";
    expect(parseAttachments(field)).toEqual([
      { name: "a.jpg", checksum: "1111" },
      { name: "b.jpg", checksum: "2222" },
    ]);
  });

  it("should skip blocks missing a name or a checksum", () => {
    expect(parseAttachments("n=a.jpg\n\nn=b.jpg\nd=2222")).toEqual([
      { name: "b.jpg", checksum: "2222" },
    ]);
  });

  it("should return an empty array for empty input", () => {
    expect(parseAttachments("")).toEqual([]);
    expect(parseAttachments(undefined)).toEqual([]);
  });
});

describe("serializeAttachments", () => {
  it("should be the inverse of parseAttachments", () => {
    const field = "n=a.jpg\nd=1111\n\nn=b.jpg\nd=2222";
    expect(serializeAttachments(parseAttachments(field))).toBe(field);
  });
});

describe("addAttachment", () => {
  it("should append a new attachment to an empty field", () => {
    expect(addAttachment(undefined, "a.jpg", "1111")).toBe("n=a.jpg\nd=1111");
  });

  it("should append to an existing field", () => {
    expect(addAttachment("n=a.jpg\nd=1111", "b.jpg", "2222")).toBe(
      "n=a.jpg\nd=1111\n\nn=b.jpg\nd=2222",
    );
  });

  it("should not duplicate an already present attachment", () => {
    const field = "n=a.jpg\nd=1111";
    expect(addAttachment(field, "a.jpg", "1111")).toBe(field);
  });
});

describe("removeAttachment", () => {
  it("should remove an attachment by name", () => {
    const field = "n=a.jpg\nd=1111\n\nn=b.jpg\nd=2222";
    expect(removeAttachment(field, "a.jpg")).toBe("n=b.jpg\nd=2222");
  });

  it("should return an empty string when the last attachment is removed", () => {
    expect(removeAttachment("n=a.jpg\nd=1111", "a.jpg")).toBe("");
  });
});

describe("attachmentChecksumsFromSurveys", () => {
  it("should build a name -> checksum lookup across surveys", () => {
    const surveys = [
      { RelationAttachments: "n=a.jpg\nd=1111" },
      { RelationAttachments: "n=b.jpg\nd=2222\n\nn=c.jpg\nd=3333" },
      { Title: "no attachments here" },
    ];
    const map = attachmentChecksumsFromSurveys(surveys);
    expect(map.get("a.jpg")).toBe("1111");
    expect(map.get("b.jpg")).toBe("2222");
    expect(map.get("c.jpg")).toBe("3333");
    expect(map.size).toBe(3);
  });
});
