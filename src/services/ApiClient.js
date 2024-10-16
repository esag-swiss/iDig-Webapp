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

export function apiFetchIdigTrenchesNames() {
  const {
    server,
    username,
    password,
    incrementLoadingCount,
    decrementLoadingCount,
  } = useAppStore();

  incrementLoadingCount();
  return axios({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
    },
    method: "get",
    url: `${server}/idig`,
    auth: { username, password },
  })
    .catch((error) => {
      Notify.create({
        type: "negative",
        message:
          "Impossible de charger les trenches depuis le serveur, chargement de la liste par défaut",
        html: true,
      });
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

export function apiPushTrench(trench, head, surveys, preferences) {
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
      preferences,
    }),
  })
    .catch((error) => {
      displayError(error);
      throw error;
    })
    .finally(() => decrementLoadingCount());
}

export function apiFetchImageSRC(RelationAttachments, trench) {
  const {
    server,
    project,
    username,
    password,
    incrementLoadingCount,
    decrementLoadingCount,
  } = useAppStore();
  let name = RelationAttachments.split("\n")[0].split("=")[1];
  let checksum = RelationAttachments.split("\n")[1].split("=")[1];
  incrementLoadingCount();
  return axios({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "get",
    url: `${server}/idig/${project}/${trench}/attachments/${name}?checksum=${checksum}`,
    responseType: "blob",
    auth: { username, password },
    data: {},
  })
    .catch((error) => {
      alert(
        `Error: ${error}\nSomething went wrong with fetching layer!\nPlease check the RelationAttachments field. ${RelationAttachments}`
      );
    })
    .finally(() => decrementLoadingCount());
}

export function apiFetchPlanWld(RelationAttachments, trench) {
  const {
    server,
    project,
    username,
    password,
    incrementLoadingCount,
    decrementLoadingCount,
  } = useAppStore();
  let name = RelationAttachments.split("\n\n")[1].split("\n")[0].split("=")[1];
  let checksum = RelationAttachments.split("\n\n")[1]
    .split("\n")[1]
    .split("=")[1];
  incrementLoadingCount();

  return axios({
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "get",
    url: `${server}/idig/${project}/${trench}/attachments/${name}?checksum=${checksum}`,
    responseType: "blob",
    auth: { username, password },
    data: {},
  })
    .then((response) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const textContent = reader.result;
          resolve(textContent);
        };
        reader.onerror = (error) => {
          reject(error);
        };
        reader.readAsText(response.data);
      });
    })
    .catch((error) => {
      alert(
        `Error: ${error}\nSomething went wrong with fetching wld!\nPlease check the RelationAttachments field. ${RelationAttachments}`
      );
      throw error; // Rethrow the error to maintain consistency in handling errors
    })
    .finally(() => decrementLoadingCount());
}
