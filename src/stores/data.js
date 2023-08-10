import { defineStore } from "pinia";
import {
  apiFetchPreferences,
  apiFetchProjectTrenchesNames,
} from "@/services/ApiClient";
import { allTrenchesPerProject } from "@/assets/allTrenchesPerProject";
import { useAppStore } from "@/stores/app";

export const useDataStore = defineStore("data", {
  state: () => ({
    projectPreferencesTypes: null,
    projectPreferencesFields: null,
    projectPreferencesBase64: null,
    projectTrenchesNames: null,
    selectedType: "Artifact",
    checkedTrenchesData: {},
    checkedTrenchesNames: [],
    checkedTrenchesItems: [],
    filteredTrenchesItemsStore: null, // TODO a virer
    tableColumns: [
      // columns by default before any selection /!\ label are needed to display headers in TheTableLite
      { field: "IdentifierUUID", sortable: true, label: "UUID", isKey: true },
    ],
  }),

  getters: {
    firstTrench(state) {
      return state.projectTrenchesNames?.[0];
    },
    filteredTrenchesItems(state) {
      return state.checkedTrenchesItems.filter((item) =>
        item.Type.includes(state.selectedType)
      );
    },
  },

  actions: {
    // ACTIONS TO FETCH FROM API AND SET :
    async fetchProjectTrenchesNames() {
      return apiFetchProjectTrenchesNames().then((response) => {
        this.setProjectTrenchesNames(response.data);
      });
    },

    fetchProjectTrenchesNamesFromFile() {
      const { project } = useAppStore();
      const projectTrenchesNames = allTrenchesPerProject[project];
      if (!projectTrenchesNames) {
        alert(`Trenches for project ${project} not found.`);
        throw Error(`Trenches for project ${project} not found.`);
      }
      this.setProjectTrenchesNames(projectTrenchesNames);
    },

    async fetchPreferences(trench) {
      return apiFetchPreferences(trench).then((response) => {
        // Store preferences in base64 format, because it will be necessary to resend them when modifying an item
        this.setProjectPreferencesBase64(response.data.preferences);

        let preferences = decodeURIComponent(
          escape(window.atob(response.data.preferences))
        );

        try {
          preferences = JSON.parse(preferences);
        } catch (e) {
          console.error(e);
          preferences = JSON.parse(
            preferences.replace(/},\n\t\t\t\t\t\t}/g, "}}")
          );
        }

        this.setProjectPreferencesTypes(preferences.types);
        this.setProjectPreferencesFields(preferences.fields);

        const { setIsLoaded } = useAppStore();
        setIsLoaded(true);
      });
    },

    // ACTIONS : STATES SETTERS :
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

    setProjectTrenchesNames(projectTrenchesNames) {
      this.projectTrenchesNames = projectTrenchesNames;
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
