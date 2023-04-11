import { reactive, computed } from "vue";

const appState = reactive({
  username: "",
  password: "",
  server: "",
  project: "",
  lang: "fr",
  isLoaded: false,
});

export const useAppState = () => {
  const setAppState = (key, value) => {
    if (!(key in appState)) {
      console.error(
        "invalid key in setAppState. Valid keys are : ",
        Object.keys(appState)
      );
    }

    appState[key] = value;
  };

  return {
    setAppState,
    appState: computed(() => appState),
  };
};
