import { defineStore } from "pinia";
import {
  apiFetchPreferences,
  apiFetchIdigTrenchesNames,
  apiFetchSurvey,
  apiFetchTrenchVersion,
} from "@/services/ApiClient";
import { useAppStore } from "@/stores/app";
import { Notify } from "quasar";
import {
  lsLoadCheckedTrenchesVersion,
  lsStoreProjectsPreferencesBase64,
} from "@/services/localStorageManager";
import {
  openDB,
  storeDataInIndexedDB,
  readDataInIndexedDB,
} from "@/services/indexedDbManager";
import { fieldsSchema } from "@/assets/nativeFields";

export const useDataStore = defineStore("data", {
  state: () => ({
    projectPreferencesCRS: "WGS84",
    projectPreferencesTypes: null,
    projectPreferencesFields: null,
    projectPreferencesBase64: null,
    projectTrenchesNames: null,
    projectTrenchesRights: null,
    checkedTrenchesNames: [],
    checkedTrenchesData: {},
    checkedTrenchesVersion: lsLoadCheckedTrenchesVersion(),
    searchText: "",
    syncPatches: "",
    syncTrench: "",
    syncNewVersion: "",
    selectedType: "Artifact",
    checkedFieldNames: [],
  }),

  getters: {
    projectPreferencesTypesForSelect(state) {
      const { lang } = useAppStore();
      let options = state.projectPreferencesTypes.map((field) => {
        return {
          value: field.type,
          label: field.labels[lang],
          subtype: field.subtype,
        };
      });
      return options;
    },

    projectPreferencesTypesForOption(state) {
      const { lang } = useAppStore();
      let options = state.projectPreferencesTypes.map((field) => {
        return {
          label: field.labels[lang],
          value: {
            type: field.type,

            subtype: field.subtype,
          },
        };
      });
      return options;
    },

    projectPreferencesTypesTranslation(state) {
      const { lang } = useAppStore();
      let options = {};
      state.projectPreferencesTypes.forEach((field) => {
        options[field.type] = field.labels[lang];
        // Si un subtype est défini, ajout de la traduction pour le subtype
        if (field.subtype) {
          options[field.subtype] = field.labels[lang] ?? options[field.subtype];
        }
      });

      return options;
    },

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

      if (fieldsSchema.Subtype) {
        //
        const subtypeLabel = fieldsSchema.Subtype.labels?.[lang] ?? "Subtype";
        langKeys = { ...langKeys, Subtype: subtypeLabel };
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
      // Filtrage par Type
      let filteredItems = state.checkedTrenchesItems.filter((item) =>
        item?.Type?.includes(state.selectedType)
      );

      // Si aucun élément n'est trouvé avec Type, filtrer par Subtype
      if (filteredItems.length === 0) {
        filteredItems = state.checkedTrenchesItems.filter((item) =>
          item?.Subtype?.includes(state.selectedType)
        );
      }

      return filteredItems;
    },

    checkedTrenchesItemsSelectedTypeAndSearched(state) {
      // Early exit if no search text provided
      if (state.searchText.trim() === "") {
        return state.checkedTrenchesItemsSelectedType;
      }

      const searchText = state.searchText.trim();
      let result = [];

      // Séparation en groupes utilisant le OR
      const orGroups = searchText.split(/\sOR\s/).map((group) => group.trim());

      // Evaluation des groupes avec l'opérateur AND en priorité
      for (const group of orGroups) {
        let andTerms = group.split(/\sAND\s/).map((term) => term.trim());
        let andResult = state.checkedTrenchesItemsSelectedType;

        // Appliquer le filtrage pour chaque terme de la condition AND
        for (let term of andTerms) {
          andResult = searchWithTerm(andResult, term);
        }

        // Concaténer les résultats de la condition AND avec les résultats globaux
        result = result.concat(andResult);
      }

      // Supprimer les doublons du résultat final
      return Array.from(new Set(result));

      // Fonction auxiliaire pour effectuer une recherche avec un seul terme
      function searchWithTerm(items, term) {
        return term.includes(":")
          ? filterByProperty(items, term)
          : filterAllProperties(items, term);
      }

      // Filtre par propriété spécifique
      function filterByProperty(items, searchString) {
        let [searchProperty, searchText] = searchString.split(":");
        searchText = searchText.trim();

        // Vérifiez si le texte de recherche est sensible à la casse
        const isCaseSensitive =
          searchText.startsWith('"') && searchText.endsWith('"');

        // Supprimez les guillemets si présents
        if (isCaseSensitive) {
          searchText = searchText.substring(1, searchText.length - 1);
        } else {
          searchText = searchText
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        }

        // Traduire la clé si nécessaire
        let translationTab = state.projectPreferencesFieldsWithTranslation;
        const propertyName = findRawKey(translationTab, searchProperty.trim());

        if (!propertyName) {
          return [];
        } // Si la propriété n'existe pas, retourner un tableau vide

        return items.filter((item) => {
          if (!item.hasOwnProperty(propertyName)) {
            return false;
          }
          const value = String(item[propertyName]);
          return isCaseSensitive
            ? value.includes(searchText)
            : value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .includes(searchText);
        });
      }

      // Filtre par toutes les propriétés
      function filterAllProperties(items, searchString) {
        let searchText = searchString.trim();

        // Vérifiez si le texte de recherche est sensible à la casse
        const isCaseSensitive =
          searchText.startsWith('"') && searchText.endsWith('"');

        // Supprimez les guillemets si présents
        if (isCaseSensitive) {
          searchText = searchText.substring(1, searchText.length - 1);
        } else {
          searchText = searchText
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        }

        return items.filter((item) =>
          Object.values(item).some((val) =>
            isCaseSensitive
              ? String(val).includes(searchText)
              : String(val)
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .includes(searchText)
          )
        );
      }

      // Fonction pour trouver la clé brute basée sur la traduction
      function findRawKey(obj, searchProperty) {
        for (const key in obj) {
          if (obj[key].toLowerCase() === searchProperty.toLowerCase()) {
            return key;
          }
        }
        return searchProperty;
      }
    },
  },

  actions: {
    async fetchIdigTrenchesNames() {
      const { project } = useAppStore();
      return apiFetchIdigTrenchesNames().then((response) => {
        const TrenchesNamesForCurrentProject = response.data.trenches.filter(
          (trench) => trench.project === project
        );
        this.setProjectTrenchesNames(
          TrenchesNamesForCurrentProject.map((trench) => trench.name)
        );
        this.setProjectTrenchesRights(
          TrenchesNamesForCurrentProject.reduce((acc, trench) => {
            acc[trench.name] = trench.read_only;
            return acc;
          }, {})
        );
      });
    },

    async fetchAndLoadPreferences(trench) {
      const { setIsLoaded } = useAppStore();
      const parseAndLoadPreferences = (base64Preferences) => {
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

      return apiFetchPreferences(trench).then((response) => {
        // Store locally preferences in case of pushing trenches
        this.setProjectPreferencesBase64(response.data.preferences);
        // Store preferences also in localStorage for next session
        lsStoreProjectsPreferencesBase64(response.data.preferences);

        let preferences = decodeURIComponent(
          escape(window.atob(response.data.preferences))
        );
        parseAndLoadPreferences(preferences);
        setIsLoaded(true);
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

    async UpdateSyncTrenchData(trenchName, surveys) {
      this.checkedTrenchesData[trenchName] = this.addTrenchNameToItems(
        surveys,
        trenchName
      );

      // Update IndexedDB
      const db = await openDB();
      await storeDataInIndexedDB(
        db,
        trenchName,
        this.checkedTrenchesData[trenchName]
      );
    },

    addTrenchNameToItems(items, trenchName) {
      return items.map((obj) => {
        // add property 'Trench' to item object to indicate the trench it is originated and since property "source" doesn't seems to be consistent.
        return { ...obj, Trench: trenchName };
      });
    },
    removeCheckedTrenchesData(trenchList) {
      trenchList.forEach((trenchName) => {
        delete this.checkedTrenchesData[trenchName];
      });
    },

    trenchtoSync(trenchName) {
      return this.checkedTrenchesData[trenchName].map((obj) => {
        // remove property "Trench" before pushing data. It was added temporarly for helping webapp identifying items
        const { Trench, ...newObj } = obj;
        return newObj;
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
    setProjectTrenchesRights(projectTrenchesRights) {
      this.projectTrenchesRights = projectTrenchesRights;
    },

    setCheckedTrenchesNames(checkedTrenchesNames) {
      this.checkedTrenchesNames = checkedTrenchesNames;
    },

    setSearchText(searchText) {
      this.searchText = searchText;
    },

    setSyncPatches(syncPatches) {
      this.syncPatches = syncPatches;
    },
    setSyncTrench(syncTrench) {
      this.syncTrench = syncTrench;
    },
    setSyncNewVersion(syncNewVersion) {
      this.syncNewVersion = syncNewVersion;
    },
  },
});
