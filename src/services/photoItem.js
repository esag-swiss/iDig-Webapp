import { parseUuidList } from "@/services/relationResolver";
import { serializeAttachments } from "@/services/attachmentUtils";

const NEW_ITEM_STATUS = "Will Process";

// Same shape as the Image items the iPad app creates: "2024-08-02T06:16:34Z".
function attachmentTimestamp(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function createPhotoItem({ parent, uuid, extension, date, timeZone }) {
  const timestamp = attachmentTimestamp(date);
  const attachment = { name: `${uuid}.${extension}`, checksum: timestamp };

  const item = {
    Type: "Image",
    Identifier: parent.Identifier,
    IdentifierUUID: uuid,
    Title: "",
    FormatImage: attachment.name,
    RelationAttachments: serializeAttachments([attachment]),
    RelationBelongsToUUID: parent.IdentifierUUID,
    DateEarliest: timestamp,
    DateLatest: timestamp,
    DateTimeZone: timeZone,
    Source: parent.Trench,
    Trench: parent.Trench,
    RightsLocked: "0",
    RightsTrashed: "0",
    RightsDeleted: "0",
    RightsSidelined: "0",
    RightsStatus: NEW_ITEM_STATUS,
  };

  return { item, attachment };
}

function addUuidToRelation({ relationUuids, uuid }) {
  const uuids = parseUuidList(relationUuids);
  if (uuids.includes(uuid)) {
    return relationUuids;
  }
  return [...uuids, uuid].join("\n");
}

function removeUuidFromRelation({ relationUuids, uuid }) {
  return parseUuidList(relationUuids)
    .filter((relatedUuid) => relatedUuid !== uuid)
    .join("\n");
}

export { createPhotoItem, addUuidToRelation, removeUuidFromRelation };
