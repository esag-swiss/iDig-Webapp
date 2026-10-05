import { thumbnailAttachment, loadThumbnailUrl } from "@/services/thumbnails";

export function useTableThumbnails(getCheckedTrenchesData) {
  let observer = null;

  function observeThumbnail(container) {
    // Lazy loading: the photo is only read from IndexedDB (or downloaded)
    // once its cell scrolls into view.
    if (!observer) {
      observer = new IntersectionObserver(
        (entries, intersectionObserver) => {
          entries
            .filter((entry) => entry.isIntersecting)
            .forEach(({ target }) => {
              intersectionObserver.unobserve(target);
              renderThumbnail(target);
            });
        },
        { rootMargin: "100px" },
      );
    }
    observer.observe(container);
  }

  async function renderThumbnail(container) {
    const { trench, name, checksum } = container.dataset;
    const url = await loadThumbnailUrl({ name, checksum }, trench);
    if (!url) {
      return;
    }
    const img = document.createElement("img");
    img.src = url;
    img.alt = name;
    img.decoding = "async";
    container.replaceChildren(img);
  }

  function thumbnailFormatter(cell, onRendered) {
    const item = cell.getRow().getData();
    const container = document.createElement("div");
    container.className = "table-thumbnail";

    const attachment = thumbnailAttachment(
      item,
      getCheckedTrenchesData()[item.Trench],
    );
    if (attachment) {
      container.dataset.trench = item.Trench;
      container.dataset.name = attachment.name;
      container.dataset.checksum = attachment.checksum;
      onRendered(() => observeThumbnail(container));
    }
    return container;
  }

  function disconnect() {
    observer?.disconnect();
    observer = null;
  }

  return { thumbnailFormatter, disconnect };
}
