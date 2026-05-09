import { useAppStore } from "@/stores/app";
import { useDataStore } from "@/stores/data";
import { Notify } from "quasar";

export function lsStoreConnection() {
  // Store the current connection details in local storage
  // This is used to persist the connection state across sessions
  // and to allow the user to reconnect without re-entering credentials.
  const { currentProfile, server, project, username, password } = useAppStore();
  localStorage.setItem("currentProfile", currentProfile);
  localStorage.setItem("server", server);
  localStorage.setItem("project", project);
  localStorage.setItem("username", username);
  localStorage.setItem("password", password);
}

export function lsStoreProfiles(profile, server, project, username, password) {
  // Retrieve existing profiles array or initialize an empty one
  const profiles = JSON.parse(
    localStorage.getItem("profiles") ||
      localStorage.getItem("connections") || // for backward compatibility
      "[]",
  );

  // Create a new connection object with the current credentials
  if (
    profiles.some(
      (conn) =>
        conn.profile === profile &&
        conn.server === server &&
        conn.project === project &&
        conn.username === username,
    )
  ) {
    Notify.create({
      message: "Connection already exists",
      type: "positive",
    });
  } else {
    const newProfile = {
      profile,
      server,
      project,
      username,
      password,
    };

    profiles.push(newProfile);

    // Save the updated array back to local storage
    localStorage.setItem("profiles", JSON.stringify(profiles));
  }
}
export function lsUpdateProfile(profile, key, value) {
  // Retrieve existing profiles array or initialize an empty one
  const profiles = JSON.parse(
    localStorage.getItem("profiles") ||
      localStorage.getItem("connections") || // for backward compatibility
      "[]",
  );

  // Find the index of the connection to update
  const index = profiles.findIndex(
    (localStorage) => localStorage.profile === profile,
  );

  // If the connection exists, update it
  if (index !== -1) {
    profiles[index] = {
      ...profiles[index],
      [key]: value,
    };
    localStorage.setItem("profiles", JSON.stringify(profiles));
  }
}

export const lsLoadCurrentProfile = () => {
  return localStorage.getItem("currentProfile") ?? "";
};
export const lsLoadUsername = () => {
  return localStorage.getItem("username") ?? "";
};
export const lsLoadPassword = () => {
  return localStorage.getItem("password") ?? "";
};
export const lsLoadServer = () => {
  return localStorage.getItem("server") ?? "";
};
export const lsLoadProject = () => {
  return localStorage.getItem("project") ?? "";
};
export const lsLoadCheckedTrenchesVersion = () => {
  return localStorage.getItem("lsLocalTrenchesVersion")
    ? JSON.parse(localStorage.getItem("lsLocalTrenchesVersion"))
    : {};
};
export function lsStoreLang() {
  const { lang, currentProfile } = useAppStore();
  lsUpdateProfile(currentProfile, "lang", lang);
  localStorage.setItem("lang", lang);
}
export const lsLoadLang = () => {
  return localStorage.getItem("lang") ?? "fr";
};

export function lsStoreCheckedFieldNames() {
  const { checkedFieldNames, selectedType } = useDataStore();

  // 1st, get the full checked array saved in local storage, if any :
  let checkedFieldNamesPerType = localStorage.getItem(
    "checkedFieldNamesPerType",
  )
    ? JSON.parse(localStorage.getItem("checkedFieldNamesPerType"))
    : {};

  // 2nd, in it, add or replace, for current type, the current checkbox array :
  checkedFieldNamesPerType[selectedType] = checkedFieldNames;

  // 3rd, store it in local storage :
  localStorage.setItem(
    "checkedFieldNamesPerType",
    JSON.stringify(checkedFieldNamesPerType),
  );
}

export function lsLoadCheckedFieldNames() {
  const { setCheckedFieldNames, selectedType } = useDataStore();

  if (
    localStorage.getItem("checkedFieldNamesPerType") &&
    JSON.parse(localStorage.getItem("checkedFieldNamesPerType"))?.[selectedType]
  ) {
    // if we have already saved some newCheckedFieldNames in the local storage, we reuse it :
    setCheckedFieldNames(
      JSON.parse(localStorage.getItem("checkedFieldNamesPerType"))?.[
        selectedType
      ],
    );
  } else {
    // else we check the Identifier checkbox by default.
    // ("Identifier" may not exist, but it's fine, and much more simple like that)
    setCheckedFieldNames(["Identifier"]);
  }
}

export function lsStoreProjectsPreferencesBase64(preferencesBase64) {
  const { project } = useAppStore();

  // 1st, get ProjectsPreferencesBase64 in local storage, if any :
  let ProjectsPreferencesBase64 = localStorage.getItem(
    "lsProjectsPreferencesBase64",
  )
    ? JSON.parse(localStorage.getItem("lsProjectsPreferencesBase64"))
    : {};

  // 2nd add or replace preferences for current project
  ProjectsPreferencesBase64[project] = preferencesBase64;

  // 3rd, store it in local storage :
  localStorage.setItem(
    "lsProjectsPreferencesBase64",
    JSON.stringify(ProjectsPreferencesBase64),
  );
}

export function lsLoadProjectsPreferencesBase64() {
  const { project } = useAppStore();

  if (
    localStorage.getItem("lsProjectsPreferencesBase64") &&
    JSON.parse(localStorage.getItem("lsProjectsPreferencesBase64"))?.[project]
  ) {
    return JSON.parse(localStorage.getItem("lsProjectsPreferencesBase64"))?.[
      project
    ];
  } else {
    console.log("No preferences found for ", project);
  }
}
