import { useAppStore } from "@/stores/app";
import { useDataStore } from "@/stores/data";
import { Notify } from "quasar";

function lsStoreConnection() {
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

function lsStoreProfiles(profile, server, project, username, password) {
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
function lsUpdateProfile(profile, key, value) {
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

function lsLoadCurrentProfile () {
  return localStorage.getItem("currentProfile") ?? "";
};
function lsLoadUsername () {
  return localStorage.getItem("username") ?? "";
};
function lsLoadPassword () {
  return localStorage.getItem("password") ?? "";
};
function lsLoadServer () {
  return localStorage.getItem("server") ?? "";
};
function lsLoadProject () {
  return localStorage.getItem("project") ?? "";
};
function lsLoadCheckedTrenchesVersion () {
  return localStorage.getItem("lsLocalTrenchesVersion")
    ? JSON.parse(localStorage.getItem("lsLocalTrenchesVersion"))
    : {};
};
function lsStoreLang() {
  const { lang, currentProfile } = useAppStore();
  lsUpdateProfile(currentProfile, "lang", lang);
  localStorage.setItem("lang", lang);
}
function lsLoadLang () {
  return localStorage.getItem("lang") ?? "fr";
};

function lsStoreCheckedFieldNames() {
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

function lsLoadCheckedFieldNames() {
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

function lsStoreFavoritePlans(favoritePlanIds) {
  const { project } = useAppStore();

  let favoritePlansPerProject = localStorage.getItem("lsFavoritePlans")
    ? JSON.parse(localStorage.getItem("lsFavoritePlans"))
    : {};

  favoritePlansPerProject[project] = favoritePlanIds;

  localStorage.setItem(
    "lsFavoritePlans",
    JSON.stringify(favoritePlansPerProject),
  );
}

function lsLoadFavoritePlans() {
  const { project } = useAppStore();

  if (
    localStorage.getItem("lsFavoritePlans") &&
    JSON.parse(localStorage.getItem("lsFavoritePlans"))?.[project]
  ) {
    return JSON.parse(localStorage.getItem("lsFavoritePlans"))?.[project];
  }
  return [];
}

function lsStorePlansGroupBy(groupBy) {
  localStorage.setItem("lsPlansGroupBy", groupBy);
}

function lsLoadPlansGroupBy() {
  return localStorage.getItem("lsPlansGroupBy") ?? "trench";
}

function lsStoreProjectsPreferencesBase64(preferencesBase64) {
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

export {
  lsStoreConnection,
  lsStoreProfiles,
  lsLoadCurrentProfile,
  lsLoadUsername,
  lsLoadPassword,
  lsLoadServer,
  lsLoadProject,
  lsLoadCheckedTrenchesVersion,
  lsStoreLang,
  lsLoadLang,
  lsStoreCheckedFieldNames,
  lsLoadCheckedFieldNames,
  lsStoreFavoritePlans,
  lsLoadFavoritePlans,
  lsStorePlansGroupBy,
  lsLoadPlansGroupBy,
  lsStoreProjectsPreferencesBase64,
}