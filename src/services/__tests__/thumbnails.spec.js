import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/ApiClient", () => ({ apiFetchAttachment: vi.fn() }));
vi.mock("@/services/indexedDbManager", () => ({
  openDB: vi.fn(async () => ({})),
  getImageFromDB: vi.fn(),
  addPlanToDB: vi.fn(),
}));

import { apiFetchAttachment } from "@/services/ApiClient";
import { getImageFromDB, addPlanToDB } from "@/services/indexedDbManager";

const attachments = (...names) =>
  names.map((name) => `n=${name}\nd=sum-${name}`).join("\n\n");

describe("thumbnailAttachment", () => {
  let thumbnailAttachment;
  beforeEach(async () => {
    ({ thumbnailAttachment } = await import("@/services/thumbnails"));
  });

  it("returns the first displayable photo of the item", () => {
    const item = { RelationAttachments: attachments("plan.tif", "a.JPG") };
    expect(thumbnailAttachment(item)).toEqual({
      name: "a.JPG",
      checksum: "sum-a.JPG",
    });
  });

  it("falls back to the photo of an included item", () => {
    const item = { RelationIncludesUUID: "U1\nU2" };
    const trenchItems = [
      { IdentifierUUID: "U1" },
      { IdentifierUUID: "U2", RelationAttachments: attachments("b.png") },
    ];
    expect(thumbnailAttachment(item, trenchItems)?.name).toBe("b.png");
  });

  it("returns null when nothing can be shown", () => {
    expect(thumbnailAttachment({})).toBeNull();
    expect(
      thumbnailAttachment({ RelationAttachments: attachments("x.wld") }),
    ).toBeNull();
  });
});

describe("loadThumbnailUrl", () => {
  let loadThumbnailUrl;
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    globalThis.URL.createObjectURL = vi.fn(() => "blob:url");
    ({ loadThumbnailUrl } = await import("@/services/thumbnails"));
  });

  it("reads the IndexedDB cache without downloading", async () => {
    getImageFromDB.mockResolvedValue({ imageBlob: new Blob(["x"]) });

    expect(await loadThumbnailUrl({ name: "a.jpg", checksum: "c" }, "T")).toBe(
      "blob:url",
    );
    expect(getImageFromDB).toHaveBeenCalledWith({}, "a");
    expect(apiFetchAttachment).not.toHaveBeenCalled();
  });

  it("downloads on a cache miss, stores it, and loads only once", async () => {
    getImageFromDB.mockResolvedValue(null);
    apiFetchAttachment.mockResolvedValue({
      data: new Blob(["x"]),
      headers: { "content-type": "image/jpeg" },
    });

    const attachment = { name: "a.jpg", checksum: "c" };
    await loadThumbnailUrl(attachment, "T");
    await loadThumbnailUrl(attachment, "T");

    expect(apiFetchAttachment).toHaveBeenCalledTimes(1);
    expect(apiFetchAttachment).toHaveBeenCalledWith("a.jpg", "c", "T");
    expect(addPlanToDB).toHaveBeenCalledWith({}, "a", expect.any(Blob), null);
  });

  it("returns null on failure and retries next time", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    getImageFromDB.mockResolvedValue(null);
    apiFetchAttachment.mockRejectedValueOnce(new Error("offline"));

    const attachment = { name: "a.jpg", checksum: "c" };
    expect(await loadThumbnailUrl(attachment, "T")).toBeNull();

    apiFetchAttachment.mockResolvedValue({
      data: new Blob(["x"]),
      headers: {},
    });
    expect(await loadThumbnailUrl(attachment, "T")).toBe("blob:url");
  });
});
