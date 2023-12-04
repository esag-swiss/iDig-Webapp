<template>
  <div class="TheItemwrapper justify-content-center">
    <div v-if="currentItem" class="TheItem center-block mx-auto">
      <!--header-->
      <div class="d-flex align-items-start border-bottom p-1">
        <div class="col text-left">
          <h3>{{ currentItem.Type }} {{ currentItem.Identifier }}</h3>
        </div>
        <div class="navbar-text py-0">
          {{ currentItem.IdentifierUUID }}
        </div>

        <button
          type="button"
          class="btn btn-outline-danger my-sm-0 m-2 py-0"
          @click="pushSurvey()"
        >
          save
        </button>
      </div>

      <!--Formulaire-->
      <!-- Display all fields present in item and listed in Fields  -->

      <ul
        v-for="group in groupsOfFieldsAccordingToItem"
        :key="group"
        class="list-group"
      >
        <!-- Groups label -->
        <li class="list-group-item text-uppercase accordion p-2 border-bottom">
          {{ group.labels ? group.labels[lang] : group.group }}
        </li>

        <div
          v-for="field in group.fields.filter((item) =>
            fieldsOfCurrentItem.includes(item.field)
          )"
          :key="field"
          class="d-flex align-items-start border-bottom"
        >
          <!-- Display field label. Look first if an alternative label exist for the select item type -->
          <div class="text-right text-dark border-right p-2 col-md-2">
            {{
              field.labels?.[lang] ??
              projectPreferencesFieldsWithTranslation[field.field] ??
              field.field
            }}
          </div>

          <!-- Fields value : many cases  -->

          <!-- 0  Champ existe dans fields  -->

          <div v-if="fieldExist(field.field) != 0" class="col-md-10 p-2">
            <!-- 1  Champ == TYPE  -->
            <div v-if="field.field === 'Type'" class="col-md-12 p-0">
              <select
                v-model="
                  trenchtoUpdate.filter((x) => {
                    return x.IdentifierUUID == currentItem.IdentifierUUID;
                  })[0][field.field]
                "
                class="col-md-12 border-none p-0"
              >
                <option
                  v-for="type in projectPreferencesTypes"
                  :key="type"
                  class=""
                >
                  <!-- TODO gérer les langues -->
                  {{ type.type }}
                </option>
              </select>
            </div>

            <!-- 1  Champ == DATE -->
            <div
              v-else-if="
                field.field === 'DateEarliest' || field.field === 'DateLatest'
              "
              class="col-md-12 p-0 border-none"
            >
              {{ format_date(currentItem[field.field]) }}
            </div>
            <!-- 1  Champ == IMAGE -->
            <div
              v-else-if="field.field === 'RelationAttachments'"
              class="col-md-12 p-0 pl-1 border-none"
            >
              <q-toggle
                v-model="imageDisplayed"
                label="Image"
                @click="toggleImage(currentItem[field.field])"
              />

              <img id="image" src="" class="img-fluid" />
            </div>
            <!-- 1  Champ == RightsSidelined -->
            <div
              v-else-if="field.field === 'RightsSidelined'"
              class="col-md-12 p-0 pl-1 border-none"
            >
              <input
                v-model="
                  trenchtoUpdate.filter((x) => {
                    return x.IdentifierUUID == currentItem.IdentifierUUID;
                  })[0]['RightsSidelined']
                "
                type="text"
                class="col-md-12 p-0 border-none"
              />
            </div>

            <!-- 1  Champ != type NOR date  -->

            <div v-else>
              <!-- 2 has property valuelist  -->
              <div v-if="fieldType(field.field).hasOwnProperty('valuelist')">
                <!-- 3 valuelist n'est pas vide  -->
                <div
                  v-if="fieldType(field.field).valuelist.length > 0"
                  class="col-md-12 p-0"
                >
                  <!-- 4 if multivalue  -->

                  <select
                    v-model="
                      trenchtoUpdate.filter((x) => {
                        return x.IdentifierUUID == currentItem.IdentifierUUID;
                      })[0][field.field]
                    "
                    class="col-md-12 border-none p-0"
                  >
                    <option
                      v-for="value in fieldType(field.field).valuelist"
                      :key="value"
                      class=""
                      :value="value"
                    >
                      {{ value }}
                    </option>

                    <option></option>
                  </select>
                </div>
                <!-- valuelist empty : exemple titre, doit se générer sur les exemples dans le même type -->
                <!-- pour l'instant n'affiche que la value -->

                <input
                  v-else
                  v-model="
                    trenchtoUpdate.filter((x) => {
                      return x.IdentifierUUID == currentItem.IdentifierUUID;
                    })[0][field.field]
                  "
                  type="text"
                  class="col-md-12 p-0 border-none"
                />
              </div>
              <textarea
                v-else-if="fieldType(field.field).hasOwnProperty('multiline')"
                v-model="
                  trenchtoUpdate.filter((x) => {
                    return x.IdentifierUUID == currentItem.IdentifierUUID;
                  })[0][field.field]
                "
                class="col-md-12 p-0 border-none"
              ></textarea>

              <!-- cas basique champ avec properties field et label -->
              <input
                v-else
                v-model="
                  trenchtoUpdate.filter((x) => {
                    return x.IdentifierUUID == currentItem.IdentifierUUID;
                  })[0][field.field]
                "
                type="text"
                class="col-md-12 p-0 border-none"
              />
            </div>
          </div>
          <!-- 0 le champ n'est pas dans pref.fields -->
          <div v-else>
            <!-- 1 IMAGE -->
            <div
              v-if="field.field == 'RelationAttachments'"
              class="col-md-12 p-2 border-none"
            >
              <div v-if="currentItem[field.field]">
                <q-toggle
                  v-model="imageDisplayed"
                  label="Image"
                  @click="toggleImage(currentItem[field.field])"
                />
                <img id="image" src="" class="img-fluid" />
              </div>
              <div v-else>No file attached</div>
            </div>
            <div v-else class="col-md-12 p-2 border-none">
              Not listed as field, will be displayed in a further component
            </div>
          </div>
        </div>
      </ul>
    </div>
  </div>
</template>

<script>
import { apiUpdateTrenchItem, apiFetchImage } from "@/services/ApiClient";
import { mapState } from "pinia";
import { useDataStore } from "@/stores/data";
import { useAppStore } from "@/stores/app";
import dayjs from "dayjs";

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
      imageDisplayed: false,
    };
  },
  computed: {
    ...mapState(useDataStore, [
      "projectPreferencesTypes",
      "projectPreferencesFields",
      "projectPreferencesBase64",
      "projectPreferencesFieldsWithTranslation",
      "checkedTrenchesData",
      "checkedTrenchesVersion",
      "selectedType",
    ]),
    ...mapState(useAppStore, ["lang"]),

    //  array of fields presents in current item
    fieldsOfCurrentItem() {
      return Object.getOwnPropertyNames(this.currentItem);
    },

    selectedTrench() {
      // return the trench of the selected item
      if (this.currentItem) {
        var array = Object.entries(this.checkedTrenchesData);
        return array.filter((x) =>
          x[1].some((k) =>
            k.IdentifierUUID.includes(this.currentItem.IdentifierUUID)
          )
        )[0][0];
      } else {
        return "";
      }
    },

    trenchtoUpdate() {
      if (this.currentItem) {
        return this.checkedTrenchesData[this.selectedTrench];
      } else {
        return "";
      }
    },
    groupOfFieldsAccordingToType() {
      if (this.projectPreferencesTypes) {
        return this.projectPreferencesTypes.filter((x) => {
          return x.type.includes(this.selectedType);
        })[0].groups;
      } else {
        return this.projectPreferencesTypes;
      }
    },
    groupsOfFieldsAccordingToItem() {
      if (this.projectPreferencesTypes) {
        let groups = this.projectPreferencesTypes.filter((x) => {
          return x.type.includes(this.selectedType);
        })[0].groups;

        groups = groups.filter((obj) =>
          obj.fields.some((field) =>
            this.fieldsOfCurrentItem.includes(field.field)
          )
        );

        return groups;
      } else {
        return this.projectPreferencesTypes;
      }
    },
  },
  methods: {
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

    fieldType(field) {
      // attention fields ne liste pas tous les champs
      return this.projectPreferencesFields.filter((x) => x.field == field)[0];
    },

    pushSurvey() {
      const head = this.checkedTrenchesVersion[this.selectedTrench];
      const surveys = this.trenchtoUpdate;
      const preferences = this.projectPreferencesBase64;

      apiUpdateTrenchItem(this.selectedTrench, head, surveys, preferences);
    },

    toggleImage(img) {
      if (this.imageDisplayed) {
        apiFetchImage(img, this.selectedTrench);
      } else {
        let imageNode = document.getElementById("image");
        imageNode.src = "";
      }
    },
  },
};
</script>
<style scoped>
.TheItemwrapper {
  position: absolute;
  top: -5px;
  left: -10%;
  width: 100%;
  height: auto;
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
</style>
