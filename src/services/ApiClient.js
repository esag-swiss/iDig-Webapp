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

  throw new Error(error);
}

export function fetchAllTrenches() {
  console.log("spinner on");

  const { server, project, username, password } = getConnectionCredentials();

  return axios({
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "get",
    url: `//${server}:9000/idig/${project}/trenches`,
    auth: { username, password },
  })
    .catch((error) => handleError(error))
    .finally(() => console.log("spinner off"));
}

export function fetchPreferences(trench) {
  console.log("spinner on");

  const { server, project, username, password } = getConnectionCredentials();

  return axios({
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "post",
    url: `//${server}:9000/idig/${project}/${trench}`,
    auth: { username, password },
    data: JSON.stringify({ head: "", surveys: [] }),
  })
    .catch((error) => handleError(error))
    .finally(() => console.log("spinner off"));
}

export function fetchSurvey(trench) {
  console.log("spinner on");

  const { server, project, username, password } = getConnectionCredentials();

  return axios({
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "get",
    url: `//${server}:9000/idig/${project}/${trench}/surveys`,
    auth: { username, password },
    data: JSON.stringify({}),
  })
    .catch((error) => handleError(error))
    .finally(() => console.log("spinner off"));
}

export function updateTrenchItem(trench, head, surveys, preferences) {
  console.log("spinner on");

  const { server, project, username, password } = getConnectionCredentials();

  return axios({
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "post",
    url: `//${server}:9000/idig/${project}/${trench}`,
    auth: { username, password },
    data: JSON.stringify({ head, device: "webapp", surveys, preferences }),
  })
    .catch((error) => handleError(error))
    .finally(() => console.log("spinner off"));
}
