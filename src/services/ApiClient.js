import axios from "axios";
import { useAppStore } from "@/stores/app";
import { Notify } from "quasar";

function displayError(error) {
  let message =
    `message: ${error?.message}<br/>` +
    `response.data: ${error?.response?.data}<br/>` +
    `response.statusText: ${error?.response?.statusText}<br/>`;

  Notify.create({
    type: "negative",
    message,
    html: true,
  });
}

export function apiFetchProjectTrenchesNames() {
  const { server, project, username, password, setIsLoading } = useAppStore();
  setIsLoading(true);

  return axios({
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "get",
    url: `${server}/idig/${project}/trenches`,
    auth: { username, password },
  })
    .catch((error) => {
      displayError(error);
      throw error;
    })
    .finally(() => setIsLoading(false));
}

export function apiFetchPreferences(trench) {
  const { server, project, username, password, setIsLoading } = useAppStore();
  setIsLoading(true);

  return axios({
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "post",
    url: `${server}/idig/${project}/${trench}`,
    auth: { username, password },
    data: JSON.stringify({ head: "", surveys: [] }),
  })
    .catch((error) => {
      displayError(error);
      throw error;
    })
    .finally(() => setIsLoading(false));
}

export function apiFetchSurvey(trench) {
  const { server, project, username, password, setIsLoading } = useAppStore();
  setIsLoading(true);

  return axios({
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "get",
    url: `${server}/idig/${project}/${trench}/surveys`,
    auth: { username, password },
    data: JSON.stringify({}),
  })
    .catch((error) => {
      displayError(error);
      throw error;
    })
    .finally(() => setIsLoading(false));
}

export function apiUpdateTrenchItem(
  trench,
  head,
  surveys,
  projectPreferencesBase64
) {
  const { server, project, username, password, setIsLoading } = useAppStore();
  setIsLoading(true);

  return axios({
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "post",
    url: `${server}/idig/${project}/${trench}`,
    auth: { username, password },
    data: JSON.stringify({
      head,
      device: "webapp",
      surveys,
      projectPreferencesBase64,
    }),
  })
    .catch((error) => {
      displayError(error);
      throw error;
    })
    .finally(() => setIsLoading(false));
}
