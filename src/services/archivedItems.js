export const ARCHIVED_STATUS = "Archived";

export function isArchived(item) {
  return item?.RightsStatus === ARCHIVED_STATUS;
}

function isSameSurvey(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every((key) => (a[key] ?? "") === (b[key] ?? ""));
}

// Archived items of `previousItems` (last synced state) that `nextItems`
// modifies or removes. Mirrors the check idig-server runs on each push.
export function findModifiedArchivedItems(previousItems, nextItems) {
  const nextByUuid = new Map(
    nextItems.map((item) => [item.IdentifierUUID, item]),
  );
  return previousItems.filter((item) => {
    if (!isArchived(item)) {
      return false;
    }
    const next = nextByUuid.get(item.IdentifierUUID);
    return !next || !isSameSurvey(item, next);
  });
}
