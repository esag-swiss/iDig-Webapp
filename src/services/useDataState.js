import { reactive, computed } from "vue";

const dataStateDefaultValue = {
  projectTrenchesNames: null,
  projectPreferencesTypes: null,
  projectPreferencesFields: null,
  projectPreferencesBase64: null,
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

  const setProjectPreferencesBase64 = (projectPreferencesBase64) => {
    dataState.projectPreferencesBase64 = projectPreferencesBase64;
  };

  return {
    resetDataState,
    // Setters:
    setProjectTrenchesNames,
    setProjectPreferencesTypes,
    setProjectPreferencesFields,
    setProjectPreferencesBase64,
    // Getters, raw stored data:

    projectTrenchesNames: computed(() => dataState.projectTrenchesNames),
    projectPreferencesTypes: computed(() => dataState.projectPreferencesTypes),
    projectPreferencesFields: computed(
      () => dataState.projectPreferencesFields
    ),
    projectPreferencesBase64: computed(
      () => dataState.projectPreferencesBase64
    ),
    // Getters, transformed stored data:
    firstTrench: computed(() => dataState?.projectTrenchesNames?.[0]),
  };
};
