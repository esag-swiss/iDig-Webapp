import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    loadingCount: 0,
    lang: localStorage.lang ?? "fr",
    isLoaded: false,
    // Load local storage values for these elements, or empty string if not exist :
    username: localStorage.username ?? "",
    password: localStorage.password ?? "",
    server: localStorage.server ?? "",
    project: localStorage.project ?? "",
  }),

  actions: {
    incrementLoadingCount() {
      this.loadingCount += 1;
    },
    decrementLoadingCount() {
      this.loadingCount -= 1;
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
  },
});
