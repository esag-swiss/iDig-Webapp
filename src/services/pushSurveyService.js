import { apiPushTrench } from "@/services/ApiClient";
import { Notify } from "quasar";
import { setActivePinia, createPinia } from "pinia";
import { useDataStore } from "@/stores/data";

setActivePinia(createPinia());

const {
  UpdateSyncTrenchData,
  setSyncPatches,
  setSyncTrench,
  setSyncNewVersion,
} = useDataStore();

function removeTrenchProp(trenchData) {
  return trenchData.map((obj) => {
    const { trench, ...newObj } = obj;
    return newObj;
  });
}

export async function pushSurvey({
  trenchName,
  trenchVersion,
  trenchSurvey,
  projectPreferencesBase64,
}) {
  let surveys = removeTrenchProp(trenchSurvey);
  let resp = await apiPushTrench(
    trenchName,
    trenchVersion,
    surveys,
    projectPreferencesBase64
  );

  if (resp.data.status === "pushed" || resp.data.status === "ok") {
    const dataStore = useDataStore();
    dataStore.checkedTrenchesVersion[trenchName] = resp.data.version;

    localStorage.setItem(
      "lsLocalTrenchesVersion",
      JSON.stringify(dataStore.checkedTrenchesVersion)
    );

    UpdateSyncTrenchData(trenchName, surveys);
    Notify.create({
      type: "positive",
      message: trenchName + " saved",
    });
    // gérer status 'FORBIDDEN'
  } else if (resp.data.status === "pull") {
    setSyncPatches(resp.data.updates);
    setSyncTrench(trenchName);
    setSyncNewVersion(resp.data.version);
    Notify.create({
      type: "warning",
      message: "There is a newer version on server",
    });
  }

  return resp;
}
