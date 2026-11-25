// @vitest-environment node
// jsdom's File has no arrayBuffer(); Node's File does.
import { describe, it, expect } from "vitest";
import { isHeicFile, preparePhoto } from "@/services/photoFile";

const JPEG_FROM_HEIC = new Blob(["converted"], { type: "image/jpeg" });

function convertHeicStub() {
  return Promise.resolve(JPEG_FROM_HEIC);
}

function createFile({ name, type }) {
  return new File(["bytes"], name, { type });
}

describe("photoFile", () => {
  describe("isHeicFile", () => {
    it("should recognise a HEIC photo by its type", () => {
      const file = createFile({ name: "IMG_0001", type: "image/heic" });

      expect(isHeicFile(file)).toBe(true);
    });

    it("should recognise a HEIC photo by its extension when the browser gives no type", () => {
      const file = createFile({ name: "IMG_0001.HEIC", type: "" });

      expect(isHeicFile(file)).toBe(true);
    });

    it("should recognise a HEIF photo", () => {
      const file = createFile({ name: "IMG_0001.heif", type: "" });

      expect(isHeicFile(file)).toBe(true);
    });

    it("should not take a JPEG photo for a HEIC one", () => {
      const file = createFile({ name: "IMG_0001.jpg", type: "image/jpeg" });

      expect(isHeicFile(file)).toBe(false);
    });
  });

  describe("preparePhoto", () => {
    describe("when the photo is a HEIC one", () => {
      const file = createFile({ name: "IMG_0001.HEIC", type: "image/heic" });

      it("should keep the converted JPEG", async () => {
        const { blob } = await preparePhoto({
          file,
          convertHeic: convertHeicStub,
        });

        expect(blob).toBe(JPEG_FROM_HEIC);
      });

      it("should give the jpg extension, like the iPad app", async () => {
        const { extension } = await preparePhoto({
          file,
          convertHeic: convertHeicStub,
        });

        expect(extension).toBe("jpg");
      });
    });

    describe("when the photo is already displayable", () => {
      const file = createFile({ name: "IMG_0001.png", type: "image/png" });

      it("should keep the file bytes", async () => {
        const { blob } = await preparePhoto({
          file,
          convertHeic: convertHeicStub,
        });

        expect(await blob.text()).toBe("bytes");
      });

      it("should keep the file extension", async () => {
        const { extension } = await preparePhoto({
          file,
          convertHeic: convertHeicStub,
        });

        expect(extension).toBe("png");
      });

      it("should not call the HEIC conversion", async () => {
        const convertHeic = () => {
          throw new Error("unexpected conversion");
        };

        await expect(preparePhoto({ file, convertHeic })).resolves.toBeTruthy();
      });
    });
  });
});
