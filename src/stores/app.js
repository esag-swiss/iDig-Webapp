import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    isLoading: false,
    username: "",
    password: "",
    server: "",
    project: "",
    lang: "fr",
    isLoaded: false,
  }),

  actions: {
    setIsLoading(value) {
      this.isLoading = value;
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
