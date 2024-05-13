<template>
  <div class="TheItemwrapper justify-content-center">
    <div v-if="currentItem" class="TheItem center-block mx-auto">
      <!--header-->
      <div class="d-flex mr-2 border-bottom">
        <div class="col mt-2 text-left">
          <h3>
            {{ projectPreferencesTypesTranslation[currentItem.Type] }}
            {{ currentItem.Identifier }}
          </h3>
        </div>

        <div class="m-1">
          <q-btn
            v-if="editMode"
            round
            color="secondary"
            @click="pushSurvey()"
            :size="'sm'"
            icon="cloud_upload"
            style="padding-left: 16px; margin: 5px"
          />
          <q-tooltip class="bg-accent"
            >upload modification to iDig server</q-tooltip
          >
        </div>
        <div class="m-1">
          <q-toggle
            v-model="editMode"
            :disable="username !== 'Theu'"
            color="red"
          />
          <q-tooltip class="bg-accent"
            >{{ editMode ? "disable edit mode" : "enable edit mode" }}
          </q-tooltip>
        </div>
      </div>

      <!--Formulaire-->

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
            ? group.fields.filter((item) => item.field !== 'CoverageSpatial')
            : group.fields.filter((item) =>
                fieldsOfCurrentItem.includes(item.field)
              )"
          :key="field"
          class="d-flex align-items-start border-bottom"
        >
          <!--                -->
          <!-- FIELDS LABEL   -->
          <!--                -->
          <div class="text-right text-dark border-right p-1 col-md-2">
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
          <div class="col-md-10 border-none p-0">
            <!-- TYPE  -->
            <div v-if="field.field === 'Type'" class="col-md-12 p-1">
              <div v-if="editMode" class="col-md-12 p-1 m-0 border-none">
                <q-select
                  v-model="currentItem[field.field]"
                  dense
                  options-dense
                  filled
                  :options="projectPreferencesTypesForSelect"
                  emit-value
                  map-options
                  class="select"
                />
              </div>
              <div v-else>
                {{ findTranslationOfType(currentItem[field.field]) }}
              </div>
            </div>
            <!-- RightsStatus  -->
            <div
              v-else-if="field.field === 'RightsStatus'"
              class="col-md-12 p-1"
            >
              <div class="col-md-12 p-1 m-0 border-none">
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
            <!-- IMAGE -->
            <div
              v-else-if="field.field === 'RelationAttachments'"
              class="col-md-12 p-1 border-none"
            >
              <div v-if="currentItem[field.field]" class="col-md-12">
                <img id="image" :src="imageSrc" class="img-fluid" />
              </div>
            </div>
            <!-- CoverageSerialized -->
            <div
              v-else-if="
                field.field === 'CoverageSerialized' && currentItem[field.field]
              "
              class="col-md-12 p-1 border-none"
            >
              <div style="max-height: 3.6rem; overflow: hidden">
                {{ determineTypeGeo(currentItem[field.field]) }}
              </div>
            </div>
            <!-- BOOLEAN -->
            <div
              v-else-if="fieldsSchema[field.field]?.type === 'boolean'"
              class="col-md-10 p-1"
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
              class="col-md-10 p-1"
            >
              <q-chip
                v-for="item in popupItems(currentItem[field.field])"
                :key="item"
                color="primary"
                text-color="white"
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
              class="col-md-10 p-1"
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
              class="col-md-12 p-1 border-none"
            >
              <textarea
                v-if="editMode"
                v-model="currentItem[field.field]"
                class="col-md-12 p-0 border-none"
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
              class="col-md-12 p-1 m-0 border-none"
            >
              <div class="col-md-12 p-1 m-0 border-none">
                {{ currentItem[field.field] }}
              </div>
              <div v-if="editMode" class="col-md-12 p-1 m-0 border-none">
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
              class="col-md-12 p-1 m-0 border-none"
            >
              <div class="col-md-12 p-1 m-0 border-none">
                {{ currentItem[field.field] }}
              </div>
              <div v-if="editMode" class="col-md-12 p-1 m-0 border-none">
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
              class="col-md-12 p-1 m-0 border-none"
            >
              <div v-if="editMode" class="col-md-12 p-1 m-0 border-none">
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
              <div v-else class="col-md-12 p-1 m-0 border-none">
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
              class="col-md-12 p-1 m-0 border-none"
            >
              {{ currentItem[field.field] }}
              <div v-if="editMode" class="col-md-12 p-1 m-0 border-none">
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
            </div>
            <!-- STRING -->
            <div v-else class="col-md-12 p-1 border-none">
              <input
                v-if="editMode"
                v-model="currentItem[field.field]"
                type="text"
                class="col-md-12 p-1 border-none"
              />
              <div v-else style="max-height: 3.6rem; overflow: hidden">
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
          <div class="text-right text-dark border-right p-1 col-md-2">
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
            class="col-md-10 p-1"
          >
            {{ format_date(currentItem[field]) }}
          </div>
          <div v-else class="col-md-10 p-1">
            {{ currentItem[field] }}
          </div>
        </div>
      </ul>
    </div>
  </div>
</template>

<script>
import { apiUpdateTrenchItem, apiFetchImageSRC } from "@/services/ApiClient";
import { mapActions, mapState } from "pinia";
import { useDataStore } from "@/stores/data";
import { useAppStore } from "@/stores/app";
import dayjs from "dayjs";
import { fieldsSchema } from "@/assets/nativeFields";
import { determineGeoType } from "@/services/json2geojson";

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
      field: "Material",
      editMode: false,
      imageSrc: "",
      arrayForMultivalueFields: [], // case MULTIVALUE field
    };
  },
  computed: {
    ...mapState(useDataStore, [
      "projectPreferencesTypes",
      "projectPreferencesTypesForSelect",
      "projectPreferencesTypesTranslation",
      "projectPreferencesFields",
      "projectPreferencesBase64",
      "projectPreferencesFieldsWithTranslation",
      "checkedTrenchesData",
      "checkedTrenchesVersion",
      "checkedTrenchesItemsSelectedType",
      "selectedType",
      "isEditMode",
    ]),
    ...mapState(useAppStore, ["username", "lang"]),
    fieldsSchema() {
      return fieldsSchema;
    },
    //  array of fields presents in current item
    fieldsOfCurrentItem() {
      return Object.getOwnPropertyNames(this.currentItem);
    },

    trenchtoUpdateWithoutTrenchProp() {
      return this.checkedTrenchesData[this.currentItem.Trench].map((obj) => {
        // remove property "Trench" before pushing data. It was added temporarly for helping webapp identifying items
        const { Trench, ...newObj } = obj;
        return newObj;
      });
    },

    groupOfFieldsAccordingToType() {
      let groups = [];
      groups = this.projectPreferencesTypes.filter((x) => {
        return x.type.includes(this.selectedType);
      })[0].groups;
      return groups;
    },

    groupsOfFieldsAccordingToItem() {
      let groups = this.groupOfFieldsAccordingToTypeAndNative;
      groups = groups.filter((obj) =>
        obj.fields.some((field) =>
          this.fieldsOfCurrentItem.includes(field.field)
        )
      );
      return groups;
    },

    groupOfFieldsAccordingToTypeAndNative() {
      let groups = [...this.groupOfFieldsAccordingToType];
      groups.forEach((obj) => {
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
      let fieldsNotToDisplay = [
        "IdentifierUUID",
        "Trench",
        "RightsTrashed",
        "RightsDeleted",
      ];
      let fieldsNotPrinsentInGroup = [];

      this.groupOfFieldsAccordingToTypeAndNative.forEach((obj) => {
        obj.fields.forEach((key) => {
          fieldsNotToDisplay.push(key.field);
        });
      });

      fieldsNotPrinsentInGroup = this.fieldsOfCurrentItem.filter(
        (item) => !fieldsNotToDisplay.includes(item)
      );
      return fieldsNotPrinsentInGroup;
    },
  },
  mounted() {
    if (this.currentItem.RelationAttachments && this.currentItem.Trench) {
      this.fetchImage(
        this.currentItem.RelationAttachments,
        this.currentItem.Trench
      );
    }
  },

  methods: {
    ...mapActions(useAppStore, ["setIsEditMode"]),
    format_date(value) {
      if (value) {
        return dayjs(value).format("DD/MM/YYYY");
      }
    },
    fieldExist(field) {
      // attention comme fields ne liste pas tous les champs on verifie si il existe
      return this.projectPreferencesFields.filter((x) => x.field == field)
        .length;
    },

    fieldType(field, groupObject) {
      let groupName = groupObject.group ?? "";
      let fieldSchema = this.projectPreferencesFields.filter(
        (x) => x.field == field
      )[0];

      let fieldSchemaFromGroups = this.projectPreferencesTypes
        .filter((x) => {
          return x.type.includes(this.selectedType);
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

    pushSurvey() {
      const head = this.checkedTrenchesVersion[this.currentItem.Trench];
      const surveys = this.trenchtoUpdateWithoutTrenchProp;
      const preferences = this.projectPreferencesBase64;

      apiUpdateTrenchItem(this.currentItem.Trench, head, surveys, preferences);
    },

    determineTypeGeo(e) {
      return determineGeoType(e);
    },

    async fetchImage(RelationAttachments, Trench) {
      return await apiFetchImageSRC(RelationAttachments, Trench).then(
        (response) => {
          let blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });
          let imgUrl = URL.createObjectURL(blob);

          this.imageSrc = imgUrl;
        }
      );
    },

    findTranslationOfType(type) {
      for (const item of this.projectPreferencesTypes) {
        if (item.type === type) {
          if (item.labels.hasOwnProperty(this.lang)) {
            return item.labels[this.lang];
          } else {
            return type;
          }
        }
      }
      return type;
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
      const filteredItems = this.trenchtoUpdateWithoutTrenchProp.filter((x) =>
        x.IdentifierUUID.includes(IdentifierUUID)
      );
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
</style>
<style>
.q-field__native {
  padding-left: 7px;
}
</style>
