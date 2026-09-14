import axios from "axios";
import { useAppStore } from "@/stores/app";
import { Notify } from "quasar";

function displayError(message, error, type = "negative") {
  console.error(`Error in ${message}:`, error);
  Notify.create({
    type,
    message,
    html: true,
    timeout: 10000,
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
    .then((response) => {
      const data = response?.data;
      const hasEmptyArrayValue =
        data &&
        typeof data === "object" &&
        Object.values(data).some(
          (value) => Array.isArray(value) && value.length === 0,
        );
      if (hasEmptyArrayValue) {
        displayError(
          `Aucun secteur disponible.<br/>` +
            `Vous n'avez peut-etre pas les droits de lecture.`,
          null,
          "warning",
        );
      }
      return response;
    })
    .catch((error) => {
      displayError(
        `La liste des secteurs ne peut pas être établie car le serveur ne répond pas.<br/>Assurez-vous que le serveur <strong>${server}</strong> est correctement orthographié et accessible.`,
        error,
      );
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
      displayError("Context : fetchTrenchVersion", error);
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
      const errorMessage = String(error?.response?.data?.error || "");
      if (errorMessage.includes("Invalid version")) {
        displayError(
          `Le secteur <strong>${trench}</strong> est introuvable sur le serveur.<br/>` +
            `Vérifiez le nom du secteur et réessayez.`,
          error,
        );
      } else if (errorMessage.includes("Invalid users file")) {
        displayError(
          `Le projet <strong>${project}</strong> est introuvable sur le serveur.<br/>` +
            `Vérifiez le nom du projet et réessayez.`,
          error,
        );
      } else {
        displayError("Context : fetchPreferences", error);
      }
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
      displayError("Context : fetchSurvey", error);
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
      displayError("Context : pushTrench", error);
      throw error;
    })
    .finally(() => decrementLoadingCount());
}

export function apiUploadAttachment(trench, name, checksum, blob) {
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
    headers: {
      "Content-Type": blob.type || "application/octet-stream",
    },
    method: "put",
    url: `${server}/idig/${project}/${trench}/attachments/${name}?checksum=${checksum}`,
    auth: { username, password },
    data: blob,
  })
    .catch((error) => {
      displayError(
        `Failed to upload the photo <strong>${name}</strong>.`,
        error,
      );
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
        `Error: ${error}\nSomething went wrong with fetching layer!\nPlease check the RelationAttachments field. ${RelationAttachments}`,
      );
    })
    .finally(() => decrementLoadingCount());
}

export function apiFetchImage(filename, checksum, trench) {
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
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "get",
    url: `${server}/idig/${project}/${trench}/attachments/${filename}?checksum=${checksum}`,
    responseType: "blob",
    auth: { username, password },
    data: {},
  })
    .catch((error) => {
      alert(
        `Error: ${error}\nSomething went wrong with fetching image!\nPlease check the filename and checksum.`,
      );
    })
    .finally(() => decrementLoadingCount());
}

export function apiFetchWld(filename, checksum, trench) {
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
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "get",
    url: `${server}/idig/${project}/${trench}/attachments/${filename}?checksum=${checksum}`,
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
        `Error: ${error}\nSomething went wrong with fetching bounds!\nPlease check the filename and checksum.`,
      );
      throw error; // Rethrow the error to maintain consistency in handling errors
    })
    .finally(() => decrementLoadingCount());
}
