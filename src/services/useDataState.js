import { reactive, computed } from "vue";

const dataState = reactive({
  allTrenches: null,
  allTypes: null,
});

export const useDataState = () => {
  const setAllTrenches = (allTrenches) => {
    dataState.allTrenches = allTrenches;
  };

  const setAllTypes = (allTypes) => {
    dataState.allTypes = allTypes;
  };

  return {
    // Setters:
    setAllTrenches,
    setAllTypes,
    // Getters, raw stored data:
    allTrenches: computed(() => dataState.allTrenches),
    allTypes: computed(() => dataState.allTypes),
    // Getters, transformed stored data:
    firstTrench: computed(() => dataState?.allTrenches[0]),
  };
};
