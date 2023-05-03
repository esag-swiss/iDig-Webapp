import { reactive, computed } from "vue";

const dataStateDefaultValue = {
  projectTrenchesNames: null,
  allTypes: null,
  allFields: null,
  preferencesBase64: null,
};
let dataState = reactive({ ...dataStateDefaultValue });

export const useDataState = () => {
  const resetDataState = () => {
    dataState = reactive({ ...dataStateDefaultValue });
  };

  const setProjectTrenchesNames = (projectTrenchesNames) => {
    dataState.projectTrenchesNames = projectTrenchesNames;
  };

  const setAllTypes = (allTypes) => {
    dataState.allTypes = allTypes;
  };

  const setAllFields = (allFields) => {
    dataState.allFields = allFields;
  };

  const setPreferencesBase64 = (preferencesBase64) => {
    dataState.preferencesBase64 = preferencesBase64;
  };

  return {
    resetDataState,
    // Setters:
    setProjectTrenchesNames,
    setAllTypes,
    setAllFields,
    setPreferencesBase64,
    // Getters, raw stored data:

    projectTrenchesNames: computed(() => dataState.projectTrenchesNames),
    allTypes: computed(() => dataState.allTypes),
    allFields: computed(() => dataState.allFields),
    preferencesBase64: computed(() => dataState.preferencesBase64),
    // Getters, transformed stored data:
    firstTrench: computed(() => dataState?.projectTrenchesNames?.[0]),
  };
};
