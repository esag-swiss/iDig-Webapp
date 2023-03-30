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
          v-model="server"
          class="my-2 text-light"
          style="background: #212529; border: 0px; width: 7em"
        />
        <!-- select project -->
        <a class="navbar-text text-light p-2">project:</a>
        <select
          v-model="project"
          class="m-2 text-light"
          style="background: #212529; border: 0px; height: 26px"
        >
          <option v-for="project in projects" :key="project" :value="project">
            {{ project }}
          </option>
        </select>
        <!-- select user -->
        <a class="navbar-text text-light p-2">user:</a>
        <input
          v-model="username"
          class="m-2 text-light"
          style="background: #212529; border: 0px; width: 6em"
        />
        <input
          v-model="password"
          type="password"
          class="m-2 text-light"
          style="background: #212529; border: 0px; width: 6em"
          placeholder="Password"
        />
        <!-- select lang -->

        <!-- <select
          class="m-2 text-light"
          v-model="lang"
          style="background: #212529; border: 0px; height: 26px"
        >
          <option v-for="lang in langs" :key="lang" :value="lang">
            {{ lang }}
          </option>
        </select> -->
        <button
          type="button"
          class="btn btn-outline-secondary my-0 my-sm-0 m-2 p-0"
          :class="{ isConnected: isActive }"
          @click="connect()"
        >
          connexion
        </button>
      </form>
    </div>
  </nav>
</template>
<script>
import axios from "axios";
import Burger from "@/components/Burger.vue";
import Preferences from "@/data/Preferences.json";
import {
  storePersistentUserSettings,
  getPersistentUserSettingsOrEmptyStrings,
} from "@/services/PersistentUserSettings";
import {
  cleanServerUserEntry,
  fetchAllTrenches,
  fetchTrench,
} from "@/services/ApiClient";

export default {
  components: {
    Burger,
  },
  emits: ["all-types", "all-trenches", "toggle-menu"],
  data() {
    return {
      server: "localhost",
      project: "Amarynthos",
      username: "idig",
      password: "idig",
      Preferences: Preferences,
      projects: Preferences.projects,
      langs: ["fr", "en", "el"],
      lang: "fr",
      isActive: false,
      allTrenches: [], // a nettoyer
    };
  },
  computed: {
    trenches() {
      return this.Preferences[this.project];
    },
  },
  // charge les préférences de connexion si elles existent
  mounted() {
    const { lang, server, project, username, password } =
      getPersistentUserSettingsOrEmptyStrings();
    this.lang = lang;
    this.server = server;
    this.project = project;
    this.username = username;
    this.password = password;
  },
  methods: {
    connect() {
      this.server = cleanServerUserEntry(this.server);

      const devMode = "new_server";
      // const devMode = "old_server";

      if (devMode === "new_server") {
        fetchAllTrenches(
          this.username,
          this.password,
          this.server,
          this.project
        ).then((response) => {
          storePersistentUserSettings(
            this.server,
            this.project,
            this.username,
            this.password,
            this.lang
          );

          this.manageResponseForFetchAllTrenches(response);

          fetchTrench(this.allTrenches[0]).then((response) => {
            // switch button to green , ajouter if trenches loaded ?
            this.isActive = true;

            this.manageResponseForFetchTrench(response);
          });
        });
      } else {
        // old_server
        fetchTrench(this.trenches[0]).then((response) => {
          this.isActive = true;

          storePersistentUserSettings(
            this.server,
            this.project,
            this.username,
            this.password,
            this.lang
          );

          this.manageResponseForFetchTrench(response);
        });
      }
    },
    manageResponseForFetchAllTrenches(response) {
      // envoi les trenches du projet au parent
      this.$emit(
        "all-trenches",
        response.data.filter((item) => item !== "refs" && item !== "objects")
      ); // pour lister les trenches à gauche peut etre doublon avec local storage
      this.allTrenches = response.data.filter(
        (item) => item !== "refs" && item !== "objects"
      );
    },
    manageResponseForFetchTrench(response) {
      // stores  prefences base64 in session storage to allow PUSH
      sessionStorage.setItem("preferences", response.data.preferences);

      // get preferences in json to access groupes, types, fields etc
      this.preferences = decodeURIComponent(
        escape(window.atob(response.data.preferences))
      ); // escape is deprecated
      this.preferences = JSON.parse(this.preferences);

      // utilisé par Overlay.vue pour afficher les champs attachés au type d'objet
      localStorage.setItem("types", JSON.stringify(this.preferences.types));
      sessionStorage.setItem("types", JSON.stringify(this.preferences.types));
      this.$emit("all-types", this.preferences.types);

      // utilisé par FilterFields.vue pour afficher les champs
      localStorage.setItem("fields", JSON.stringify(this.preferences.fields));
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
