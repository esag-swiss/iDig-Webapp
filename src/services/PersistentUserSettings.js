import { useAppStore } from "@/stores/app";

export function storePersistentUserSettings() {
  const { server, project, username, password } = useAppStore();

  localStorage.setItem("server", server);
  localStorage.setItem("project", project);
  localStorage.setItem("username", username);
  localStorage.setItem("password", password);
}

export function loadPersistentUserSettingsOrEmptyStrings() {
  const { setServer, setProject, setUsername, setPassword } = useAppStore();

  setServer(localStorage.server ?? "");
  setProject(localStorage.project ?? "");
  setUsername(localStorage.username ?? "");
  setPassword(localStorage.password ?? "");
}
