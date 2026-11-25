import { fileExtension } from "@/services/attachmentUtils";

const HEIC_EXTENSIONS = ["heic", "heif"];
const HEIC_MIME_TYPES = [
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
];
const JPEG_QUALITY = 0.9;

function isHeicFile(file) {
  return (
    HEIC_MIME_TYPES.includes(file.type) ||
    HEIC_EXTENSIONS.includes(fileExtension(file.name))
  );
}

async function convertHeicToJpeg(file) {
  // Loaded on demand: the decoder weighs about 3 MB.
  const { heicTo } = await import("heic-to");
  return heicTo({ blob: file, type: "image/jpeg", quality: JPEG_QUALITY });
}

async function preparePhoto({ file, convertHeic = convertHeicToJpeg }) {
  if (isHeicFile(file)) {
    return { blob: await convertHeic(file), extension: "jpg" };
  }
  // A copy of the bytes, not the picker's File: some browsers cannot read
  // a File back from IndexedDB once the picker is closed.
  const blob = new Blob([await file.arrayBuffer()], { type: file.type });
  return { blob, extension: fileExtension(file.name) };
}

export { isHeicFile, preparePhoto };
