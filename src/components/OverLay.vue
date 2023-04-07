<template>
  <div class="overlaywrapper justify-content-center">
    <div
      v-if="selectedRow"
      id="overlay"
      class="overlay center-block mx-auto p-3"
    >
      <!--header-->
      <div class="row align-items-start border-bottom mb-2">
        <div class="col text-left">
          <h3>{{ selectedRow.Type }} {{ selectedRow.Identifier }}</h3>
        </div>
        <div class="navbar-text py-0">
          {{ selectedRow.IdentifierUUID }}
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
      <ul v-for="group in groups" :key="group" class="list-group">
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
              <select class="col-md-12" style="border: none">
                <option value="selectedRow.type">{{ selectedRow.Type }}</option>
                <option v-for="type in allTypes" :key="type" :value="type.type">
                  {{ type.type }}
                </option>
              </select>
            </div>

            <!-- 1  Champ date -->
            <p
              v-else-if="field.field == 'DateEarliest'"
              class="col-md-12 p-0 pl-1"
              style="border: none"
            >
              {{
                Date(
                  trenchtoUpdate.filter((x) => {
                    return x.IdentifierUUID == selectedRow.IdentifierUUID;
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
                  <select class="col-md-12 p-0 pl-1" style="border: none">
                    <option value="selectedRow.type">
                      {{ selectedRow[field.field] }}
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
                      return x.IdentifierUUID == selectedRow.IdentifierUUID;
                    })[0][field.field]
                  "
                  type="text"
                  class="col-md-12 p-0 pl-1"
                  style="border: none"
                />
              </div>
              <textarea
                v-else-if="fieldType(field.field).hasOwnProperty('multiline')"
                v-model="
                  trenchtoUpdate.filter((x) => {
                    return x.IdentifierUUID == selectedRow.IdentifierUUID;
                  })[0][field.field]
                "
                class="col-md-12 p-0 pl-1"
                style="border: none"
              ></textarea>

              <!-- cas basique champ avec properties field et label -->
              <input
                v-else
                v-model="
                  trenchtoUpdate.filter((x) => {
                    return x.IdentifierUUID == selectedRow.IdentifierUUID;
                  })[0][field.field]
                "
                type="text"
                class="col-md-12 p-0 pl-1"
                style="border: none"
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
import { updateTrenchItem } from "@/services/ApiClient";
import { useDataState } from "@/services/useDataState";

export default {
  name: "OverLay",
  props: {
    selectedRow: {
      type: Object,
      required: false,
    },
    selectedType: {
      type: String,
      required: false,
    },
  },
  setup() {
    const { allTypes, allFields, fetchedPreferencesBase64 } = useDataState();
    return { allTypes, allFields, fetchedPreferencesBase64 };
  },
  data() {
    return {
      temp: ["papi", "prout", "truc"],
      field: "Material",
    };
  },
  computed: {
    AAA() {
      // attention fields ne liste pas tous les champs
      return this.allFields.filter((x) => x.field == "Type");
    },

    AAAA() {
      return Object.hasOwn(this.AAA, "valuelist");
    },

    valuelist() {
      return this.allFields[33].valuelist;
    },

    selectedTrench() {
      if (this.selectedRow) {
        var array = Object.entries(JSON.parse(sessionStorage.trenchesData)); //object into array
        return array.filter((x) =>
          x[1].some((k) =>
            k.IdentifierUUID.includes(this.selectedRow.IdentifierUUID)
          )
        )[0][0];
      } else {
        return "";
      }
    },

    trenchtoUpdate() {
      if (this.selectedRow) {
        return JSON.parse(sessionStorage.trenchesData)[this.selectedTrench];
      } else {
        return "";
      }
    },
    groups() {
      if (this.allTypes) {
        return this.allTypes.filter((x) => {
          return x.type.includes(this.selectedType);
        })[0].groups;
      } else {
        return this.allTypes;
      }
    },
  },
  methods: {
    fieldExist(field) {
      // attention comme fields ne liste pas tous les champs on verifie si il existe
      return this.allFields.filter((x) => x.field == field).length;
    },

    fieldType(field) {
      // attention fields ne liste pas tous les champs
      return this.allFields.filter((x) => x.field == field)[0];
    },

    setUserPreferences() {
      // alert("to use for user preferences settings")
    },
    pushSurvey() {
      const head = JSON.parse(sessionStorage.trenchesVersion)[
        this.selectedTrench
      ];
      const surveys = this.trenchtoUpdate;
      const preferences = this.fetchedPreferencesBase64;

      updateTrenchItem(this.selectedTrench, head, surveys, preferences).then(
        () => {
          // TODO: tell the user it was saved
          console.log("saved!");
        }
      );
    },
  },
};
</script>
<style scoped>
.overlaywrapper {
  position: absolute;
  top: -5%;
  left: -10%;
  width: 100%;
  height: auto;
  background: rgba(0, 0, 0, 0.7);
  z-index: 9999;
}

.overlay {
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
</style>
