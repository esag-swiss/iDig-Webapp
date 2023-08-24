<template>
  <div class="TheItemwrapper justify-content-center">
    <div
      v-if="currentItem"
      id="TheItem"
      class="TheItem center-block mx-auto p-3"
    >
      <!--header-->
      <div class="row align-items-start border-bottom mb-2">
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
        <button
          type="button"
          class="btn btn-outline-secondary my-0 my-sm-0 m-2 py-0"
          @click="setUserPreferences()"
        >
          settings
        </button>
      </div>

      <!--Formulaire-->
      <!-- espace de travail finds 3254 ; Material  3450-->
      <ul
        v-for="group in groupOfFieldsAccordingToType"
        :key="group"
        class="list-group"
      >
        <li
          v-if="group.hasOwnProperty('labels')"
          class="list-group-item accordion"
        >
          <!-- attention gérer les langues -->
          {{ group.labels.fr }}
        </li>
        <li v-else class="list-group-item accordion">
          <!-- attention gérer les langues -->
          {{ group.group }}
        </li>

        <div
          v-for="field in group.fields"
          :key="field"
          class="row align-items-start border-bottom my-1"
        >
          <!-- Nom du Champ : A METTRE EN FR  -->
          <p class="col-md-3">{{ field.field }}</p>
          <!-- valeur du Champ : mille cases  -->

          <!-- 0  Champ existe dans fields  -->
          <div v-if="fieldExist(field.field) != 0" class="col-md-9 p-0 pl-1">
            <!-- 1  Champ == type  -->
            <div v-if="field.field == 'Type'" class="col-md-12 p-0 pl-1">
              <select class="col-md-12 border-none">
                <option value="currentItem.type">{{ currentItem.Type }}</option>
                <option
                  v-for="type in projectPreferencesTypes"
                  :key="type"
                  :value="type.type"
                >
                  {{ type.type }}
                </option>
              </select>
            </div>

            <!-- 1  Champ date -->
            <p
              v-else-if="field.field == 'DateEarliest'"
              class="col-md-12 p-0 pl-1 border-none"
            >
              {{
                Date(
                  trenchtoUpdate.filter((x) => {
                    return x.IdentifierUUID == currentItem.IdentifierUUID;
                  })[0][field.field]
                )
              }}
            </p>
            <!-- 1  Champ != type NOR date  -->

            <div v-else>
              <!-- 2 has property valuelist  -->
              <div v-if="fieldType(field.field).hasOwnProperty('valuelist')">
                <!-- 3 valuelist n'est pas vide  -->
                <div
                  v-if="fieldType(field.field).valuelist.length > 0"
                  class="col-md-12 p-0 pl-1"
                >
                  <!-- 4 if multivalue  -->
                  <select class="col-md-12 p-0 pl-1 border-none">
                    <option value="currentItem.type">
                      {{ currentItem[field.field] }}
                    </option>

                    <option v-for="type in valuelist" :key="type" :value="type">
                      {{ type }}
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
                  class="col-md-12 p-0 pl-1 border-none"
                />
              </div>
              <textarea
                v-else-if="fieldType(field.field).hasOwnProperty('multiline')"
                v-model="
                  trenchtoUpdate.filter((x) => {
                    return x.IdentifierUUID == currentItem.IdentifierUUID;
                  })[0][field.field]
                "
                class="col-md-12 p-0 pl-1 border-none"
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
                class="col-md-12 p-0 pl-1 border-none"
              />
            </div>
          </div>
          <!-- 0 le champ n'est pas dans pref.fields -->
          <div v-else class="col-md-9 p-0 pl-1">
            Not listed as field, will be displayed in a further component
          </div>
        </div>
      </ul>
    </div>
  </div>
</template>

<script>
import { apiUpdateTrenchItem } from "@/services/ApiClient";
import { mapState } from "pinia";
import { useDataStore } from "@/stores/data";

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
      temp: ["papi", "prout", "truc"],
      field: "Material",
    };
  },
  computed: {
    ...mapState(useDataStore, [
      "projectPreferencesTypes",
      "projectPreferencesFields",
      "projectPreferencesBase64",
      "selectedType",
    ]),
    AAA() {
      // attention fields ne liste pas tous les champs
      return this.projectPreferencesFields.filter((x) => x.field == "Type");
    },

    AAAA() {
      return Object.hasOwn(this.AAA, "valuelist");
    },

    valuelist() {
      return this.projectPreferencesFields[33].valuelist;
    },

    selectedTrench() {
      if (this.currentItem) {
        var array = Object.entries(
          JSON.parse(sessionStorage.checkedTrenchesData)
        ); //object into array
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
        return JSON.parse(sessionStorage.checkedTrenchesData)[
          this.selectedTrench
        ];
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
  },
  methods: {
    fieldExist(field) {
      // attention comme fields ne liste pas tous les champs on verifie si il existe
      return this.projectPreferencesFields.filter((x) => x.field == field)
        .length;
    },

    fieldType(field) {
      // attention fields ne liste pas tous les champs
      return this.projectPreferencesFields.filter((x) => x.field == field)[0];
    },

    setUserPreferences() {
      // alert("to use for user preferences settings")
    },
    pushSurvey() {
      const head = JSON.parse(sessionStorage.checkedTrenchesVersions)[
        this.selectedTrench
      ];
      const surveys = this.trenchtoUpdate;
      const preferences = this.projectPreferencesBase64;

      apiUpdateTrenchItem(this.selectedTrench, head, surveys, preferences);
    },
  },
};
</script>
<style scoped>
.TheItemwrapper {
  position: absolute;
  top: -5%;
  left: -10%;
  width: 100%;
  height: auto;
  background: rgba(0, 0, 0, 0.7);
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
