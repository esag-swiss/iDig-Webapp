import { defineStore } from "pinia";
import {
  apiFetchPreferences,
  apiFetchProjectTrenchesNames,
} from "@/services/ApiClient";
import { allTrenchesPerProject } from "@/assets/allTrenchesPerProject";
import { useAppStore } from "@/stores/app";

export const useDataStore = defineStore("data", {
  state: () => ({
    projectPreferencesCRS: "WGS84",
    projectPreferencesTypes: null,
    projectPreferencesFields: null,
    projectPreferencesBase64: null,
    projectTrenchesNames: null,
    selectedType: "Artifact",
    checkedTrenchesData: {},
    checkedTrenchesNames: [],
    checkedTrenchesItems: [],
    searchText: "",
    tableColumns: [
      // columns by default before any selection /!\ label are needed to display headers in TheTableLite
      { field: "IdentifierUUID", sortable: true, label: "UUID", isKey: true },
    ],
  }),

  getters: {
    firstTrench(state) {
      return state.projectTrenchesNames?.[0];
    },

    checkedTrenchesItemsSelectedType(state) {
      return state.checkedTrenchesItems.filter((item) =>
        item.Type.includes(state.selectedType)
      );
    },

    checkedTrenchesItemsSelectedTypeAndSearched(state) {
      // Early exit if no search text provided
      if (state.searchText === "") {
        return state.checkedTrenchesItemsSelectedType;
      }

      // If the search text contains a colon, then we filter by property, otherwise, we search all properties
      return state.searchText.includes(":")
        ? filterByProperty(state)
        : filterAllProperties(state);

      // Filter items based on a specific property mentioned before the colon in the searchText
      // Warning !! It is currently filtering only to the english name, which may not be the table displayed name
      function filterByProperty(state) {
        const [property, value] = state.searchText.split(":");

        // First, filter items that have the requested property
        return state.checkedTrenchesItemsSelectedType
          .filter((item) => property in item)
          .filter((item) =>
            item[property].toLowerCase().includes(value.toLowerCase())
          );
      }

      // Filter items by checking all properties for the searchText
      function filterAllProperties(state) {
        const searchText = state.searchText.toLowerCase();

        return state.checkedTrenchesItemsSelectedType.filter((item) =>
          Object.values(item).some((val) =>
            String(val).toLowerCase().includes(searchText)
          )
        );
      }
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
          //to handle one case of invalid json file that occured at least once :
          preferences = JSON.parse(
            preferences.replace(/},\n\t\t\t\t\t\t}/g, "}}")
          );
        }

        if (preferences.crs) {
          this.setProjectPreferencesCrs(preferences.crs);
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

    setProjectPreferencesCrs(projectPreferencesCRS) {
      this.projectPreferencesCRS = projectPreferencesCRS;
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

    setTableColumns(tableColumns) {
      this.tableColumns = tableColumns;
    },

    setSearchText(searchText) {
      this.searchText = searchText;
    },
  },
});
