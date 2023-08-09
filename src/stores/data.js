import { defineStore } from "pinia";

export const useDataStore = defineStore("data", {
  state: () => ({
    projectTrenchesNames: null,
    projectPreferencesCRS: "WGS84",
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
  }),

  getters: {
    firstTrench: (state) => state.projectTrenchesNames?.[0],
  },

  actions: {
    setProjectTrenchesNames(projectTrenchesNames) {
      this.projectTrenchesNames = projectTrenchesNames;
    },

    setProjectPreferencesCrs(projectPreferencesCRS) {
      this.projectPreferencesCRS = projectPreferencesCRS;
    },

    setProjectPreferencesTypes(projectPreferencesTypes) {
      this.projectPreferencesTypes = projectPreferencesTypes;
    },

    setProjectPreferencesFields(projectPreferencesFields) {
      this.projectPreferencesFields = projectPreferencesFields;
    },

    setProjectPreferencesBase64(projectPreferencesBase64) {
      this.projectPreferencesBase64 = projectPreferencesBase64;
    },

    setSelectedType(selectedType) {
      this.selectedType = selectedType;
    },

    setCheckedTrenchesItems(checkedTrenchesItems) {
      this.checkedTrenchesItems = checkedTrenchesItems;
    },

    setFilteredTrenchesItemsStore(filteredTrenchesItemsStore) {
      this.filteredTrenchesItemsStore = filteredTrenchesItemsStore;
    },

    setTableColumns(tableColumns) {
      this.tableColumns = tableColumns;
    },
  },
});
