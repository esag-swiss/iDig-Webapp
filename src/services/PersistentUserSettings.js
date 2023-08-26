import { useAppStore } from "@/stores/app";
import { useDataStore } from "@/stores/data";

export function storePersistentUserConnection() {
  const { server, project, username, password } = useAppStore();
  localStorage.setItem("server", server);
  localStorage.setItem("project", project);
  localStorage.setItem("username", username);
  localStorage.setItem("password", password);
}

export function storePersistentUserLang() {
  const { lang } = useAppStore();
  localStorage.setItem("lang", lang);
}

export function lsStoreCheckedFieldNames() {
  const { checkedFieldNames, selectedType } = useDataStore();

  // 1st, get the full checked array saved in local storage, if any :
  let checkedFieldNamesPerType = localStorage.checkedFieldNamesPerType
    ? JSON.parse(localStorage.checkedFieldNamesPerType)
    : {};
  // 2nd, in it, add or replace, for current type, the current checkbox array :
  checkedFieldNamesPerType[selectedType] = checkedFieldNames;
  // 3rd, store it in local storage :
  localStorage.setItem(
    "checkedFieldNamesPerType",
    JSON.stringify(checkedFieldNamesPerType)
  );
}

export function lsLoadCheckedFieldNames() {
  const { setCheckedFieldNames, selectedType } = useDataStore();

  if (
    localStorage.checkedFieldNamesPerType &&
    JSON.parse(localStorage.checkedFieldNamesPerType)?.[selectedType]
  ) {
    // if we have already saved some newCheckedFieldNames in the local storage, we reuse it :
    setCheckedFieldNames(
      JSON.parse(localStorage.checkedFieldNamesPerType)?.[selectedType]
    );
  } else {
    // else we check the Identifier checkbox by default.
    // ("Identifier" may not exist, but it's fine, and much more simple like that)
    setCheckedFieldNames(["Identifier"]);
  }
}
