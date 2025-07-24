import { defineStore } from "pinia";
import {
  lsLoadCurrentProfile,
  lsLoadLang,
  lsLoadPassword,
  lsLoadProject,
  lsLoadServer,
  lsLoadUsername,
} from "@/services/localStorageManager";

export const useAppStore = defineStore("app", {
  state: () => ({
    loadingCount: 0,
    isLoaded: false,
    isMapMinimized: true,
    isItemSelected: false,
    isArchivedItemsHided: false,
    // Load local storage values lastly used for these elements, or empty string if not exist :
    currentProfile: lsLoadCurrentProfile(),
    lang: lsLoadLang(),
    username: lsLoadUsername(),
    password: lsLoadPassword(),
    server: lsLoadServer(),
    project: lsLoadProject(),
  }),

  actions: {
    incrementLoadingCount() {
      this.loadingCount += 1;
    },
    decrementLoadingCount() {
      this.loadingCount -= 1;
    },

    setCurrentProfile(value) {
      this.currentProfile = value;
    },
    setUsername(value) {
      this.username = value;
    },
    setPassword(value) {
      this.password = value;
    },
    setServer(value) {
      this.server = value;
    },
    setProject(value) {
      this.project = value;
    },
    setLang(value) {
      this.lang = value;
    },
    setIsLoaded(value) {
      this.isLoaded = value;
    },
    setIsMapMinimized(value) {
      this.isMapMinimized = value;
    },
    setIsItemSelected(value) {
      this.isItemSelected = value;
    },
    SetIsArchivedItemsHided(value) {
      this.isArchivedItemsHided = value;
    },
  },
});
