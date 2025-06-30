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
    const { Trench, ...newObj } = obj;
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
    // TODO gérer status 'FORBIDDEN' 'OK'
  } else if (resp.data.status === "pull") {
    const dataStore = useDataStore();
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
