<template>
  <div class="q-pa-xs">
    <q-btn-dropdown
      size="0.8em"
      split
      rounded
      :outline="!isLoaded"
      :disable-main-btn="username === ''"
      size:xs
      color="secondary"
      :icon="isLoaded ? 'logout' : 'login'"
      @click="if (username !== '') $emit('connect');"
    >
      <template v-slot:label>
        <div class="q-pl-md">{{ username }}</div>
        <q-tooltip v-if="isLoaded" class="bg-accent">log out</q-tooltip>
        <q-tooltip v-else-if="username === ''" class="bg-accent"
          >create a connection first</q-tooltip
        >
        <q-tooltip v-else class="bg-accent"
          >last login: {{ username }}<br />{{ project }} {{ server }}</q-tooltip
        >
      </template>

      <q-list v-if="!isLoaded">
        <q-item class="q-pt-md" dense>Select a previous connection: </q-item>
        <q-item
          v-for="profile in connectionProfiles"
          :key="profile.server"
          clickable
          v-close-popup
          @click="onItemClick(profile)"
        >
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">
              <q-tooltip>
                {{ profile.username }}
              </q-tooltip>
              {{ profile.username.charAt(0).toUpperCase() }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ profile.project }}</q-item-label>
            <q-item-label caption>{{ profile.server }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon
              clickable
              v-close-popup
              @click="onSideClick(profile)"
              name="delete_forever"
              color="grey"
            />
          </q-item-section>
        </q-item>

        <q-separator />
        <q-item class="q-pt-md" dense>Create a new connection: </q-item>
        <q-item>
          <q-item-section>
            <q-input dense standout v-model="newServer" label="Server" />
            <q-input dense standout v-model="newProject" label="Project" />
            <q-input dense standout v-model="newUsername" label="Username" />
            <q-input
              dense
              standout
              v-model="newPassword"
              label="Password"
              type="password"
            />
          </q-item-section>
          <q-item-section side>
            <q-icon
              @click="onFormClick()"
              clickable
              v-close-popup
              name="add_circle_outline"
              color="primary"
            />
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable @click="exportConnections">
          <q-item-section avatar>
            <q-icon name="file_download" color="secondary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Export connections</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="importConnections">
          <q-item-section avatar>
            <q-icon name="file_upload" color="secondary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Import connections</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-item v-if="isLoaded" clickable @click="importPreferences">
        <q-item-section avatar>
          <q-icon name="file_upload" color="secondary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Upload local preferences file</q-item-label>
        </q-item-section>
      </q-item>
    </q-btn-dropdown>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import { useDataStore } from "@/stores/data";
import { lsStoreProjectsPreferencesBase64 } from "@/services/localStorageManager";

export default {
  emits: ["connect"],
  data() {
    return {
      newServer: null,
      newProject: null,
      newUsername: null,
      newPassword: null,
      connectionProfiles: JSON.parse(
        localStorage.getItem("connections") || "[]"
      ),
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
  methods: {
    ...mapActions(useAppStore, [
      "setServer",
      "setProject",
      "setUsername",
      "setPassword",
    ]),
    ...mapActions(useDataStore, [
      "setProjectPreferencesCrs",
      "setProjectPreferencesTypes",
      "setProjectPreferencesFields",
      "setProjectPreferencesBase64",
    ]),
    onSideClick(profile) {
      const connections = JSON.parse(
        localStorage.getItem("connections") || "[]"
      );

      const updatedConnections = connections.filter(
        (item) =>
          item.server !== profile.server ||
          item.project !== profile.project ||
          item.username !== profile.username
      );
      localStorage.setItem("connections", JSON.stringify(updatedConnections));
      this.connectionProfiles = updatedConnections;
    },

    onItemClick(profile) {
      this.setServer(profile.server);
      this.setProject(profile.project);
      this.setUsername(profile.username);
      this.setPassword(profile.password);
      this.$emit("connect");
    },

    onFormClick() {
      if (
        this.newServer &&
        this.newProject &&
        this.newUsername &&
        this.newPassword
      ) {
        this.setServer(this.newServer);
        this.setProject(this.newProject);
        this.setUsername(this.newUsername);
        this.setPassword(this.newPassword);
        this.$emit("connect");
      }
    },

    exportConnections() {
      const connections = JSON.parse(
        localStorage.getItem("connections") || "[]"
      );
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(connections));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "connections.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },
    importConnections() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const imported = JSON.parse(reader.result);
            const existing = JSON.parse(
              localStorage.getItem("connections") || "[]"
            );
            const merged = [...existing];
            imported.forEach((item) => {
              if (
                !existing.some(
                  (e) =>
                    e.server === item.server &&
                    e.project === item.project &&
                    e.username === item.username
                )
              ) {
                merged.push(item);
              }
            });
            localStorage.setItem("connections", JSON.stringify(merged));
            this.connectionProfiles = merged;
          } catch (err) {
            console.error("Invalid JSON file");
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },
    importPreferences() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const base64 = btoa(unescape(encodeURIComponent(reader.result)));

            // 1 Store locally preferences in case of pushing trenches
            this.setProjectPreferencesBase64(base64);
            // 2 Store preferences also in localStorage for next session
            lsStoreProjectsPreferencesBase64(base64);

            // 3 Parse the JSON to extract and aplly preferences
            let preferences = "";
            try {
              // Attempt to parse the JSON, handling potential formatting issues
              const original = reader.result;
              const cleaned = original.replace(/,\s*(?=[}\]])/g, "");
              if (original !== cleaned) {
                console.warn(
                  " Removed trailing commas from JSON input to ensure valid format."
                );
              }
              preferences = JSON.parse(cleaned);
            } catch (e) {
              console.error("Error parsing preferences JSON:", e);
            }

            this.setProjectPreferencesCrs(preferences.crs || "EPSG:4326");
            this.setProjectPreferencesTypes(preferences.types || []);
            this.setProjectPreferencesFields(preferences.fields || []);
          } catch (err) {
            console.error("Invalid JSON file");
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },
  },
};
</script>
