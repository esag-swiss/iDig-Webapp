import { reactive, computed } from "vue";

const dataStateDefaultValue = {
  projectTrenchesNames: null,
  projectPreferencesTypes: null,
  projectPreferencesFields: null,
  projectPreferencesBase64: null,
  selectedType: "Artifact",
  checkedTrenchesItems: null,
  filteredTrenchesItemsStore: null,
  tableColumns: [
    // columns by default before any selection /!\ label are needed to display headers in TheTableLite
    { field: "IdentifierUUID", sortable: true, label: "UUID", isKey: true },
  ],
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

  const setSelectedType = (selectedType) => {
    dataState.selectedType = selectedType;
  };
  const setCheckedTrenchesItems = (checkedTrenchesItems) => {
    dataState.checkedTrenchesItems = checkedTrenchesItems;
  };
  const setFilteredTrenchesItemsStore = (filteredTrenchesItemsStore) => {
    dataState.filteredTrenchesItemsStore = filteredTrenchesItemsStore;
  };
  const settableColumns = (tableColumns) => {
    dataState.tableColumns = tableColumns;
  };

  return {
    resetDataState,
    // Setters:
    setProjectTrenchesNames,
    setProjectPreferencesTypes,
    setProjectPreferencesFields,
    setProjectPreferencesBase64,
    setSelectedType,
    setCheckedTrenchesItems,
    setFilteredTrenchesItemsStore,
    settableColumns,

    // Getters, raw stored data:
    projectTrenchesNames: computed(() => dataState.projectTrenchesNames),
    projectPreferencesTypes: computed(() => dataState.projectPreferencesTypes),
    projectPreferencesFields: computed(
      () => dataState.projectPreferencesFields
    ),
    projectPreferencesBase64: computed(
      () => dataState.projectPreferencesBase64
    ),
    checkedTrenchesItems: computed(() => dataState.checkedTrenchesItems),
    selectedType: computed(() => dataState.selectedType),
    filteredTrenchesItemsStore: computed(
      () => dataState.filteredTrenchesItemsStore
    ),
    tableColumns: computed(() => dataState.tableColumns),

    // Getters, transformed stored data:
    firstTrench: computed(() => dataState?.projectTrenchesNames?.[0]),
  };
};
