import axios from "axios";
import { useAppStore } from "@/stores/app";

function displayError(error) {
  let alertMessage =
    `message: ${error?.message}\r\r` +
    `response.data: ${error?.response?.data}\r\r` +
    `response.statusText: ${error?.response?.statusText}\r`;
  alert(alertMessage);
}

export function apiFetchProjectTrenchesNames() {
  const {
    server,
    project,
    username,
    password,
    incrementLoadingCount,
    decrementLoadingCount,
  } = useAppStore();

  incrementLoadingCount();
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
    .finally(() => decrementLoadingCount());
}

export function apiFetchPreferences(trench) {
  const {
    server,
    project,
    username,
    password,
    incrementLoadingCount,
    decrementLoadingCount,
  } = useAppStore();

  incrementLoadingCount();
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
    .finally(() => decrementLoadingCount());
}

export function apiFetchSurvey(trench) {
  const {
    server,
    project,
    username,
    password,
    incrementLoadingCount,
    decrementLoadingCount,
  } = useAppStore();

  incrementLoadingCount();
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
    .finally(() => decrementLoadingCount());
}

export function apiUpdateTrenchItem(
  trench,
  head,
  surveys,
  projectPreferencesBase64
) {
  const {
    server,
    project,
    username,
    password,
    incrementLoadingCount,
    decrementLoadingCount,
  } = useAppStore();

  incrementLoadingCount();
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
    .finally(() => decrementLoadingCount());
}
