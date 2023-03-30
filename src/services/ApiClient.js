import axios from "axios";

export function cleanerServerUserEntry(serverUserEntry) {
  return serverUserEntry
    .replace("https://", "")
    .replace("http://", "")
    .replace(":9000", "");
}

export function fetchTrenches(username, password, server, project) {
  console.log("spinner on");
  return axios({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "get",
    url: "http://" + server + ":9000/idig/" + project + "/trenches",
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
