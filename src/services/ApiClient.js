import axios from "axios";
import { useAppStore } from "@/stores/app";

function handleError(error) {
  let alertMessage =
    `message: ${error?.message}\r\r` +
    `response.data: ${error?.response?.data}\r\r` +
    `response.statusText: ${error?.response?.statusText}\r`;
  alert(alertMessage);

  throw error;
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
    .catch((error) => handleError(error))
    .finally(() => setIsLoading(false));
}

export function fetchPreferences(trench) {
  const { server, project, username, password, setIsLoading } = useAppStore();
  setIsLoading(true);

  return axios({
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "post",
    url: `${server}/idig/${project}/${trench}`,
    auth: { username, password },
    data: JSON.stringify({ head: "", surveys: [] }),
  })
    .catch((error) => handleError(error))
    .finally(() => setIsLoading(false));
}

export function fetchSurvey(trench) {
  const { server, project, username, password, setIsLoading } = useAppStore();
  setIsLoading(true);

  return axios({
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "get",
    url: `${server}/idig/${project}/${trench}/surveys`,
    auth: { username, password },
    data: JSON.stringify({}),
  })
    .catch((error) => handleError(error))
    .finally(() => setIsLoading(false));
}

export function updateTrenchItem(
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
    .catch((error) => handleError(error))
    .finally(() => setIsLoading(false));
}
