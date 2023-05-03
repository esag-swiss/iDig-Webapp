import axios from "axios";
import { useAppState } from "@/services/useAppState";

function getConnectionCredentials() {
  const { appState } = useAppState();
  const appStateUnwrapped = appState.value;

  return {
    server: appStateUnwrapped.server,
    project: appStateUnwrapped.project,
    username: appStateUnwrapped.username,
    password: appStateUnwrapped.password,
  };
}

function handleError(error) {
  console.error(error);

  let alertMessage =
    `message: ${error?.message}\r\r` +
    `response.data: ${error?.response?.data}\r\r` +
    `response.statusText: ${error?.response?.statusText}\r`;
  alert(alertMessage);

  throw error;
}

export function fetchProjectTrenchesNames() {
  const { setAppState } = useAppState();
  setAppState("isLoading", true);

  const { server, project, username, password } = getConnectionCredentials();

  return axios({
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "get",
    url: `${server}/idig/${project}/trenches`,
    auth: { username, password },
  })
    .catch((error) => handleError(error))
    .finally(() => setAppState("isLoading", false));
}

export function fetchPreferences(trench) {
  const { setAppState } = useAppState();
  setAppState("isLoading", true);

  const { server, project, username, password } = getConnectionCredentials();

  return axios({
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "post",
    url: `${server}/idig/${project}/${trench}`,
    auth: { username, password },
    data: JSON.stringify({ head: "", surveys: [] }),
  })
    .catch((error) => handleError(error))
    .finally(() => setAppState("isLoading", false));
}

export function fetchSurvey(trench) {
  const { setAppState } = useAppState();
  setAppState("isLoading", true);

  const { server, project, username, password } = getConnectionCredentials();

  return axios({
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "get",
    url: `${server}/idig/${project}/${trench}/surveys`,
    auth: { username, password },
    data: JSON.stringify({}),
  })
    .catch((error) => handleError(error))
    .finally(() => setAppState("isLoading", false));
}

export function updateTrenchItem(
  trench,
  head,
  surveys,
  projectPreferencesBase64
) {
  const { setAppState } = useAppState();
  setAppState("isLoading", true);

  const { server, project, username, password } = getConnectionCredentials();

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
    .catch((error) => handleError(error))
    .finally(() => setAppState("isLoading", false));
}
