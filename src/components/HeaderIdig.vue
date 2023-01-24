<template>
  <nav class="navbar navbar-dark bg-dark p-0">
    <!-- Navbar content -->
    <div class="container-fluid">
      <ul class="navbar-nav flex-row flex-wrap bd-navbar-nav pt-2 py-md-0">
        <Burger @toggle-menu="toggleMenu"></Burger>
        <!-- Title -->
        <div class="navbar-brand pr-3" href="#">iDig webapp</div>
      </ul>
      <form class="form-inline my-2 my-lg-0">
        <!-- select server -->
        <div class="navbar-text text-light p-2">server:</div>
        <input
          class="my-2 text-light"
          v-model="server"
          style="background: #212529; border: 0px; width: 7em"
        />
        <!-- select project -->
        <a class="navbar-text text-light p-2">project:</a>
        <select
          class="m-2 text-light"
          v-model="project"
          style="background: #212529; border: 0px; height: 26px"
        >
          <option v-for="project in projects" :key="project" :value="project">
            {{ project }}
          </option>
        </select>
        <!-- select user -->
        <a class="navbar-text text-light p-2">user:</a>
        <input
          class="m-2 text-light"
          v-model="username"
          style="background: #212529; border: 0px; width: 6em"
        />
        <input
          type="password"
          class="m-2 text-light"
          v-model="password"
          style="background: #212529; border: 0px; width: 6em"
          placeholder="Password"
        />
         <!-- select lang -->
        
        <select
          class="m-2 text-light"
          v-model="lang"
          style="background: #212529; border: 0px; height: 26px"
        >
          <option v-for="lang in langs" :key="lang" :value="lang">
            {{ lang }}
          </option>
        </select>
        <button
          type="button"
          class="btn btn-outline-secondary my-0 my-sm-0 m-2 p-0"
          :class="{ isConnected: isActive }"
          @click="Connexion()"
        >
          connexion
        </button>
      </form>
    </div>
  </nav>
</template>
<script>
import axios from "axios";
import Burger from "../components/Burger.vue";
import Preferences from "../data/Preferences.json";

export default {
  data() {
    return {
      server: "localhost",
      project: "Amarynthos",
      username: "idig",
      password: "idig",
      lang: "fr",
      Preferences: Preferences,
      projects: Preferences.projects,
      langs: ['fr','en','el'],
      isActive: false,
    };
  },
  components: {
    Burger,
  },
  // charge les préférences de connexion si elles existent
  mounted() {
    if (localStorage.lang) {
      this.lang = localStorage.lang;
    }
        if (localStorage.IdigServer) {
      this.server = localStorage.IdigServer;
    }
    if (localStorage.project) {
      this.project = localStorage.project;
    }
    if (localStorage.IdigServer) {
      this.username = localStorage.username;
    }
    if (localStorage.project) {
      this.password = localStorage.password;
    }
  },
  computed: {
    trenches() {
      return this.Preferences[this.project];
    },
  },

  methods: {
    Connexion: function () {
      // clean server entry by user
      this.server = this.server.replace("https://", "");
      this.server = this.server.replace("http://", "");
      this.server = this.server.replace(":9000", "");
      // retrieve preferences from server if connection settings valid
      axios({
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "post",
        url:
          "http://" +
          this.server +
          ":9000/idig/" +
          this.project +
          "/" +
          this.trenches[0],
        auth: {
          username: this.username,
          password: this.password,
        },
        data: {
          head: "",
          surveys: [],
        },
      })
        .then((response) => {
          // switch button to green
          this.isActive = true;
          // envoi les trenches du projet au parent
          this.$emit("all-trenches", this.trenches); // pour lister les trenches à gauche peut etre doublon avec local storage

          // stores  prefences base64 in session storage to allow PUSH
          sessionStorage.setItem("preferences", response.data.preferences);

          // get preferences in json to access groupes, types, fields etc
          this.preferences = decodeURIComponent(
            escape(window.atob(response.data.preferences))
          ); // escape is deprecated
          this.preferences = JSON.parse(this.preferences);

          // utilisé par Overlay.vue pour afficher les champs attachés au type d'objet
          localStorage.setItem("types", JSON.stringify(this.preferences.types));
          this.$emit("all-types", this.preferences.types);

          // utilisé par FilterFields.vue pour afficher les champs
          localStorage.setItem("fields", JSON.stringify(this.preferences.fields));

          // store to local
          localStorage.setItem("lang", this.lang);
          localStorage.setItem("IdigServer", this.server);
          localStorage.setItem("project", this.project);
          localStorage.setItem("username", this.username);
          localStorage.setItem("password", this.password);
          localStorage.setItem(
            "trenches",
            JSON.stringify(this.Preferences[this.project])
          );

        })
        .catch((error) => {
          this.isActive = false;
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

    toggleMenu() {
      this.isBurgerActive = !this.isBurgerActive;
      this.$emit("toggle-menu");
    },
  },
};
</script>
<style>
.isConnected {
  color: #fff;
  background-color: #28a745;
  border-color: #28a745;
}
</style>