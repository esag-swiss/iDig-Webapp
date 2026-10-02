import { apiPushTrench, apiUploadAttachment } from "@/services/ApiClient";
import { Notify } from "quasar";
import { useDataStore } from "@/stores/data";
import { attachmentChecksumsFromSurveys } from "@/services/attachmentUtils";
import { findModifiedArchivedItems } from "@/services/helpers/itemHelper";
import {
  openDB,
  getPendingAttachment,
  deletePendingAttachment,
  readDataInIndexedDB,
} from "@/services/indexedDbManager";
import  { t } from "@/i18n";

function removeTrenchProp(trenchData) {
  return trenchData.map((obj) => {
    const newObj = { ...obj };
    delete newObj.Trench;
    return newObj;
  });
}

async function lastSyncedSurveys(trenchName) {
  const db = await openDB();
  const stored = await readDataInIndexedDB(db, trenchName);
  return stored ? removeTrenchProp(JSON.parse(stored)) : [];
}

function notifyArchivedItemsModified(items) {
  Notify.create({
    type: "negative",
    message: t("app.archived_items_modified", {
      items: items
        .map((item) => item.Identifier || item.IdentifierUUID)
        .join(", "),
    }),
    timeout: 10000,
  });
}

function isArchivedConflict(error) {
  return (
    error?.response?.status === 409 &&
    Array.isArray(error.response.data?.archived)
  );
}

async function uploadMissingAttachments(trenchName, missing, surveys) {
  const checksums = attachmentChecksumsFromSurveys(surveys);
  const db = await openDB();

  for (const name of missing) {
    const checksum = checksums.get(name);
    const pending = await getPendingAttachment(db, name);

    if (!checksum || !pending) {
      throw new Error(
        t("app.attachment_not_found_locally", { name }),
      );
    }

    await apiUploadAttachment(trenchName, name, checksum, pending.blob);
  }
}

async function clearPendingAttachments(surveys) {
  const names = Array.from(attachmentChecksumsFromSurveys(surveys).keys());
  if (names.length === 0) {
    return;
  }

  const db = await openDB();
  for (const name of names) {
    await deletePendingAttachment(db, name);
  }
}

export async function pushSurvey({
  trenchName,
  trenchVersion,
  trenchSurvey,
  projectPreferencesBase64,
}) {
  const dataStore = useDataStore();
  let surveys = removeTrenchProp(trenchSurvey);

  const modifiedArchived = findModifiedArchivedItems(
    await lastSyncedSurveys(trenchName),
    surveys,
  );
  if (modifiedArchived.length > 0) {
    notifyArchivedItemsModified(modifiedArchived);
    return null;
  }

  const push = () =>
    apiPushTrench(trenchName, trenchVersion, surveys, projectPreferencesBase64);
  let resp;
  try {
    resp = await push();
  } catch (error) {
    if (!isArchivedConflict(error)) {
      throw error;
    }
    const archivedUuids = new Set(error.response.data.archived);
    notifyArchivedItemsModified(
      surveys.filter((survey) => archivedUuids.has(survey.IdentifierUUID)),
    );
    return null;
  }

  let previousMissing = "";
  while (resp.data.status === "missing") {
    const currentMissing = [...resp.data.missing].sort().join("\n");
    if (currentMissing === previousMissing) {
      Notify.create({
        type: "negative",
        message: t("app.attachments_upload_failed"),
      });
      return resp;
    }
    previousMissing = currentMissing;

    try {
      await uploadMissingAttachments(trenchName, resp.data.missing, surveys);
    } catch (error) {
      Notify.create({
        type: "negative",
        message: error.message,
      });
      return resp;
    }

    resp = await push();
  }

  if (resp.data.status === "pushed" || resp.data.status === "ok") {
    dataStore.checkedTrenchesVersion[trenchName] = resp.data.version;

    localStorage.setItem(
      "lsLocalTrenchesVersion",
      JSON.stringify(dataStore.checkedTrenchesVersion),
    );

    dataStore.UpdateSyncTrenchData(trenchName, surveys);
    await clearPendingAttachments(surveys);
    Notify.create({
      type: "positive",
      message: trenchName + " saved",
    });
    // TODO gérer status 'FORBIDDEN' 'OK'
  } else if (resp.data.status === "pull") {
    dataStore.setSyncPatches(resp.data.updates);
    dataStore.setSyncTrench(trenchName);
    dataStore.setSyncNewVersion(resp.data.version);
    Notify.create({
      type: "warning",
      message: "There is a newer version on server",
    });
  }

  return resp;
}
