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
export function apiFetchTrenchVersion(trench) {
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
    url: `${server}/idig/${project}/${trench}/versions`,
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
    .then(() => {
      Notify.create({
        type: "positive",
        message: `The item was saved`,
      });
    })
    .catch((error) => {
      displayError(error);
      throw error;
    })
    .finally(() => decrementLoadingCount());
}
export function apiFetchImage(img, trench) {
  const { server, project, incrementLoadingCount, decrementLoadingCount } =
    useAppStore();
  let name = img.split("\n")[0].split("=")[1];
  let checksum = img.split("\n")[1].split("=")[1];

  console.log(trench);
  incrementLoadingCount();
  axios({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "get",
    url: `${server}/idig/${project}/${trench}/attachments/${name}?checksum=${checksum}`,

    responseType: "blob",
    auth: {
      username: "idig",
      password: "idig",
    },
    data: {},
  })
    .then((response) => {
      let imageNode = document.getElementById("image");
      let blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      let imgUrl = URL.createObjectURL(blob);
      imageNode.src = imgUrl;
    })
    .catch((error) => {
      alert(
        `Error: ${error}\nSomething went wrong! Please check the image URL.`
      );
    })
    .finally(() => decrementLoadingCount());
}
