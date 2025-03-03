import { apiPushTrench } from "@/services/ApiClient";
import { Notify } from "quasar";

export async function pushSurvey({
  Trench,
  checkedTrenchesVersion, // version of the trench
  trenchtoUpdateWithoutTrenchProp, // survey data
  projectPreferencesBase64, // preferences

  UpdateSyncTrenchData,
  setSyncPatches,
  setSyncTrench,
  setSyncNewVersion,
}) {
  const head = checkedTrenchesVersion[Trench];
  let surveys = trenchtoUpdateWithoutTrenchProp;
  const preferences = projectPreferencesBase64;

  let resp = await apiPushTrench(Trench, head, surveys, preferences);

  if (resp.data.status === "pushed") {
    checkedTrenchesVersion[Trench] = resp.data.version;
    localStorage.setItem(
      "localTrenchesVersion",
      JSON.stringify(checkedTrenchesVersion)
    );
    UpdateSyncTrenchData(Trench, surveys);
    Notify.create({
      type: "positive",
      message: "The item was saved",
    });
  } else if (resp.data.status === "pull") {
    setSyncPatches(resp.data.updates);
    setSyncTrench(Trench);
    setSyncNewVersion(resp.data.version);
    Notify.create({
      type: "warning",
      message: "There is a newer version on server",
    });
  }

  return resp;
}
