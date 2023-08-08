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
import { storePersistentUserSettings } from "@/services/PersistentUserSettings";
import { mapActions, mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import { useDataStore } from "@/stores/data";

export default {
  computed: {
    ...mapState(useAppStore, [
      "server",
      "project",
      "username",
      "password",
      "isLoaded",
    ]),
    ...mapState(useDataStore, ["firstTrench"]),
  },
  methods: {
    ...mapActions(useAppStore, [
      "setIsLoaded",
      "setServer",
      "setProject",
      "setUsername",
      "setPassword",
    ]),
    ...mapActions(useDataStore, [
      "setProjectTrenchesNames",
      "setProjectPreferencesTypes",
      "setProjectPreferencesFields",
      "setProjectPreferencesBase64",
      "fetchPreferences",
      "fetchProjectTrenchesNames",
      "fetchProjectTrenchesNamesFromFile",
    ]),
    async connect() {
      this.setServer(this.cleanServerUserEntry(this.server));

      const devMode = "new_server";
      // const devMode = "old_server"; TODO reput on new

      if (devMode === "new_server") {
        try {
          await this.fetchProjectTrenchesNames();
          await this.fetchPreferences(this.firstTrench);
          storePersistentUserSettings();
        } catch (e) {
          /* empty */
        }
      }

      if (devMode === "old_server") {
        try {
          this.fetchProjectTrenchesNamesFromFile();
          await this.fetchPreferences(this.firstTrench);
          storePersistentUserSettings();
        } catch (e) {
          /* empty */
        }
      }
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
