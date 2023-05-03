import { reactive, computed } from "vue";

const dataStateDefaultValue = {
  projectTrenchesNames: null,
  projectPreferencesTypes: null,
  projectPreferencesFields: null,
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

  const setProjectPreferencesTypes = (projectPreferencesTypes) => {
    dataState.projectPreferencesTypes = projectPreferencesTypes;
  };

  const setProjectPreferencesFields = (projectPreferencesFields) => {
    dataState.projectPreferencesFields = projectPreferencesFields;
  };

  const setPreferencesBase64 = (preferencesBase64) => {
    dataState.preferencesBase64 = preferencesBase64;
  };

  return {
    resetDataState,
    // Setters:
    setProjectTrenchesNames,
    setProjectPreferencesTypes,
    setProjectPreferencesFields,
    setPreferencesBase64,
    // Getters, raw stored data:

    projectTrenchesNames: computed(() => dataState.projectTrenchesNames),
    projectPreferencesTypes: computed(() => dataState.projectPreferencesTypes),
    projectPreferencesFields: computed(
      () => dataState.projectPreferencesFields
    ),
    preferencesBase64: computed(() => dataState.preferencesBase64),
    // Getters, transformed stored data:
    firstTrench: computed(() => dataState?.projectTrenchesNames?.[0]),
  };
};
