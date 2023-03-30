import axios from "axios";
import { getPersistentUserSettingsOrEmptyStrings } from "@/services/PersistentUserSettings";

// TODO: Here we temporarily, we use the persistentUserSettings. But these are meant to be used
// only to save preferences between sessions. We'll certainly use a centralised storage in the future.
// (Warning: the code, as it is here, could lead to strange behaviors when working on 2 tabs)
function getConnectionCredentials() {
  const { server, project, username, password } =
    getPersistentUserSettingsOrEmptyStrings();

  return { server, project, username, password };
}

export function cleanServerUserEntry(serverUserEntry) {
  return serverUserEntry
    .replace("https://", "")
    .replace("http://", "")
    .replace(":9000", "");
}

export function fetchAllTrenches(username, password, server, project) {
  console.log("spinner on");
  return axios({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "get",
    url: `//${server}:9000/idig/${project}/trenches`,
    auth: {
      username,
      password,
    },
  })
    .catch((error) => {
      console.error(error);

      let alertMessage =
        `message: ${error?.message}\r\r` +
        `response.data: ${error?.response?.data}\r\r` +
        `response.statusText: ${error?.response?.statusText}\r`;
      alert(alertMessage);
    })
    .finally(() => console.log("spinner off"));
}

export function fetchTrench(trench) {
  console.log("spinner on");

  const { server, project, username, password } = getConnectionCredentials();

  return axios({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "post",
    url: `//${server}:9000/idig/${project}/${trench}`,
    auth: {
      username,
      password,
    },
    data: JSON.stringify({
      head: "",
      surveys: [],
    }),
  })
    .catch((error) => {
      console.error(error);

      let alertMessage =
        `message: ${error?.message}\r\r` +
        `response.data: ${error?.response?.data}\r\r` +
        `response.statusText: ${error?.response?.statusText}\r`;
      alert(alertMessage);
    })
    .finally(() => console.log("spinner off"));
}
