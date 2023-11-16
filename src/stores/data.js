import { defineStore } from "pinia";
import {
  apiFetchPreferences,
  apiFetchProjectTrenchesNames,
  apiFetchSurvey,
} from "@/services/ApiClient";
import { allTrenchesPerProject } from "@/assets/allTrenchesPerProject";
import { useAppStore } from "@/stores/app";
import { Notify } from "quasar";

export const useDataStore = defineStore("data", {
  state: () => ({
    projectPreferencesCRS: "WGS84",
    projectPreferencesTypes: null,
    projectPreferencesFields: null,
    projectPreferencesBase64: null,
    projectTrenchesNames: null,
    checkedTrenchesNames: [],
    checkedTrenchesData: {},
    checkedTrenchesVersion: {},
    searchText: "",
    selectedType: "Artifact",
    checkedFieldNames: [],
  }),

  getters: {
    projectPreferencesFieldsWithTranslation(state) {
      const { lang } = useAppStore();
      if (!state.projectPreferencesFields) {
        return {};
      }

      let translatedLabels = state.projectPreferencesFields.map((field) => {
        return field.labels?.[lang] ?? field.label ?? field.field;
      });

      let langKeys = {};
      for (let field of this.projectPreferencesFields) {
        langKeys[field.field] =
          translatedLabels[this.projectPreferencesFields.indexOf(field)];
      }

      return langKeys;
    },

    firstTrench(state) {
      return state.projectTrenchesNames?.[0];
    },

    checkedTrenchesItems(state) {
      let allItem = [];
      Object.values(state.checkedTrenchesData).forEach((data) => {
        allItem.push(...data);
      });
      return allItem;
    }, // Todo simplifier?

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
          let message = `error: default preference file is not a valid json<br/>${e?.message}<br/>`;

          Notify.create({
            type: "negative",
            message,
            html: true,
            timeout: 10000,
          });

          throw e;
        }

        if (preferences.crs) {
          this.setProjectPreferencesCrs(preferences.crs);
        } else if (preferences.project === "Agora") {
          // Agora project doesn't have property CRS
          this.setProjectPreferencesCrs(preferences.project);
        }
        this.setProjectPreferencesTypes(preferences.types);
        this.setProjectPreferencesFields(preferences.fields);

        const { setIsLoaded } = useAppStore();
        setIsLoaded(true);
      });
    },

    addCheckedTrenchesData(trenchList) {
      trenchList.forEach((trenchName) => {
        apiFetchSurvey(trenchName)
          .then((response) => {
            // prepare data to store in session in case of PUSH
            this.checkedTrenchesVersion[trenchName] = response.data.version;
            this.checkedTrenchesData[trenchName] = response.data.surveys;

            // store in session in case of PUSH
            sessionStorage.setItem(
              "checkedTrenchesData",
              JSON.stringify(this.checkedTrenchesData)
            );
            sessionStorage.setItem(
              "checkedTrenchesVersion",
              JSON.stringify(this.checkedTrenchesVersion)
            );
          })
          .catch(() => {
            this.checkedTrenchesNames = this.checkedTrenchesNames.filter(
              (name) => name !== trenchName
            );
          });
      });
    },

    removeCheckedTrenchesData(trenchList) {
      trenchList.forEach((trenchName) => {
        delete this.checkedTrenchesData[trenchName];
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

    setCheckedFieldNames(checkedFieldNames) {
      this.checkedFieldNames = checkedFieldNames;
    },

    setProjectTrenchesNames(projectTrenchesNames) {
      this.projectTrenchesNames = projectTrenchesNames;
    },

    setCheckedTrenchesData(checkedTrenchesData) {
      this.checkedTrenchesData = checkedTrenchesData;
    },

    setCheckedTrenchesVersion(checkedTrenchesVersion) {
      this.checkedTrenchesVersion = checkedTrenchesVersion;
    },

    setCheckedTrenchesNames(checkedTrenchesNames) {
      this.checkedTrenchesNames = checkedTrenchesNames;
    },

    setSearchText(searchText) {
      this.searchText = searchText;
    },
  },
});
