<template>
  <div v-if="currentItem" class="TheItemwrapper justify-content-center">
    <!--header-->
    <div class="sticky-top bg-grey-5">
      <div class="text-uppercase text-h6 accordion p-2">
        {{ projectPreferencesTypesTranslation[currentItem.Type] }}
        {{ currentItem.Identifier }}
      </div>
    </div>
    <div class="TheItem center-block mx-auto">
      <!--Formulaire-->

      <!--   IMAGE DISPLAY SECTION (for RelationAttachments and RelationIncludesUUID) -->
      <ul class="list-group">
        <div v-if="relatedImageUrls.length > 0" class="col-12 p-1">
          <div v-if="!selectedImageUrl" class="thumbnails-container">
            <!-- Image miniature avec clic pour agrandir -->
            <img
              v-for="(url, index) in relatedImageUrls"
              :key="index"
              :src="url"
              class="img-thumbnail"
              @click="
                selectedImageUrl = relatedImageUrls[index];
                relatedImageUrlsselectedIndex = index;
              "
            />
          </div>

          <!-- Overlay avec l'image agrandie -->
          <div
            v-if="selectedImageUrl"
            class="image-overlay image-viewer"
            @click="selectedImageUrl = null"
          >
            <!-- Bouton gauche -->
            <div
              class="nav-button left"
              @click.stop="
                relatedImageUrlsselectedIndex =
                  (relatedImageUrlsselectedIndex -
                    1 +
                    relatedImageUrls.length) %
                  relatedImageUrls.length;
                selectedImageUrl =
                  relatedImageUrls[relatedImageUrlsselectedIndex];
              "
            >
              <span>&lt;</span>
            </div>

            <!-- Image affichée -->
            <img :src="selectedImageUrl" class="img-fullscreen" alt="Image" />

            <!-- Bouton droit -->
            <div
              class="nav-button right"
              @click.stop="
                relatedImageUrlsselectedIndex =
                  (relatedImageUrlsselectedIndex + 1) % relatedImageUrls.length;
                selectedImageUrl =
                  relatedImageUrls[relatedImageUrlsselectedIndex];
              "
            >
              <span>&gt;</span>
            </div>
          </div>
        </div>
      </ul>

      <!--   LISTE OF GROUPS and FIELDS section) -->
      <ul
        v-for="(group, indexGroup) in groupsOfFieldsAccordingToItem"
        :key="group"
        class="list-group"
      >
        <!-- GROUPS LABELS -->

        <li
          class="list-group-item text-uppercase accordion p-1 pl-2 border-bottom"
        >
          {{ group.labels ? group.labels[lang] : group.group }}
        </li>

        <!-- ROWS   -->

        <div
          v-for="(field, index) in group.fields.filter(
            (item) =>
              fieldsOfCurrentItem.includes(item.field) &&
              item.field !== 'Subtype'
          )"
          :key="field"
          class="d-flex align-items-start border-bottom"
        >
          <!-- FIELDS LABEL   -->

          <div class="text-right text-dark border-right p-1 col-2">
            {{
              field.labels?.[lang] ||
              projectPreferencesFieldsWithTranslation?.[field.field] ||
              fieldsSchema?.[field.field]?.labels?.[lang] ||
              field.field
            }}
          </div>
          <!-- VALUE : many cases  -->
          <!--                     -->
          <div class="col-10 border-none p-0">
            <div v-if="field.field === 'Type'" class="col-12 p-1">
              {{
                projectPreferencesTypesTranslation[currentItem.Subtype] ||
                projectPreferencesTypesTranslation[currentItem[field.field]]
              }}
            </div>
            <div v-else-if="field.field === 'RightsStatus'" class="col-12 p-1">
              {{ currentItem[field.field] }}
            </div>
            <div
              v-else-if="field.field === 'CoverageSerialized'"
              class="col-12 p-1"
            >
              geodata
            </div>
            <div
              v-else-if="fieldsSchema[field.field]?.type === 'boolean'"
              class="col-12 p-1"
            >
              <q-toggle
                v-model="currentItem[field.field]"
                false-value="0"
                true-value="1"
                color="green"
                :disable="true"
              />
            </div>
            <div
              v-else-if="fieldsSchema[field.field]?.type === 'link'"
              class="col-12 p-1 flex-grow-1"
            >
              <q-chip
                v-for="item in itemsInChips(currentItem[field.field])"
                clickable
                @click="
                  openInNewTab(
                    item.fullItem.IdentifierUUID,
                    item.fullItem.Trench
                  )
                "
                :key="item"
                color="primary"
                text-color="white"
                class="q-chip"
              >
                {{ item.chipText }}
              </q-chip>
            </div>
            <div
              v-else-if="fieldsSchema[field.field]?.type === 'DateUTC'"
              class="col-12 p-1"
            >
              {{ format_date(currentItem[field.field]) }}
            </div>
            <div v-else class="col-12 p-1">
              {{ currentItem[field.field] }}
            </div>
          </div>
        </div>
      </ul>
    </div>
  </div>
</template>

<script>
import {
  openDB,
  addPlanToDB,
  getImageFromDB,
  readDataInIndexedDB,
} from "@/services/indexedDbManager";
import { mapActions, mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import { useDataStore } from "@/stores/data";
import { fieldsSchema } from "@/assets/nativeFields";
import dayjs from "dayjs";
import { apiFetchImageSRC } from "@/services/ApiClient";

export default {
  name: "TheItemStandalone",
  props: {
    itemId: {
      type: String,
      required: true, // Assure que l'ID est transmis via la route
    },
    trenchSource: {
      type: String,
      required: true, // Assure que l'ID est transmis via la route
    },
  },
  data() {
    return {
      fieldsSchema: fieldsSchema,
      currentItem: null, // Contiendra les données chargées
      projectPreferencesBase64: null,
      trenchData: null,
      relatedImageUrls: [], // Tableau pour stocker les URLs d'images récupérées
      selectedImageUrl: null, // Pour stocker l'URL de l'image sélectionnée
      relatedImageUrlsselectedIndex: null,
    };
  },
  computed: {
    ...mapState(useDataStore, [
      "projectPreferencesTypes",
      "projectPreferencesTypesForSelect",
      "projectPreferencesTypesForOption",
      "projectPreferencesTypesTranslation",
      "projectPreferencesFields",
      "projectPreferencesBase64",
      "projectPreferencesFieldsWithTranslation",
      "checkedTrenchesData",
      "checkedTrenchesVersion",
      "checkedTrenchesItemsSelectedType",
    ]),
    ...mapState(useAppStore, ["username", "lang"]),

    //  array of fields presents in current item
    fieldsOfCurrentItem() {
      return Object.getOwnPropertyNames(this.currentItem);
    },

    // TODO consider removing the following  --------------------
    trenchtoUpdateWithoutTrenchProp() {
      return this.checkedTrenchesData[this.currentItem.Trench].map((obj) => {
        const { Trench, ...newObj } = obj;
        return newObj;
      });
    },

    groupOfFieldsAccordingToType() {
      // all groups according to type from Preferences
      // except Attachments since photo are managed elsewhere
      let groups = [];
      groups = this.projectPreferencesTypes.filter((x) => {
        return (
          x.type.includes(this.currentItem.Type) ||
          (x.subtype && x.subtype.includes(this.currentItem.Subtype))
        );
      })[0].groups;
      return groups.filter((obj) => obj.group !== "Attachments");
    },

    groupsOfFieldsAccordingToItem() {
      // used to display only groups where items has fields
      let groups = this.groupOfFieldsAccordingToTypeAndNative;
      groups = groups.filter((obj) =>
        obj.fields.some((field) =>
          this.fieldsOfCurrentItem.includes(field.field)
        )
      );
      return groups;
    },

    groupOfFieldsAccordingToTypeAndNative() {
      // all groups according to type from Preferences + natives fields or groups
      let groups = [...this.groupOfFieldsAccordingToType];
      groups.forEach((obj) => {
        if (obj.group === "General Section") {
          let fieldsToAdd = [{ field: "Subtype" }];
          fieldsToAdd.forEach((field) => {
            if (
              !obj.fields.some(
                (existingField) => existingField.field === field.field
              )
            ) {
              obj.fields.push(field);
            }
          });
        }
        if (obj.group === "Relation Section") {
          let fieldsToAdd = [
            { field: "RelationIsAboveUUID" },
            { field: "RelationIsBelowUUID" },
            { field: "RelationIsNextToUUID" },
            { field: "RelationCutsUUID" },
            { field: "RelationIsCutByUUID" },
            { field: "RelationIsAfterUUID" },
            { field: "RelationIsBeforeUUID" },
            { field: "RelationIsCoevalWithUUID" },
            { field: "RelationBelongsToUUID" },
            { field: "RelationIncludesUUID" },
          ];
          fieldsToAdd.forEach((field) => {
            if (
              !obj.fields.some(
                (existingField) => existingField.field === field.field
              )
            ) {
              obj.fields.push(field);
            }
          });
        }
        if (obj.group === "Points") {
          let fieldsToAdd = [{ field: "CoverageSerialized" }];
          fieldsToAdd.forEach((field) => {
            if (
              !obj.fields.some(
                (existingField) => existingField.field === field.field
              )
            ) {
              obj.fields.push(field);
            }
          });
        }
        if (obj.group === "Status Section") {
          let fieldsToAdd = [
            { field: "RightsSidelined" },
            { field: "RightsLocked" },
            { field: "RightsStatus" },
          ];
          fieldsToAdd.forEach((field) => {
            if (
              !obj.fields.some(
                (existingField) => existingField.field === field.field
              )
            ) {
              obj.fields.push(field);
            }
          });
        }
      });
      return groups;
    },

    listFieldsNotIncludedInGroups() {
      let notToDisplay = [
        // "IdentifierUUID",
        "Trench",
        "RightsTrashed",
        "RightsDeleted",
        "DateTimeZone",
      ];
      let fieldsNotPrinsentInGroup = [];

      this.groupOfFieldsAccordingToTypeAndNative.forEach((obj) => {
        obj.fields.forEach((key) => {
          notToDisplay.push(key.field);
        });
      });

      fieldsNotPrinsentInGroup = this.fieldsOfCurrentItem.filter(
        (item) => !notToDisplay.includes(item)
      );
      return fieldsNotPrinsentInGroup;
    },
  },
  watch: {
    currentItem(newValue) {
      if (newValue) {
        this.fetchImages();
      }
    },
  },

  async mounted() {
    try {
      // Réccupérer les préférences
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
      this.setProjectPreferencesBase64(
        localStorage.getItem("projectPreferencesBase64")
      );
      let preferences = decodeURIComponent(
        escape(window.atob(localStorage.getItem("projectPreferencesBase64")))
      );

      processPreferences(preferences);
    } catch (error) {
      console.error("Erreur lors de la lecture des données :", error);
    }
    try {
      if (this.itemId) {
        const db = await openDB(); // Ouvrir la base de données

        // Lire les données depuis IndexedDB
        this.trenchData = JSON.parse(
          await readDataInIndexedDB(db, this.trenchSource)
        );

        // Vérifier si les données ont été trouvées
        if (this.trenchData && Array.isArray(this.trenchData)) {
          // Trouver l'élément correspondant
          const matchedItem = this.trenchData.find(
            (x) => x.IdentifierUUID === this.itemId
          );

          if (matchedItem) {
            this.currentItem = matchedItem; // Stocker l'élément trouvé
          } else {
            console.error(`Aucun élément trouvé avec l'ID ${this.itemId}`);
          }
        } else {
          console.error("Aucune donnée trouvée pour la tranchée AMA24-S38.");
        }
      } else {
        console.error("itemId non fourni.");
      }
    } catch (error) {
      console.error("Erreur lors de la lecture des données :", error);
    }
  },

  methods: {
    ...mapActions(useAppStore, [
      "setIsLoaded",
      "setServer",
      "setProject",
      "setUsername",
      "setPassword",
    ]),
    ...mapActions(useDataStore, [
      "setProjectTrenchesNames",
      "setProjectPreferencesCrs",
      "setProjectPreferencesTypes",
      "setProjectPreferencesFields",
      "setProjectPreferencesBase64",
      "fetchPreferences",
      "fetchIdigTrenchesNames",
      "fetchProjectTrenchesNamesFromFile",
    ]),
    async fetchImages() {
      let relatedItems = [];
      if (this.currentItem.RelationAttachments) {
        relatedItems = [this.currentItem.IdentifierUUID];
        // Récupérer les URL d'images pour chaque UUID trouvé
        const imagePromises = relatedItems.map((uuid) =>
          this.findObjectByUuid(uuid)
        );
        // Attendre la résolution de toutes les promesses d'URL d'images
        const resolvedImages = await Promise.all(imagePromises);

        // Filtrer les résultats pour ne garder que les valeurs non nulles
        this.relatedImageUrls = resolvedImages.filter((url) => url !== "null");
      }
      if (this.currentItem.RelationIncludesUUID && this.currentItem.Trench) {
        if (this.currentItem.RelationIncludesUUID.includes("\n")) {
          relatedItems = this.currentItem.RelationIncludesUUID.split("\n");
        } else {
          relatedItems = [this.currentItem.RelationIncludesUUID];
        }

        // Récupérer les URL d'images pour chaque UUID trouvé
        const imagePromises = relatedItems.map((uuid) =>
          this.findObjectByUuid(uuid)
        );
        // Attendre la résolution de toutes les promesses d'URL d'images
        const resolvedImages = await Promise.all(imagePromises);

        // Filtrer les résultats pour ne garder que les valeurs non nulles
        this.relatedImageUrls = resolvedImages.filter((url) => url !== "null");
      }
    },
    findObjectByUuid(IdentifierUUID) {
      // Vérifie si les données existent pour la tranchée actuelle

      if (!this.trenchData) {
        return null; // Retourne null si aucune donnée n'est disponible
      }

      // Filtrer les éléments correspondant à l'UUID
      const filteredItems = this.trenchData.filter(
        (x) => x.IdentifierUUID === IdentifierUUID && x.Type === "Image"
      );

      if (filteredItems.length > 0) {
        return this.fetchURLs(filteredItems[0].RelationAttachments); // Récupérer l'image
      } else {
        return "null"; // Si aucun élément n'est trouvé, retournez null
      }
    },
    async fetchURLs(RelationAttachments) {
      try {
        // Extraire l'identifiant unique de l'image à partir de RelationAttachments
        let imageName = RelationAttachments.split("\n")[0]
          .split("=")[1]
          .split(".")[0];

        // Ouvrir IndexedDB et vérifier si l'image y est déjà stockée
        const db = await openDB();
        const result = await getImageFromDB(db, imageName);

        if (result) {
          // Si l'image est présente dans IndexedDB, la charger depuis la base de données
          const imageUrl = URL.createObjectURL(result.imageBlob);
          return imageUrl; // Retourner l'URL de l'image
        } else {
          // Si l'image n'est pas dans IndexedDB, la récupérer via l'API
          const response = await apiFetchImageSRC(
            RelationAttachments,
            this.currentItem.Trench
          );

          if (response && response.data) {
            // Créer un Blob à partir de la réponse
            const imageBlob = new Blob([response.data], {
              type: response.headers["content-type"],
            });

            // Créer une URL à partir du Blob
            const imageUrl = URL.createObjectURL(imageBlob);

            // Stocker l'image dans IndexedDB
            await addPlanToDB(db, imageName, imageBlob, null);

            return imageUrl; // Retourner l'URL de l'image
          } else {
            return "/src/assets/missing.PNG"; // Retourner une image de remplacement en cas d'erreur
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'image :", error);
        return "/src/assets/missing.PNG"; // Placeholder en cas d'erreur
      }
    },
    itemsInChips(IdentifierUUIDs) {
      if (IdentifierUUIDs.includes("\n")) {
        let relatedItems = IdentifierUUIDs.split("\n");
        relatedItems = relatedItems.map((obj) => this.chipText(obj));
        return relatedItems;
      } else {
        return [this.chipText(IdentifierUUIDs)];
      }
    },

    chipText(IdentifierUUID) {
      const filteredItems = this.trenchData.filter((x) =>
        x.IdentifierUUID.includes(IdentifierUUID)
      );

      if (filteredItems.length > 0) {
        const item = filteredItems[0];
        return {
          chipText:
            this.projectPreferencesTypesTranslation[item.Type] +
            ": " +
            item.Title,
          fullItem: item,
        };
      }

      return {
        chipText: "Unknown Item", // Valeur par défaut si aucun élément correspondant n'est trouvé
        fullItem: null,
      };
    },

    openInNewTab(uuid, trench) {
      const url = this.$router.resolve({
        name: "TheItemStandalone",
        params: { itemId: uuid, trenchSource: trench },
      }).href;
      window.open(url, "_blank"); // Ouvre un nouvel onglet avec l'URL générée
    },

    format_date(value) {
      if (value) {
        return dayjs(value).format("DD/MM/YYYY");
      }
    },
  },
};
</script>
<style scoped>
.TheItemwrapper {
  margin: auto;
  width: 90%;
  height: 90vh;
  overflow-y: auto;
  background: rgb(255, 255, 255);
  z-index: 1024;
  -ms-overflow-style: none; /* Internet Explorer 10+ ; chrome */
  scrollbar-width: none; /* Firefox? ; Edge */
  border-radius: 12px;
  overflow-x: hidden;
}
.ThePatcheswrapper::-webkit-scrollbar {
  display: none; /* Safari ? */
}

.TheItem {
  height: auto;
  margin-top: 0%;
  margin-bottom: 0%;
  width: 100%;
  background: rgb(255, 255, 255);
}

/* to avoid on hover style */
.accordion {
  background-color: #eee;
  cursor: default;
}
.border-none {
  border: none;
}
.select {
  margin: -5px;
}
/* Style pour la miniature */
.img-thumbnail {
  max-width: 100px;
  cursor: pointer;
}

/* Conteneur pour aligner les images miniatures horizontalement */
.thumbnails-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  max-width: 100%; /* Ajuste la largeur au conteneur */
}

/* Overlay qui couvre toute la page */
.image-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8); /* Fond semi-transparent */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050; /* Assure que l'overlay est au-dessus du reste */
  cursor: pointer;
}

/* Image en plein écran dans l'overlay */
.img-fullscreen {
  max-width: 90%; /* Largeur maximale de 90% de l'écran */
  max-height: 90%; /* Hauteur maximale de 90% de l'écran */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* Optionnel, ajoute une ombre */
  cursor: pointer;
}

.nav-button {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.3s ease;
}

.nav-button:hover {
  background-color: rgba(0, 0, 0, 0.7);
}

.nav-button.left {
  left: 0;
}

.nav-button.right {
  right: 0;
}
</style>
<style>
.q-field__native {
  padding-left: 7px;
}
.q-field__label {
  left: 5px;
  color: black;
}
.q-chip {
  /* max-width: 200px; Limite la largeur */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Affiche des points de suspension si le texte est trop long */
}
</style>
