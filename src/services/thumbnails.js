import { apiFetchAttachment } from "@/services/ApiClient";
import { parseAttachments } from "@/services/attachmentUtils";
import {
  openDB,
  getImageFromDB,
  addPlanToDB,
} from "@/services/indexedDbManager";

const DISPLAYABLE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "svg",
]);

const urlCache = new Map();

function firstDisplayableAttachment(relationAttachments) {
  return (
    parseAttachments(relationAttachments).find(({ name }) =>
      DISPLAYABLE_EXTENSIONS.has(name.split(".").pop().toLowerCase()),
    ) ?? null
  );
}

export function thumbnailAttachment(item, trenchItems = []) {
  const own = firstDisplayableAttachment(item?.RelationAttachments);
  if (own || !item?.RelationIncludesUUID) {
    return own;
  }

  const includedUuids = new Set(
    String(item.RelationIncludesUUID).split("\n").filter(Boolean),
  );
  for (const candidate of trenchItems) {
    if (includedUuids.has(candidate.IdentifierUUID)) {
      const attachment = firstDisplayableAttachment(
        candidate.RelationAttachments,
      );
      if (attachment) {
        return attachment;
      }
    }
  }
  return null;
}

async function loadThumbnailBlob({ name, checksum }, trench) {
  const imageName = name.split(".")[0];
  const db = await openDB();
  const cached = await getImageFromDB(db, imageName);
  if (cached) {
    return cached.imageBlob;
  }

  const response = await apiFetchAttachment(name, checksum, trench);
  const blob = new Blob([response.data], {
    type: response.headers?.["content-type"],
  });
  await addPlanToDB(db, imageName, blob, null);
  return blob;
}

export function loadThumbnailUrl(attachment, trench) {
  if (!urlCache.has(attachment.name)) {
    const promise = loadThumbnailBlob(attachment, trench)
      .then((blob) => URL.createObjectURL(blob))
      .catch((error) => {
        urlCache.delete(attachment.name);
        console.error(`Thumbnail ${attachment.name} failed to load:`, error);
        return null;
      });
    urlCache.set(attachment.name, promise);
  }
  return urlCache.get(attachment.name);
}
