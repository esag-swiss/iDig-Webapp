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
        <div class="navbar-text text-light p-2">server:</div>
        <input
          :value="appState.server"
          class="my-2 text-light"
          style="background: #212529; border: 0px; width: 7em"
          @input="(event) => setAppState('server', event.target.value)"
        />
        <a class="navbar-text text-light p-2">project:</a>
        <select
          :value="appState.project"
          class="m-2 text-light"
          style="background: #212529; border: 0px; height: 26px"
          @input="(event) => setAppState('project', event.target.value)"
        >
          <option v-for="project in projects" :key="project" :value="project">
            {{ project }}
          </option>
        </select>
        <a class="navbar-text text-light p-2">user:</a>
        <input
          :value="appState.username"
          class="m-2 text-light"
          style="background: #212529; border: 0px; width: 6em"
          @input="(event) => setAppState('username', event.target.value)"
        />
        <input
          :value="appState.password"
          type="password"
          class="m-2 text-light"
          style="background: #212529; border: 0px; width: 6em"
          placeholder="Password"
          @input="(event) => setAppState('password', event.target.value)"
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
import Burger from "@/components/Burger.vue";
import Preferences from "@/data/Preferences.json";
import {
  storePersistentUserSettings,
  loadPersistentUserSettingsOrEmptyStrings,
} from "@/services/PersistentUserSettings";
import { fetchAllTrenches, fetchTrench } from "@/services/ApiClient";
import { useAppState } from "@/services/useAppState";
import { useDataState } from "@/services/useDataState";

export default {
  components: {
    Burger,
  },
  emits: ["toggle-menu"],
  setup() {
    const { setAppState, appState } = useAppState();
    const { setAllTrenches, setAllTypes, firstTrench } = useDataState();
    return { setAppState, appState, setAllTrenches, setAllTypes, firstTrench };
  },
  data() {
    return {
      Preferences: Preferences,
      projects: Preferences.projects,
      langs: ["fr", "en", "el"],
      lang: "fr",
      isActive: false,
    };
  },
  computed: {
    trenches() {
      return this.Preferences[this.project];
    },
  },
  mounted() {
    loadPersistentUserSettingsOrEmptyStrings();
  },
  methods: {
    connect() {
      this.setAppState(
        "server",
        this.cleanServerUserEntry(this.appState.server)
      );

      const devMode = "new_server";
      // const devMode = "old_server";

      if (devMode === "new_server") {
        fetchAllTrenches()
          .then((response) => {
            storePersistentUserSettings();

            this.manageResponseForFetchAllTrenches(response);

            return fetchTrench(this.firstTrench);
          })
          .then((response) => {
            // switch button to green , ajouter if trenches loaded ?
            this.isActive = true;

            this.manageResponseForFetchTrench(response);
          });
      } else {
        // old_server
        fetchTrench(this.firstTrench).then((response) => {
          this.isActive = true;

          storePersistentUserSettings();

          this.manageResponseForFetchTrench(response);
        });
      }
    },
    manageResponseForFetchAllTrenches(response) {
      this.setAllTrenches(
        response.data.filter((item) => item !== "refs" && item !== "objects")
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

      this.setAllTypes(JSON.stringify(this.preferences.types));

      // utilisé par FilterFields.vue pour afficher les champs
      localStorage.setItem("fields", JSON.stringify(this.preferences.fields));
    },
    cleanServerUserEntry(serverUserEntry) {
      return serverUserEntry
        .replace("https://", "")
        .replace("http://", "")
        .replace(":9000", "");
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
