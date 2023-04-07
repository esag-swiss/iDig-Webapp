import { reactive, computed } from "vue";

const dataState = reactive({
  allTrenches: null,
  allTypes: null,
  allFields: null,
  fetchedPreferencesBase64: null,
});

export const useDataState = () => {
  const setAllTrenches = (allTrenches) => {
    dataState.allTrenches = allTrenches;
  };

  const setAllTypes = (allTypes) => {
    dataState.allTypes = allTypes;
  };

  const setAllFields = (allFields) => {
    dataState.allFields = allFields;
  };

  const setFetchedPreferencesBase64 = (fetchedPreferencesBase64) => {
    dataState.fetchedPreferencesBase64 = fetchedPreferencesBase64;
  };

  return {
    // Setters:
    setAllTrenches,
    setAllTypes,
    setAllFields,
    setFetchedPreferencesBase64,
    // Getters, raw stored data:
    allTrenches: computed(() => dataState.allTrenches),
    allTypes: computed(() => dataState.allTypes),
    allFields: computed(() => dataState.allFields),
    fetchedPreferencesBase64: computed(
      () => dataState.fetchedPreferencesBase64
    ),
    // Getters, transformed stored data:
    firstTrench: computed(() => dataState?.allTrenches[0]),
  };
};
