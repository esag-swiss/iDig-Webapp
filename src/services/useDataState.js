import { reactive, computed } from "vue";

const dataState = reactive({
  allTrenches: null,
});

export const useDataState = () => {
  const setAllTrenches = (allTrenches) => {
    dataState.allTrenches = allTrenches;
  };

  return {
    setAllTrenches,
    allTrenches: computed(() => dataState.allTrenches),
    firstTrench: computed(() => dataState?.allTrenches[0]),
  };
};
