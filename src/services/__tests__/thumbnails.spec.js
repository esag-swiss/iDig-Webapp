import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/services/ApiClient", () => ({ apiFetchAttachment: vi.fn() }));
vi.mock("@/services/indexedDbManager", () => ({
  openDB: vi.fn(async () => ({})),
  getImageFromDB: vi.fn(),
  addPlanToDB: vi.fn(),
}));

import { apiFetchAttachment } from "@/services/ApiClient";
import { getImageFromDB, addPlanToDB } from "@/services/indexedDbManager";

const ATTACHMENT = { name: "a.jpg", checksum: "c" };
const TRENCH = "T";

function serializedAttachments(...names) {
  return names.map((name) => `n=${name}\nd=sum-${name}`).join("\n\n");
}

function mockDownload() {
  apiFetchAttachment.mockResolvedValue({
    data: new Blob(["x"]),
    headers: { "content-type": "image/jpeg" },
  });
}

async function importThumbnails() {
  vi.resetModules();
  vi.clearAllMocks();
  globalThis.URL.createObjectURL = vi.fn(() => "blob:url");
  return import("@/services/thumbnails");
}

describe("thumbnails", () => {
  describe("thumbnailAttachment", () => {
    let thumbnailAttachment;
    beforeEach(async () => {
      ({ thumbnailAttachment } = await importThumbnails());
    });

    it("should return the first displayable photo of the item", () => {
      const item = {
        RelationAttachments: serializedAttachments("plan.tif", "a.JPG"),
      };

      expect(thumbnailAttachment(item)).toEqual({
        name: "a.JPG",
        checksum: "sum-a.JPG",
      });
    });

    it("should fall back to the photo of an included item", () => {
      const item = { RelationIncludesUUID: "U1\nU2" };
      const trenchItems = [
        { IdentifierUUID: "U1" },
        {
          IdentifierUUID: "U2",
          RelationAttachments: serializedAttachments("b.png"),
        },
      ];

      expect(thumbnailAttachment(item, trenchItems)?.name).toBe("b.png");
    });

    it("should return null when the item has no attachment", () => {
      expect(thumbnailAttachment({})).toBeNull();
    });

    it("should return null when no attachment is a photo", () => {
      const item = { RelationAttachments: serializedAttachments("x.wld") };

      expect(thumbnailAttachment(item)).toBeNull();
    });
  });

  describe("loadThumbnailUrl", () => {
    let loadThumbnailUrl;
    beforeEach(async () => {
      ({ loadThumbnailUrl } = await importThumbnails());
    });

    describe("when the photo is in the IndexedDB cache", () => {
      beforeEach(() => {
        getImageFromDB.mockResolvedValue({ imageBlob: new Blob(["x"]) });
      });

      it("should return an object url", async () => {
        expect(
          await loadThumbnailUrl({ attachment: ATTACHMENT, trench: TRENCH }),
        ).toBe("blob:url");
      });

      it("should not download the photo", async () => {
        await loadThumbnailUrl({ attachment: ATTACHMENT, trench: TRENCH });

        expect(apiFetchAttachment).not.toHaveBeenCalled();
      });
    });

    describe("when the photo is not in the cache", () => {
      beforeEach(async () => {
        getImageFromDB.mockResolvedValue(null);
        mockDownload();
        await loadThumbnailUrl({ attachment: ATTACHMENT, trench: TRENCH });
        await loadThumbnailUrl({ attachment: ATTACHMENT, trench: TRENCH });
      });

      it("should download it only once", () => {
        expect(apiFetchAttachment).toHaveBeenCalledTimes(1);
      });

      it("should download it from its trench", () => {
        expect(apiFetchAttachment).toHaveBeenCalledWith("a.jpg", "c", "T");
      });

      it("should store it in IndexedDB under its name without extension", () => {
        expect(addPlanToDB).toHaveBeenCalledWith(
          {},
          "a",
          expect.any(Blob),
          null,
        );
      });
    });

    describe("when the download fails", () => {
      beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        getImageFromDB.mockResolvedValue(null);
        apiFetchAttachment.mockRejectedValueOnce(new Error("offline"));
      });

      it("should return null", async () => {
        expect(
          await loadThumbnailUrl({ attachment: ATTACHMENT, trench: TRENCH }),
        ).toBeNull();
      });

      it("should retry the next time", async () => {
        await loadThumbnailUrl({ attachment: ATTACHMENT, trench: TRENCH });
        mockDownload();

        expect(
          await loadThumbnailUrl({ attachment: ATTACHMENT, trench: TRENCH }),
        ).toBe("blob:url");
      });
    });
  });

  describe("reloadThumbnailUrl", () => {
    let loadThumbnailUrl;
    let reloadThumbnailUrl;
    beforeEach(async () => {
      ({ loadThumbnailUrl, reloadThumbnailUrl } = await importThumbnails());
      getImageFromDB.mockResolvedValue({ imageBlob: new Blob(["broken"]) });
      mockDownload();
      await loadThumbnailUrl({ attachment: ATTACHMENT, trench: TRENCH });
    });

    it("should download the photo again even when it is cached", async () => {
      await reloadThumbnailUrl({ attachment: ATTACHMENT, trench: TRENCH });

      expect(apiFetchAttachment).toHaveBeenCalledTimes(1);
    });

    it("should replace the cached photo in IndexedDB", async () => {
      await reloadThumbnailUrl({ attachment: ATTACHMENT, trench: TRENCH });

      expect(addPlanToDB).toHaveBeenCalledWith({}, "a", expect.any(Blob), null);
    });
  });
});
