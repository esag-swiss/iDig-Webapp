import { describe, it, expect } from "vitest";
import {
  fileExtension,
  parseAttachments,
  parseImageAttachments,
  serializeAttachments,
  attachmentChecksumsFromSurveys,
} from "@/services/attachmentUtils";

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

describe("parseImageAttachments", () => {
  it("should keep every image attachment", () => {
    const field = "n=a.jpg\nd=1111\n\nn=b.png\nd=2222";
    expect(parseImageAttachments(field)).toEqual([
      { name: "a.jpg", checksum: "1111" },
      { name: "b.png", checksum: "2222" },
    ]);
  });

  it("should skip georeferencing sidecar files", () => {
    const field = "n=a.tif\nd=1111\n\nn=a.WLD\nd=2222\n\nn=a.tfw\nd=3333";
    expect(parseImageAttachments(field)).toEqual([
      { name: "a.tif", checksum: "1111" },
    ]);
  });
});

describe("serializeAttachments", () => {
  it("should be the inverse of parseAttachments", () => {
    const field = "n=a.jpg\nd=1111\n\nn=b.jpg\nd=2222";
    expect(serializeAttachments(parseAttachments(field))).toBe(field);
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
