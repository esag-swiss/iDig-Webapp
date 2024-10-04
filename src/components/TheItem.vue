<template>
  <div v-if="currentItem" class="TheItemwrapper justify-content-center">
    <!--header-->
    <div
      class="sticky-top q-fixed bg-grey-1 q-px-sm full-width row items-center justify-between"
    >
      <div class="col text-weight-medium text-left">
        {{ projectPreferencesTypesTranslation[currentItem.Type] }}
        {{ currentItem.Identifier }}
      </div>

      <div class="mx-1">
        <q-btn
          v-if="editMode"
          round
          color="secondary"
          class="m-1 pl-3"
          icon="cloud_upload"
          :size="'sm'"
          @click="pushSurvey()"
        />
        <q-tooltip class="bg-accent"
          >upload modification to iDig server</q-tooltip
        >
      </div>
      <div class="mx-1">
        <q-toggle
          v-model="editMode"
          :disable="username === 'Readonly'"
          color="red"
        />
        <q-tooltip class="bg-accent"
          >{{ editMode ? "disable edit mode" : "enable edit mode" }}
        </q-tooltip>
      </div>
    </div>
    <div class="TheItem center-block mx-auto">
      <!--Formulaire-->

      <!--   IMAGE DISPLAY SECTION (for RelationAttachments and RelationIncludesUUID) -->
      <ul v-if="!editMode" class="list-group">
        <div v-if="relatedImageUrls.length > 0" class="col-12 p-1">
          <div class="thumbnails-container">
            <!-- Image miniature avec clic pour agrandir -->
            <img
              v-for="(url, index) in relatedImageUrls"
              :key="index"
              :src="url"
              class="img-thumbnail"
              @click="selectedImageUrl = url"
            />
          </div>

          <!-- Overlay avec l'image agrandie -->
          <div
            v-if="selectedImageUrl"
            class="image-overlay"
            @click="selectedImageUrl = null"
          >
            <img
              :src="selectedImageUrl"
              class="img-fullscreen"
              alt="Image agrandie"
            />
          </div>
        </div>
      </ul>

      <!--   LISTE OF GROUPS and FIELDS section) -->
      <ul
        v-for="(group, indexGroup) in editMode
          ? groupOfFieldsAccordingToTypeAndNative
          : groupsOfFieldsAccordingToItem"
        :key="group"
        class="list-group"
      >
        <!-- GROUPS LABELS -->
        <!--               -->
        <li
          class="list-group-item text-uppercase accordion p-1 pl-2 border-bottom"
        >
          {{ group.labels ? group.labels[lang] : group.group }}
        </li>

        <div
          v-for="(field, index) in editMode
            ? group.fields.filter(
                (item) =>
                  item.field !== 'CoverageSpatial' && item.field !== 'Subtype'
              )
            : group.fields.filter(
                (item) =>
                  fieldsOfCurrentItem.includes(item.field) &&
                  item.field !== 'Subtype'
              )"
          :key="field"
          class="d-flex align-items-start border-bottom"
        >
          <!--                -->
          <!-- FIELDS LABEL   -->
          <!--                -->
          <div class="text-right text-dark border-right p-1 col-2">
            {{
              // labels from types.groups.fields.labels.[lang] except if empty
              field.labels?.[lang] !== undefined && field.labels?.[lang] !== ""
                ? field.labels?.[lang]
                : projectPreferencesFieldsWithTranslation[field.field] ??
                  fieldsSchema[field.field]?.labels?.[lang] ??
                  field.field
            }}
            <q-tooltip
              anchor="center left"
              self="bottom middle"
              class="bg-accent"
              >{{ field.field }}
            </q-tooltip>
          </div>

          <!--                     -->
          <!-- VALUE : many cases  -->
          <!--                     -->
          <div class="col-10 border-none p-0">
            <!-- TYPE  -->
            <div v-if="field.field === 'Type'" class="col-12 p-1">
              <div v-if="editMode" class="col-12 p-1 m-0 border-none">
                <q-select
                  v-model="selectedTypeSubtype"
                  dense
                  options-dense
                  filled
                  :options="projectPreferencesTypesForOption"
                  emit-value
                  map-options
                  class="select"
                  :label="
                    projectPreferencesTypesTranslation[currentItem.Subtype] ||
                    projectPreferencesTypesTranslation[currentItem[field.field]]
                  "
                  @update:model-value="updateTypeAndSubtype"
                />
              </div>
              <div v-else>
                {{
                  projectPreferencesTypesTranslation[currentItem.Subtype] ||
                  projectPreferencesTypesTranslation[currentItem[field.field]]
                }}
              </div>
            </div>
            <!-- RightsStatus  TODO voir option value et label -->
            <div v-else-if="field.field === 'RightsStatus'" class="col-12 p-1">
              <div class="col-12 p-1 m-0 border-none">
                <q-select
                  v-model="currentItem[field.field]"
                  dense
                  options-dense
                  filled
                  :options="fieldsSchema.RightsStatus.valuelists"
                  option-value="en"
                  option-label="fr"
                  :disable="!editMode"
                  emit-value
                  map-options
                  class="select"
                /><q-tooltip
                  v-if="fieldType(field.field, group)?.tips?.[lang]"
                  anchor="bottom left"
                  self="top left"
                  class="bg-accent"
                  >{{ fieldType(field.field, group).tips[lang] }}</q-tooltip
                >
              </div>
            </div>

            <!-- CoverageSerialized -->
            <div
              v-else-if="field.field === 'CoverageSerialized'"
              class="col-12 p-1"
            >
              <div>
                {{ determineTypeGeo(currentItem[field.field]) }}
              </div>
            </div>
            <!-- BOOLEAN -->
            <div
              v-else-if="fieldsSchema[field.field]?.type === 'boolean'"
              class="col-12 p-1"
            >
              <q-toggle
                v-model="currentItem[field.field]"
                false-value="0"
                true-value="1"
                color="green"
                :disable="!editMode"
              /><q-tooltip
                v-if="fieldType(field.field, group)?.tips?.[lang]"
                anchor="bottom left"
                self="top left"
                class="bg-accent"
                >{{ fieldType(field.field, group).tips[lang] }}</q-tooltip
              >
            </div>
            <!-- RELATIONS-->
            <div
              v-else-if="
                fieldsSchema[field.field]?.type === 'link' &&
                currentItem[field.field]
              "
              class="col-12 p-1 flex-grow-1"
            >
              <q-chip
                v-for="item in popupItems(currentItem[field.field])"
                :key="item"
                color="primary"
                text-color="white"
                class="q-chip"
              >
                {{ item }}
              </q-chip>
              <q-tooltip
                v-if="fieldType(field.field, group)?.tips?.[lang]"
                anchor="bottom left"
                self="top left"
                class="bg-accent"
                >{{ fieldType(field.field, group).tips[lang] }}</q-tooltip
              >
            </div>
            <!-- DATE -->
            <div
              v-else-if="fieldsSchema[field.field]?.type === 'DateUTC'"
              class="col-12 p-1"
            >
              {{ format_date(currentItem[field.field]) }}
              <q-tooltip
                v-if="fieldType(field.field, group)?.tips?.[lang]"
                anchor="bottom left"
                self="top left"
                class="bg-accent"
                >{{ fieldType(field.field, group).tips[lang] }}</q-tooltip
              >
            </div>
            <!-- MULTILINE -->
            <div
              v-else-if="
                fieldType(field.field, group)?.hasOwnProperty('multiline')
              "
              class="col-12 p-1"
            >
              <textarea
                v-if="editMode"
                v-model="currentItem[field.field]"
                class="col-12 p-0 border-none"
              ></textarea>
              <div v-else>{{ currentItem[field.field] }}</div>
              <q-tooltip
                v-if="fieldType(field.field, group)?.tips?.[lang]"
                anchor="bottom left"
                self="top left"
                class="bg-accent"
                >{{ fieldType(field.field, group).tips[lang] }}</q-tooltip
              >
            </div>
            <!-- MULTIVALUE && VALUELIST NOT EMPTY   -->
            <div
              v-else-if="
                fieldType(field.field, group)?.hasOwnProperty('valuelist') &&
                fieldType(field.field, group)?.hasOwnProperty('multivalue') &&
                fieldType(field.field, group)?.valuelist?.length !== 0
              "
              class="col-12 p-1 border-none"
            >
              <div class="col-12 p-1 border-none">
                {{ currentItem[field.field] }}
              </div>
              <div v-if="editMode" class="col-12 p-1 m-0 border-none">
                <q-select
                  v-model="
                    arrayForMultivalueFields[
                      index.toString() + indexGroup.toString()
                    ]
                  "
                  use-input
                  @update:model-value="
                    updateMultiArray(
                      field.field,
                      arrayForMultivalueFields[
                        index.toString() + indexGroup.toString()
                      ]
                    )
                  "
                  dense
                  options-dense
                  filled
                  :options="fieldType(field.field, group).valuelist"
                  class="select"
                /><q-tooltip
                  v-if="fieldType(field.field, group)?.tips?.[lang]"
                  anchor="bottom left"
                  self="top left"
                  class="bg-accent"
                  >{{ fieldType(field.field, group).tips[lang] }}</q-tooltip
                >
              </div>
            </div>
            <!-- MULTIVALUE && VALUELIST EMPTY   -->
            <div
              v-else-if="
                fieldType(field.field, group)?.hasOwnProperty('valuelist') &&
                fieldType(field.field, group)?.hasOwnProperty('multivalue') &&
                fieldType(field.field, group)?.valuelist.length == 0
              "
              class="col-12 p-1 m-0 border-none"
            >
              <div class="col-12 p-1 m-0 border-none">
                {{ currentItem[field.field] }}
              </div>
              <div v-if="editMode" class="col-12 p-1 m-0 border-none">
                <q-select
                  v-model="
                    arrayForMultivalueFields[
                      index.toString() + indexGroup.toString()
                    ]
                  "
                  use-input
                  @update:model-value="
                    updateMultiArray(
                      field.field,
                      arrayForMultivalueFields[
                        index.toString() + indexGroup.toString()
                      ]
                    )
                  "
                  dense
                  options-dense
                  new-value-mode="add"
                  filled
                  :options="listValueInField(field.field)"
                  class="select"
                /><q-tooltip
                  v-if="fieldType(field.field, group)?.tips?.[lang]"
                  anchor="bottom left"
                  self="top left"
                  class="bg-accent"
                  >{{ fieldType(field.field, group).tips[lang] }}</q-tooltip
                >
              </div>
            </div>
            <!-- VALUELIST NOT EMPTY-->
            <div
              v-else-if="
                fieldType(field.field, group)?.hasOwnProperty('valuelist') &&
                fieldType(field.field, group)?.valuelist.length !== 0
              "
              class="col-12 p-1 border-none"
            >
              <div v-if="editMode" class="col-12 p-1 m-0 border-none">
                <q-select
                  v-model="currentItem[field.field]"
                  use-input
                  dense
                  options-dense
                  filled
                  :options="fieldType(field.field, group).valuelist"
                  class="select"
                /><q-tooltip
                  v-if="fieldType(field.field, group)?.tips?.[lang]"
                  anchor="bottom left"
                  self="top left"
                  class="bg-accent"
                  >{{ fieldType(field.field, group).tips[lang] }}</q-tooltip
                >
              </div>
              <div v-else class="col-12 p-1 m-0 border-none">
                {{ currentItem[field.field] }}
              </div>
              <q-tooltip
                v-if="fieldType(field.field, group)?.tips?.[lang]"
                anchor="bottom left"
                self="top left"
                class="bg-accent"
                >{{ fieldType(field.field, group).tips[lang] }}</q-tooltip
              >
            </div>
            <!-- VALUELIST EMPTY (DYNAMIQUE)-->
            <div
              v-else-if="
                fieldType(field.field, group)?.hasOwnProperty('valuelist') &&
                fieldType(field.field, group)?.valuelist.length == 0
              "
              class="col-12 p-1 border-none"
            >
              <div v-if="editMode" class="col-12 p-1 m-0 border-none">
                <q-select
                  v-model="currentItem[field.field]"
                  use-input
                  dense
                  options-dense
                  filled
                  :options="listValueInField(field.field)"
                  class="select"
                  new-value-mode="add"
                /><q-tooltip
                  v-if="fieldType(field.field, group)?.tips?.[lang]"
                  anchor="bottom left"
                  self="top left"
                  class="bg-accent"
                  >{{ fieldType(field.field, group).tips[lang] }}</q-tooltip
                >
              </div>
              <div v-else class="col-12 p-1 m-0 border-none">
                {{ currentItem[field.field] }}
              </div>
            </div>
            <!-- STRING -->
            <div v-else class="col-12 p-1 border-none">
              <input
                v-if="editMode"
                v-model="currentItem[field.field]"
                type="text"
                class="col-12 p-1 border-none"
              />
              <div v-else>{{ currentItem[field.field] }}</div>
              <q-tooltip
                v-if="fieldType(field.field, group)?.tips?.[lang]"
                anchor="bottom left"
                self="top left"
                class="bg-accent"
                >{{ fieldType(field.field, group).tips[lang] }}</q-tooltip
              >
            </div>
          </div>
        </div>
      </ul>
      <!--  CASES NO GROUPS HEADER -->
      <ul class="list-group">
        <li
          class="list-group-item text-uppercase accordion p-1 border-bottom"
        ></li>
        <!-- ROWS -->
        <div
          v-for="field in listFieldsNotIncludedInGroups"
          :key="field"
          class="d-flex align-items-start border-bottom"
        >
          <!-- LABELS -->
          <div class="text-right text-dark border-right p-1 col-2">
            {{
              projectPreferencesFieldsWithTranslation[field] ??
              fieldsSchema[field]?.labels?.[lang] ??
              field
            }}
            <q-tooltip
              anchor="center left"
              self="bottom middle"
              class="bg-accent"
              >{{ field }}
            </q-tooltip>
          </div>

          <div
            v-if="fieldsSchema[field]?.type === 'DateUTC'"
            class="col-10 p-1"
          >
            {{ format_date(currentItem[field]) }}
          </div>
          <input
            v-else-if="editMode"
            v-model="currentItem[field]"
            type="text"
            class="col-10 p-1 border-none"
          />
          <div v-else class="col-10 p-1">{{ currentItem[field] }}</div>
        </div>
      </ul>
    </div>
  </div>
</template>

<script>
import { Notify } from "quasar";
import { apiPushTrench, apiFetchImageSRC } from "@/services/ApiClient";
import { mapActions, mapState } from "pinia";
import { useDataStore } from "@/stores/data";
import { useAppStore } from "@/stores/app";
import dayjs from "dayjs";
import { fieldsSchema } from "@/assets/nativeFields";
import { determineGeoType } from "@/services/json2geojson";
import {
  openDB,
  addPlanToDB,
  getImageFromDB,
} from "@/services/indexedDbManager";

export default {
  name: "TheItem",
  props: {
    currentItem: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      selectedTypeSubtype: null,
      editMode: false,
      selectedImageUrl: null, // Pour stocker l'URL de l'image sélectionnée
      relatedImageUrls: [], // Tableau pour stocker les URLs d'images récupérées
      arrayForMultivalueFields: [],
      fieldsSchema: fieldsSchema,
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
      "selectedType",
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
          x.type.includes(this.selectedType) ||
          (x.subtype && x.subtype.includes(this.selectedType))
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
        "IdentifierUUID",
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
  mounted() {
    this.fetchImages();
  },

  methods: {
    ...mapActions(useDataStore, [
      "setSyncPatches",
      "setSyncTrench",
      "setSyncNewVersion",
      "UpdateSyncTrenchData",
    ]),
    format_date(value) {
      if (value) {
        return dayjs(value).format("DD/MM/YYYY");
      }
    },
    updateTypeAndSubtype(value) {
      this.currentItem.Type = value.type;
      this.currentItem.Subtype = value.subtype;
    },

    fieldType(field, groupObject) {
      let groupName = groupObject.group ?? "";
      let fieldSchema = this.projectPreferencesFields.filter(
        (x) => x.field == field
      )[0];

      let fieldSchemaFromGroups = this.projectPreferencesTypes
        .filter((x) => {
          return (
            x.type.includes(this.selectedType) ||
            (x.subtype && x.subtype.includes(this.selectedType))
          );
        })[0]
        ?.groups.filter((x) => {
          return x.group.includes(groupName);
        })[0]
        ?.fields.filter((x) => {
          return x.field.includes(field);
        })[0];

      if (fieldSchemaFromGroups) {
        fieldSchema = { ...fieldSchema, ...fieldSchemaFromGroups };
      }

      if (this.fieldsSchema[field]) {
        fieldSchema = { ...this.fieldsSchema[field], ...fieldSchema };
      }

      return fieldSchema;
    },

    listValueInField(field) {
      let valeursField = this.checkedTrenchesItemsSelectedType.map(
        (objet) => objet[field]
      );
      // Filtrer les doublons
      return valeursField
        .filter((valeur, index, self) => self.indexOf(valeur) === index)
        .sort();
    },

    async pushSurvey() {
      const head = this.checkedTrenchesVersion[this.currentItem.Trench];
      const surveys = this.trenchtoUpdateWithoutTrenchProp;
      const preferences = this.projectPreferencesBase64;

      let resp = await apiPushTrench(
        this.currentItem.Trench,
        head,
        surveys,
        preferences
      );

      if (resp.data.status === "pushed") {
        this.checkedTrenchesVersion[this.currentItem.Trench] =
          resp.data.version;

        localStorage.setItem(
          "localTrenchesVersion",
          JSON.stringify(this.checkedTrenchesVersion)
        );

        this.UpdateSyncTrenchData(this.currentItem.Trench, surveys);

        Notify.create({
          type: "positive",
          message: `The item was saved`,
        });
      } else if (resp.data.status === "pull") {
        this.setSyncPatches(resp.data.updates);
        this.setSyncTrench(this.currentItem.Trench);
        this.setSyncNewVersion(resp.data.version);
        Notify.create({
          type: "warning",
          message: `There is a newer version on server`,
        });
      }
    },

    determineTypeGeo(e) {
      if (e) {
        return determineGeoType(e);
      } else {
        return null;
      }
    },

    updateMultiArray(field, value) {
      if (this.currentItem[field]?.includes(value)) {
        this.currentItem[field] = this.currentItem[field].replace(
          value + "\n",
          ""
        );
      } else {
        this.currentItem[field] = this.currentItem[field]
          ? this.currentItem[field] + "\n" + value
          : value;
      }
    },

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
      const trenchData = this.checkedTrenchesData[this.currentItem.Trench];

      if (!trenchData) {
        return null; // Retourne null si aucune donnée n'est disponible
      }

      // Filtrer les éléments correspondant à l'UUID
      const filteredItems = trenchData.filter(
        (x) => x.IdentifierUUID === IdentifierUUID && x.Type === "Image"
      );

      if (filteredItems.length > 0) {
        return this.fetchURLs(filteredItems[0].RelationAttachments); // Récupérer l'image
      } else {
        return "null"; // Si aucun élément n'est trouvé, retournez null
      }
    },

    async fetchURLsOLD(RelationAttachments) {
      try {
        const response = await apiFetchImageSRC(
          RelationAttachments,
          this.currentItem.Trench
        );
        if (response && response.data) {
          let blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });
          return URL.createObjectURL(blob); // Retourne l'URL de l'image
        } else {
          return "/path/to/placeholder.jpg"; // Retourne une image de remplacement en cas d'erreur
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'image :", error);
        return "/path/to/placeholder.jpg"; // Placeholder en cas d'erreur
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

    // Ouvrir l'image agrandie
    openImage(url) {
      this.selectedImageUrl = url; // Stocker l'URL de l'image cliquée
    },

    // Fermer l'image agrandie
    closeImage() {
      this.selectedImageUrl = null; // Réinitialiser l'URL pour masquer l'image
    },

    popupItems(IdentifierUUIDs) {
      if (IdentifierUUIDs.includes("\n")) {
        let relatedItems = IdentifierUUIDs.split("\n");
        relatedItems = relatedItems.map((obj) => this.popupItem(obj));
        return relatedItems;
      } else {
        return [this.popupItem(IdentifierUUIDs)];
      }
    },

    popupItem(IdentifierUUID) {
      const filteredItems = this.checkedTrenchesData[
        this.currentItem.Trench
      ].filter((x) => x.IdentifierUUID.includes(IdentifierUUID));
      return filteredItems.map(
        (item) =>
          this.projectPreferencesTypesTranslation[item.Type] + ": " + item.Title
      )[0];
    },
  },
};
</script>
<style scoped>
.TheItemwrapper {
  position: absolute;
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
/* Conteneur pour aligner les images miniatures horizontalement */
.thumbnails-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  max-width: 100%; /* Ajuste la largeur au conteneur */
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
  max-width: 150px; /* Limite la largeur */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Affiche des points de suspension si le texte est trop long */
}
</style>
