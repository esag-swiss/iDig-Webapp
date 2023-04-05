import { reactive, computed } from "vue";

const dataState = reactive({
  allTrenches: null,
  allTypes: null,
  allFields: null,
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

  return {
    // Setters:
    setAllTrenches,
    setAllTypes,
    setAllFields,
    // Getters, raw stored data:
    allTrenches: computed(() => dataState.allTrenches),
    allTypes: computed(() => dataState.allTypes),
    allFields: computed(() => dataState.allFields),
    // Getters, transformed stored data:
    firstTrench: computed(() => dataState?.allTrenches[0]),
  };
};
