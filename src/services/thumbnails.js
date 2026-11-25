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

// One promise per attachment name, so a thumbnail rendered again (pagination,
// virtual scrolling, column redraw) never triggers a second read or download.
const urlCache = new Map();

function firstDisplayableAttachment(relationAttachments) {
  return (
    parseAttachments(relationAttachments).find(({ name }) =>
      DISPLAYABLE_EXTENSIONS.has(name.split(".").pop().toLowerCase()),
    ) ?? null
  );
}

// The item's own photo, otherwise the photo of the first included item that
// has one (e.g. a Context showing its Image items), like the item form does.
function thumbnailAttachment(item, trenchItems = []) {
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

// Same store and key as the item form and map plans: the name without
// extension, in rasterImagesStore.
function cacheKey(name) {
  return name.split(".")[0];
}

async function downloadThumbnailBlob({ attachment, trench }) {
  const response = await apiFetchAttachment(
    attachment.name,
    attachment.checksum,
    trench,
  );
  const blob = new Blob([response.data], {
    type: response.headers?.["content-type"],
  });
  const db = await openDB();
  await addPlanToDB(db, cacheKey(attachment.name), blob, null);
  return blob;
}

async function loadThumbnailBlob({ attachment, trench }) {
  const db = await openDB();
  const cached = await getImageFromDB(db, cacheKey(attachment.name));
  if (cached) {
    return cached.imageBlob;
  }
  return downloadThumbnailBlob({ attachment, trench });
}

function cacheThumbnailUrl({ attachment, loadBlob }) {
  const promise = loadBlob()
    .then((blob) => URL.createObjectURL(blob))
    .catch((error) => {
      // Forget failures so the image is retried next time it is shown.
      urlCache.delete(attachment.name);
      console.error(`Thumbnail ${attachment.name} failed to load:`, error);
      return null;
    });
  urlCache.set(attachment.name, promise);
  return promise;
}

function loadThumbnailUrl({ attachment, trench }) {
  if (urlCache.has(attachment.name)) {
    return urlCache.get(attachment.name);
  }
  return cacheThumbnailUrl({
    attachment,
    loadBlob: () => loadThumbnailBlob({ attachment, trench }),
  });
}

// For a cached photo the browser cannot decode: download it again from the
// server and replace the cache.
function reloadThumbnailUrl({ attachment, trench }) {
  return cacheThumbnailUrl({
    attachment,
    loadBlob: () => downloadThumbnailBlob({ attachment, trench }),
  });
}

export { thumbnailAttachment, loadThumbnailUrl, reloadThumbnailUrl };
