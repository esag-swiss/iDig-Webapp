<template>
  <nav class="navbar navbar-dark bg-dark p-0">
    <!-- Navbar content -->
    <div class="container-fluid">
      <ul class="navbar-nav flex-row flex-wrap bd-navbar-nav pt-2 py-md-0">
        <!-- Title -->
        <div class="navbar-brand pr-3" href="#">iDig webapp</div>
      </ul>
      <form class="form-inline my-2 my-lg-0">
        <div class="navbar-text text-light p-2">server:</div>
        <input
          :value="appState.server"
          class="my-2 text-light input-header"
          @input="(event) => setAppState('server', event.target.value)"
        />
        <a class="navbar-text text-light p-2">project:</a>
        <input
          :value="appState.project"
          class="m-2 text-light input-header"
          @input="(event) => setAppState('project', event.target.value)"
        />
        <a class="navbar-text text-light p-2">user:</a>
        <input
          :value="appState.username"
          class="m-2 text-light input-header"
          @input="(event) => setAppState('username', event.target.value)"
        />
        <input
          :value="appState.password"
          type="password"
          class="m-2 text-light input-header"
          placeholder="Password"
          @input="(event) => setAppState('password', event.target.value)"
        />
        <button
          type="button"
          class="btn btn-outline-secondary m-2 px-1 py-0"
          :class="{ 'is-loaded': appState.isLoaded }"
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
import { useAppState } from "@/services/useAppState";
import { useDataState } from "@/services/useDataState";
import { allTrenchesPerProject } from "@/assets/allTrenchesPerProject";

export default {
  setup() {
    const { setAppState, appState } = useAppState();
    const {
      setProjectTrenchesNames,
      setProjectPreferencesTypes,
      setProjectPreferencesFields,
      setProjectPreferencesBase64,
      firstTrench,
    } = useDataState();
    return {
      setAppState,
      appState,
      setProjectTrenchesNames,
      setProjectPreferencesTypes,
      setProjectPreferencesFields,
      firstTrench,
      setProjectPreferencesBase64,
    };
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
            this.setAppState("isLoaded", true);
          })
          .catch(() => {});
      }

      if (devMode === "old_server") {
        const projectTrenchesNames =
          allTrenchesPerProject[this.appState.project];
        if (!projectTrenchesNames) {
          alert(`Trenches for project ${this.appState.project} not found.`);
          return;
        }
        this.setProjectTrenchesNames(projectTrenchesNames);

        fetchPreferences(this.firstTrench)
          .then((response) => {
            storePersistentUserSettings();
            this.manageResponseForFetchPreferences(response);
            this.setAppState("isLoaded", true);
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

      const preferences = JSON.parse(
        decodeURIComponent(escape(window.atob(response.data.preferences)))
      );
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
