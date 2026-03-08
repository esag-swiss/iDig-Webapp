<template>
  <q-toolbar class="bg-black text-white">
    <q-toolbar-title>iDig webapp</q-toolbar-title>
    <q-toolbar-title v-if="isLoaded">
      {{ project }}
    </q-toolbar-title>

    <div v-if="isLoaded">
      <span>{{ server.replace(/^https?:\/\//, "").replace(/:\d+$/, "") }}</span>
    </div>
    <q-space /> <q-space /> <q-space /> <q-space /><q-space /> <q-space />
    <TheHeaderLang />
    <TheHeaderProfile @connect="connect" />
  </q-toolbar>
</template>
<script>
import { lsStoreConnection } from "@/services/localStorageManager";
import { Notify } from "quasar";
import { mapActions, mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import { useDataStore } from "@/stores/data";
import TheHeaderLang from "@/components/TheHeaderLang.vue";
import TheHeaderProfile from "@/components/TheHeaderProfile.vue";

export default {
  components: { TheHeaderLang, TheHeaderProfile },
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
      "fetchAndLoadPreferences",
      "fetchIdigTrenchesNames",
    ]),

    async connect() {
      if (this.isLoaded) {
        // vide les données et les préférences (deconnection)
        const dataStore = useDataStore();
        dataStore.$reset();
        const appStore = useAppStore();
        appStore.$reset();
      } else {
        // teste la connexion et charge les données du premier secteur
        this.setServer(this.cleanServerUserEntry(this.server));
        try {
          await this.fetchIdigTrenchesNames();
          await this.fetchAndLoadPreferences(this.firstTrench);
          lsStoreConnection();
          let message = `${this.$t("app.preferencesLoaded")} : ${
            this.firstTrench
          }`;
          Notify.create({
            type: "positive",
            message,
            html: true,
            timeout: 10000,
          });
        } catch (e) {
          // pas de message affiché car l'erreur est déjà affichée dans ApiClient
          console.error(e);
          this.setIsLoaded(false);
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
