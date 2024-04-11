import { defineStore } from "pinia";
import {
  apiFetchPreferences,
  apiFetchProjectTrenchesNames,
  apiFetchIdigTrenchesNames,
  apiFetchSurvey,
  apiFetchTrenchVersion,
} from "@/services/ApiClient";
import { allTrenchesPerProject } from "@/assets/allTrenchesPerProject";
import { useAppStore } from "@/stores/app";
import { Notify } from "quasar";
import { lsLoadCheckedTrenchesVersion } from "@/services/localStorageManager";
import {
  openDB,
  storeDataInIndexedDB,
  readDataInIndexedDB,
} from "@/services/indexedDbManager";

export const useDataStore = defineStore("data", {
  state: () => ({
    projectPreferencesCRS: "WGS84",
    projectPreferencesTypes: null,
    projectPreferencesFields: null,
    projectPreferencesBase64: null,
    projectTrenchesNames: null,
    checkedTrenchesNames: [],
    checkedTrenchesData: {},
    checkedTrenchesVersion: lsLoadCheckedTrenchesVersion(),
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
      return state.projectTrenchesNames?.reverse()[0];
    },

    checkedTrenchesItems(state) {
      return [].concat(...Object.values(state.checkedTrenchesData));
    },

    checkedTrenchesItemsPlans(state) {
      return state.checkedTrenchesItems.filter((item) =>
        item?.Type?.includes("Plan")
      );
    },
    checkedTrenchesItemsSelectedType(state) {
      return state.checkedTrenchesItems.filter((item) =>
        item?.Type?.includes(state.selectedType)
      );
    },

    checkedTrenchesItemsSelectedTypeAndSearched(state) {
      // Early exit if no search text provided
      if (state.searchText === "") {
        return state.checkedTrenchesItemsSelectedType;
      }

      if (state.searchText.includes("AND")) {
        let searchTerms = state.searchText.replace(/\s+/g, "").split("AND");
        let currentResult = state.checkedTrenchesItemsSelectedType;
        // Apply "AND" logic to each term
        for (let i = 0; i < searchTerms.length; i++) {
          currentResult = currentResult.filter((item) =>
            searchTerms[i].includes(":")
              ? filterByProperty(searchTerms[i]).includes(item)
              : filterAllProperties(searchTerms[i]).includes(item)
          );
        }
        return currentResult;
      } else if (state.searchText.includes("OR")) {
        let searchTerms = state.searchText.replace(/\s+/g, "").split("OR");
        let currentResult = [];

        // Apply "OR" logic to each term
        for (let i = 0; i < searchTerms.length; i++) {
          currentResult = currentResult.concat(
            state.checkedTrenchesItemsSelectedType.filter((item) =>
              searchTerms[i].includes(":")
                ? filterByProperty(searchTerms[i]).includes(item)
                : filterAllProperties(searchTerms[i]).includes(item)
            )
          );
        }

        // Remove duplicates from the result (if any)
        currentResult = Array.from(new Set(currentResult));
        return currentResult;
      } else {
        // If the search text contains a colon, then we filter by property, otherwise, we search all properties
        return state.searchText.includes(":")
          ? filterByProperty(state.searchText)
          : filterAllProperties(state.searchText);
      }

      // Filter items based on a specific property mentioned before the colon in the searchText
      // Warning !! It is currently filtering only to the english name, which may not be the table displayed name
      function filterByProperty(searchString) {
        const [property, value] = searchString.split(":");

        let obj = state.projectPreferencesFieldsWithTranslation;
        function findKeyByValue(obj, targetValue) {
          for (const key in obj) {
            if (
              obj.hasOwnProperty(key) &&
              obj[key].toLowerCase() === targetValue.toLowerCase()
            ) {
              return key;
            }
          }
        }
        let propertyName = findKeyByValue(obj, property);

        // First, filter items that have the requested property
        return state.checkedTrenchesItemsSelectedType
          .filter((item) => propertyName in item)
          .filter((item) =>
            item[propertyName].toLowerCase().includes(value.toLowerCase())
          );
      }

      // Filter items by checking all properties for the searchText
      function filterAllProperties(searchString) {
        return state.checkedTrenchesItemsSelectedType.filter((item) =>
          Object.values(item).some((val) =>
            String(val).toLowerCase().includes(searchString.toLowerCase())
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

    async fetchIdigTrenchesNames() {
      const { project } = useAppStore();
      return apiFetchIdigTrenchesNames().then((response) => {
        const TrenchesNamesForCurrentProject = response.data.trenches.filter(
          (trench) => trench.project === project
        );
        this.setProjectTrenchesNames(
          TrenchesNamesForCurrentProject.map((trench) => trench.name)
        );
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
      const { setIsLoaded } = useAppStore();
      const processPreferences = (base64Preferences) => {
        let preferences = "";
        try {
          preferences = JSON.parse(
            base64Preferences
              .replace(/},\n\t+}/g, "}}")
              .replace(/},\n\t+]/g, "}]")
          );
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
      };

      await apiFetchTrenchVersion(trench).then((response) => {
        if (response.data[0].version !== this.checkedTrenchesVersion[trench]) {
          // case curent version and preferences not present locally = fetch from server
          return apiFetchPreferences(trench).then((response) => {
            // Store locally preferences in case of pushing trenches
            this.setProjectPreferencesBase64(response.data.preferences);
            // Store preferences also in localStorage for next session
            localStorage.setItem(
              "projectPreferencesBase64",
              response.data.preferences
            );

            let preferences = decodeURIComponent(
              escape(window.atob(response.data.preferences))
            );
            processPreferences(preferences);
            setIsLoaded(true);
          });
        } else {
          // case curent version and preferences present locally
          this.setProjectPreferencesBase64(
            localStorage.getItem("projectPreferencesBase64")
          );
          let preferences = decodeURIComponent(
            escape(
              window.atob(localStorage.getItem("projectPreferencesBase64"))
            )
          );

          processPreferences(preferences);
          setIsLoaded(true);
        }
      });
    },

    addCheckedTrenchesData(trenchList) {
      trenchList.map(async (trenchName) => {
        try {
          const response = await apiFetchTrenchVersion(trenchName);

          if (
            response.data.length >= 1 &&
            response.data[0].version === this.checkedTrenchesVersion[trenchName]
          ) {
            const db = await openDB();
            const localSurvey = await readDataInIndexedDB(db, trenchName);
            this.checkedTrenchesData[trenchName] = JSON.parse(localSurvey);
          } else {
            await fetchDataAndUpdateStorage(trenchName);
          }
        } catch (error) {
          console.error(`Error processing trench ${trenchName}: ${error}`);
        }
      });

      const fetchDataAndUpdateStorage = async (trenchName) => {
        try {
          const response = await apiFetchSurvey(trenchName);

          if (!response) {
            console.error(`Error: Empty response for trench ${trenchName}`);
            return;
          }

          this.checkedTrenchesVersion[trenchName] = response.data.version;
          if (response.data.surveys) {
            this.checkedTrenchesData[trenchName] = this.addTrenchNameToItems(
              response.data.surveys,
              trenchName
            );
          }

          // Update localStorage
          localStorage.setItem(
            "localTrenchesVersion",
            JSON.stringify(this.checkedTrenchesVersion)
          );

          // Update IndexedDB
          const db = await openDB();
          await storeDataInIndexedDB(
            db,
            trenchName,
            this.checkedTrenchesData[trenchName]
          );
        } catch (error) {
          console.error(
            `Error fetching data for trench ${trenchName}: ${error}`
          );
        }
      };
    },
    addTrenchNameToItems(items, trenchName) {
      return items.map((obj) => {
        // Crée un nouvel objet avec les propriétés de l'objet d'origine
        // et ajoute la nouvelle propriété "Trench"
        return { ...obj, Trench: trenchName };
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
