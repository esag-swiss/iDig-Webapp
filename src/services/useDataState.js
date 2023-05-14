import { reactive, computed } from "vue";

const dataStateDefaultValue = {
  projectTrenchesNames: null,
  projectPreferencesTypes: null,
  projectPreferencesFields: null,
  projectPreferencesBase64: null,
  selectedType: "Artifact",
  filteredTrenchesItemsStore: null,
  tableColumns: [
    // columns by default before any selection /!\ label needed to display headers
    { field: "Source", sortable: true, label: "Secteur" },
    { field: "Title", sortable: true, label: "Titre" },
    {
      field: "Identifier",
      isKey: true,
      sortable: true,
      label: "Identifiant",
    },
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
    selectedType: computed(() => dataState.selectedType),
    filteredTrenchesItemsStore: computed(
      () => dataState.filteredTrenchesItemsStore
    ),
    tableColumns: computed(() => dataState.tableColumns),

    // Getters, transformed stored data:
    firstTrench: computed(() => dataState?.projectTrenchesNames?.[0]),
  };
};
