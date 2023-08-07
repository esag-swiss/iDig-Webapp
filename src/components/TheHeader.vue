<template>
  <nav class="navbar navbar-dark bg-dark p-0">
    <!-- Navbar content -->
    <div class="container-fluid">
      <ul class="navbar-nav flex-row flex-wrap bd-navbar-nav pt-2 py-md-0">
        <!-- Title -->
        <div class="navbar-brand" href="#">iDig webapp</div>
      </ul>
      <form class="form-inline my-0">
        <div class="navbar-text text-light p-2">server:</div>
        <input
          :value="server"
          class="my-2 text-light input-header"
          @input="(event) => setServer(event.target.value)"
        />
        <a class="navbar-text text-light p-2">project:</a>
        <input
          :value="project"
          class="m-2 text-light input-header"
          @input="(event) => setProject(event.target.value)"
        />
        <a class="navbar-text text-light p-2">user:</a>
        <input
          :value="username"
          class="m-2 text-light input-header"
          @input="(event) => setUsername(event.target.value)"
        />
        <input
          :value="password"
          type="password"
          class="m-2 text-light input-header"
          placeholder="Password"
          @input="(event) => setPassword(event.target.value)"
        />
        <button
          type="button"
          class="btn btn-outline-secondary m-2 px-1 py-0"
          :class="{ 'is-loaded': isLoaded }"
          @click="connect()"
        >
          connexion
        </button>
      </form>
    </div>
  </nav>
</template>
<script>
import {
  storePersistentUserSettings,
  loadPersistentUserSettingsOrEmptyStrings,
} from "@/services/PersistentUserSettings";
import {
  fetchProjectTrenchesNames,
  fetchPreferences,
} from "@/services/ApiClient";
import { useDataState } from "@/services/useDataState";
import { allTrenchesPerProject } from "@/assets/allTrenchesPerProject";
import { mapActions, mapState } from "pinia";
import { useAppStore } from "@/stores/app";

export default {
  setup() {
    const {
      setProjectTrenchesNames,
      setProjectPreferencesTypes,
      setProjectPreferencesFields,
      setProjectPreferencesBase64,
      firstTrench,
    } = useDataState();
    return {
      setProjectTrenchesNames,
      setProjectPreferencesTypes,
      setProjectPreferencesFields,
      firstTrench,
      setProjectPreferencesBase64,
    };
  },
  computed: {
    ...mapState(useAppStore, [
      "server",
      "project",
      "username",
      "password",
      "isLoaded",
    ]),
  },
  mounted() {
    loadPersistentUserSettingsOrEmptyStrings();
  },
  methods: {
    ...mapActions(useAppStore, [
      "setIsLoaded",
      "setServer",
      "setProject",
      "setUsername",
      "setPassword",
    ]),
    connect() {
      this.setServer(this.cleanServerUserEntry(this.server));

      // const devMode = "new_server";
      const devMode = "old_server";

      if (devMode === "new_server") {
        fetchProjectTrenchesNames()
          .then((response) => {
            storePersistentUserSettings();
            this.manageResponseForFetchAllTrenches(response);
            return fetchPreferences(this.firstTrench);
          })
          .then((response) => {
            this.manageResponseForFetchPreferences(response);
            this.setIsLoaded(true);
          })
          .catch(() => {});
      }

      if (devMode === "old_server") {
        const projectTrenchesNames = allTrenchesPerProject[this.project];
        if (!projectTrenchesNames) {
          alert(`Trenches for project ${this.project} not found.`);
          return;
        }
        this.setProjectTrenchesNames(projectTrenchesNames);

        fetchPreferences(this.firstTrench)
          .then((response) => {
            storePersistentUserSettings();
            this.manageResponseForFetchPreferences(response);
            this.setIsLoaded(true);
          })
          .catch(() => {});
      }
    },
    manageResponseForFetchAllTrenches(response) {
      this.setProjectTrenchesNames(response.data);
    },
    manageResponseForFetchPreferences(response) {
      // Store preferences in base64 format, because it will be necessary to resend them when modifying an item
      this.setProjectPreferencesBase64(response.data.preferences);

      let preferences = decodeURIComponent(
        escape(window.atob(response.data.preferences))
      );

      try {
        preferences = JSON.parse(preferences);
      } catch (e) {
        console.error(e);
        preferences = JSON.parse(
          preferences.replace(/},\n\t\t\t\t\t\t}/g, "}}")
        );
      }

      this.setProjectPreferencesTypes(preferences.types);
      this.setProjectPreferencesFields(preferences.fields);
    },
    cleanServerUserEntry(serverUserEntry) {
      return serverUserEntry
        .replace("htps://", "https://")
        .replace("htp://", "http://");
    },
  },
};
</script>
<style>
.is-loaded {
  color: #fff;
  background-color: #26a69a;
  border-color: #26a69a;
}
.input-header {
  background: #212529;
  border: 0px;
  width: 6em;
}
</style>
