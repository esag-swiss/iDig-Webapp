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
        <input
          :value="appState.project"
          class="m-2 text-light"
          style="background: #212529; border: 0px; height: 26px"
          @input="(event) => setAppState('project', event.target.value)"
        />
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
        <button
          type="button"
          class="btn btn-outline-secondary my-0 my-sm-0 m-2 p-0"
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
import Burger from "@/components/Burger.vue";
import {
  storePersistentUserSettings,
  loadPersistentUserSettingsOrEmptyStrings,
} from "@/services/PersistentUserSettings";
import { fetchAllTrenches, fetchPreferences } from "@/services/ApiClient";
import { useAppState } from "@/services/useAppState";
import { useDataState } from "@/services/useDataState";
import { allTrenchesPerProject } from "@/assets/allTrenchesPerProject";

export default {
  components: {
    Burger,
  },
  emits: ["toggle-menu"],
  setup() {
    const { setAppState, appState } = useAppState();
    const {
      setAllTrenches,
      setAllTypes,
      setAllFields,
      setPreferencesBase64,
      firstTrench,
    } = useDataState();
    return {
      setAppState,
      appState,
      setAllTrenches,
      setAllTypes,
      setAllFields,
      firstTrench,
      setPreferencesBase64,
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

      const devMode = "new_server";
      // const devMode = "old_server";

      if (devMode === "new_server") {
        fetchAllTrenches()
          .then((response) => {
            storePersistentUserSettings();
            this.manageResponseForFetchAllTrenches(response);
            return fetchPreferences(this.firstTrench);
          })
          .then((response) => {
            this.manageResponseForFetchPreferences(response);
            this.setAppState("isLoaded", true);
          });
      }

      if (devMode === "old_server") {
        const allTrenches = allTrenchesPerProject[this.appState.project];
        if (!allTrenches) {
          alert(`Trenches for project ${this.appState.project} not found.`);
          return;
        }
        this.setAllTrenches(allTrenches);

        fetchPreferences(this.firstTrench).then((response) => {
          storePersistentUserSettings();
          this.manageResponseForFetchPreferences(response);
          this.setAppState("isLoaded", true);
        });
      }
    },
    manageResponseForFetchAllTrenches(response) {
      this.setAllTrenches(response.data);
    },
    manageResponseForFetchPreferences(response) {
      // Store preferences in base64 format, because it will be necessary to resend them when modifying an item
      this.setPreferencesBase64(response.data.preferences);

      const preferences = JSON.parse(
        decodeURIComponent(escape(window.atob(response.data.preferences)))
      );
      this.setAllTypes(preferences.types);
      this.setAllFields(preferences.fields);
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
.is-loaded {
  color: #fff;
  background-color: #28a745;
  border-color: #28a745;
}
</style>
