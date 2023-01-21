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

      <ul v-for="group in groups" :key="group" class="list-group">
        <li
          v-if="group.labels.hasOwnProperty('fr')"
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
          <div v-if="selectedRow" class="col-md-3">{{ field.field }}</div>
          <input
            v-if="trenchtoUpdate != ''"
            type="text"
            v-model="
              trenchtoUpdate.filter((x) => {
                return x.IdentifierUUID.includes(selectedRow.IdentifierUUID);
              })[0][field.field]
            "
            class="col-md-9 p-0 pl-1"
            style="border: none"
          />
        </div>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "over-lay",
  props: {
    selectedRow: {
      type: Object,
      required: false,
    },
    allTypes: {
      type: Object,
      required: false,
    },
    selectedType: {
      type: String,
      required: false,
    },
  },
  data() {
    return {};
  },
  computed: {
    trenchtoUpdate() {
      if (this.selectedRow) {
        return JSON.parse(sessionStorage.trenchesData)[this.selectedRow.Source];
      } else return "";
    },
    groups() {
      if (localStorage.types) {
        return JSON.parse(localStorage.types).filter((x) => {
          return x.type.includes(this.selectedType);
        })[0].groups;
      } else {
        return this.allTypes;
      }
    },
  },
  methods: {
    setUserPreferences() {
      // alert("to use for user preferences settings")
    },
    pushSurvey() {
      console.log(this.selectedRow.Title);
      console.log(
        JSON.parse(sessionStorage.trenchesData)[this.selectedRow.Source].filter(
          (x) => {
            return x.IdentifierUUID.includes(this.selectedRow.IdentifierUUID);
          }
        )[0]
      );
      console.log(this.selectedRow);
      axios({
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "post",
        url:
          "http://" +
          localStorage.IdigServer +
          ":9000/idig/" +
          localStorage.project +
          "/" +
          this.selectedRow.Source,
        auth: {
          username: localStorage.username,
          password: localStorage.password,
        },
        data: {
          head: JSON.parse(sessionStorage.trenchesVersion)[
            this.selectedRow.Source
          ],
          device: "webapp",
          surveys: this.trenchtoUpdate,
          preferences: sessionStorage.preferences,
        },
      })
        .then(() => {
          // alert("connection valide");
        })
        .catch((error) => {
          if (error.response.status == 401) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            alert(error.response.data + "or project"); // idig server retourne 401 si le endpoint n'est pas bon
            console.log(error.response.status);
            console.log(error.response.headers);
          } else {
            alert("server not reachable");
          }
        });
    },
  },
};
</script>
<style scoped>
.overlaywrapper {
  position: fixed;
  top: 5%;
  left: 5%;
  width: 90%;
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