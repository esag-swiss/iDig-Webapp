<template>
  <nav class="navbar navbar-dark bg-dark p-0">
    <!-- Navbar content -->
    <div class="container-fluid">
      <ul class="navbar-nav flex-row flex-wrap bd-navbar-nav pt-2 py-md-0">
        <!-- Title -->
        <div class="navbar-brand" href="#">iDig webapp</div>
      </ul>

      <div v-if="isLoaded">
        <span class="text-white d-none d-md-inline">
          {{ project }} - {{ username }}@{{ server }}
        </span>
        <TheHeaderLang />
        <button
          type="button"
          class="btn btn-outline-secondary m-2 px-1 py-0"
          @click="resetStores"
        >
          déconnexion
        </button>
      </div>

      <form v-else class="form-inline my-0">
        <div class="navbar-text text-light p-2">server:</div>
        <input
          :value="server"
          placeholder=" url complet "
          class="my-2 text-light input-header-lg"
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
          class="m-2 text-light input-header-small"
          placeholder="Password"
          @input="(event) => setPassword(event.target.value)"
        />
        <TheHeaderLang />

        <button
          type="button"
          class="connexion btn btn-outline-secondary m-2 px-1 py-0"
          @click="connect()"
        >
          connexion
        </button>
      </form>
    </div>
  </nav>
</template>
<script>
import { lsStoreConnection } from "@/services/localStorageManager";
import { mapActions, mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import { useDataStore } from "@/stores/data";
import TheHeaderLang from "@/components/TheHeaderLang.vue";

export default {
  components: { TheHeaderLang },
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
      "setProjectPreferencesCrs",
      "setProjectPreferencesTypes",
      "setProjectPreferencesFields",
      "setProjectPreferencesBase64",
      "fetchPreferences",
      "fetchIdigTrenchesNames",
      "fetchProjectTrenchesNamesFromFile",
    ]),
    resetStores() {
      const dataStore = useDataStore();
      dataStore.$reset();
      const appStore = useAppStore();
      appStore.$reset();
    },
    async connect() {
      this.setServer(this.cleanServerUserEntry(this.server));
      try {
        await this.fetchIdigTrenchesNames();
        await this.fetchPreferences(this.firstTrench);
        lsStoreConnection();
      } catch (e) {
        try {
          this.fetchProjectTrenchesNamesFromFile();
          await this.fetchPreferences(this.firstTrench);
          lsStoreConnection();
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
.connexion {
  color: #fff;
  background-color: #26a69a;
  border-color: #26a69a;
}
.input-header {
  background: #212529;
  border: 0px;
  width: 6em;
}
.input-header-small {
  background: #212529;
  border: 0px;
  width: 3em;
}
.input-header-lg {
  background: #212529;
  border: 0px;
  width: 9em;
}
</style>
