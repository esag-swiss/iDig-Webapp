export function storePersistentUserSettings(
  server,
  project,
  username,
  password,
  lang
) {
  localStorage.setItem("server", server);
  localStorage.setItem("project", project);
  localStorage.setItem("username", username);
  localStorage.setItem("password", password);
  localStorage.setItem("lang", lang);
}

export function getPersistentUserSettingsOrEmptyStrings() {
  return {
    lang: localStorage.lang ?? "",
    server: localStorage.server ?? "",
    project: localStorage.project ?? "",
    username: localStorage.username ?? "",
    password: localStorage.password ?? "",
  };
}