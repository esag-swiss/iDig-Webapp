import { useAppState } from "@/services/useAppState";

export function storePersistentUserSettings() {
  const { appState } = useAppState();
  const appStateUnwrapped = appState.value;

  localStorage.setItem("server", appStateUnwrapped.server);
  localStorage.setItem("project", appStateUnwrapped.project);
  localStorage.setItem("username", appStateUnwrapped.username);
  localStorage.setItem("password", appStateUnwrapped.password);
}

export function loadPersistentUserSettingsOrEmptyStrings() {
  const { setAppState } = useAppState();

  setAppState("server", localStorage.server ?? "");
  setAppState("project", localStorage.project ?? "");
  setAppState("username", localStorage.username ?? "");
  setAppState("password", localStorage.password ?? "");
}
