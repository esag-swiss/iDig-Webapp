import { useAppStore } from "@/stores/app";

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
