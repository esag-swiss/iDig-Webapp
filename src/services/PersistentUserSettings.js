import { useAppStore } from "@/stores/app";

export function storePersistentUserSettings() {
  const { server, project, username, password } = useAppStore();

  localStorage.setItem("server", server);
  localStorage.setItem("project", project);
  localStorage.setItem("username", username);
  localStorage.setItem("password", password);
}
