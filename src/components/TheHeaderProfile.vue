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
        <q-tooltip v-else-if="username === ''" class="bg-accent">{{
          $t("app.createProfile")
        }}</q-tooltip>
        <q-tooltip v-else class="bg-accent"
          >{{ $t("app.lastLogin") }} {{ username }}<br />{{ project }}
          {{ server }}</q-tooltip
        >
      </template>

      <q-list v-if="!isLoaded">
        <q-item class="q-pt-md" dense>
          {{ $t("app.selectProfile") }}
        </q-item>
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
                {{ profile.profile ?? profile.username }}
              </q-tooltip>
              {{
                profile.profile
                  ? profile.profile.toUpperCase()
                  : profile.username.charAt(0).toUpperCase()
              }}
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ profile.project }}</q-item-label>
            <q-item-label caption>{{ profile.server }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon
              v-close-popup
              name="delete_forever"
              color="grey"
              clickable
              @click="onSideClick(profile)"
            />
          </q-item-section>
        </q-item>

        <q-separator />
        <q-item class="q-pt-md" dense>{{ $t("app.createProfile") }}</q-item>
        <q-item>
          <q-item-section>
            <q-input v-model="newProfile" dense standout label="Profile Name" />
            <q-input v-model="newServer" dense standout label="Server" />
            <q-input v-model="newProject" dense standout label="Project" />
            <q-input v-model="newUsername" dense standout label="Username" />
            <q-input
              v-model="newPassword"
              dense
              standout
              label="Password"
              type="password"
            />
          </q-item-section>
          <q-item-section side>
            <q-icon
              v-close-popup
              clickable
              name="add_circle_outline"
              color="primary"
              @click="onFormClick()"
            />
          </q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable @click="exportConnections">
          <q-item-section avatar>
            <q-icon name="file_download" color="secondary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t("app.exportProfiles") }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable @click="importConnections">
          <q-item-section avatar>
            <q-icon name="file_upload" color="secondary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ $t("app.importProfiles") }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
      <q-item
        v-if="isLoaded"
        v-close-popup
        clickable
        @click="importPreferences"
      >
        <q-item-section avatar>
          <q-icon name="file_upload" color="secondary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ $t("app.upload local pref") }}</q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="isLoaded">
        <q-item-section avatar>
          <q-icon name="file_upload" color="secondary" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ $t("app.upload pref from trench") }}</q-item-label>
        </q-item-section>
        <q-item-section>
          <q-btn-dropdown>
            <q-list dense>
              <q-item
                v-for="trenchName in projectTrenchesNames"
                :key="trenchName"
                v-close-popup
                clickable
                @click="importTrenchPreferences(trenchName)"
              >
                <q-item-section>
                  <q-item-label>{{ trenchName }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-item-section>
      </q-item>
    </q-btn-dropdown>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import { useDataStore } from "@/stores/data";
import {
  lsStoreProfiles,
  lsStoreProjectsPreferencesBase64,
} from "@/services/localStorageManager";
import { Notify } from "quasar";

export default {
  emits: ["connect"],
  data() {
    return {
      newProfile: null,
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
    ...mapState(useDataStore, ["projectTrenchesNames"]),
  },
  methods: {
    ...mapActions(useAppStore, [
      "setCurrentProfile",
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
      "fetchAndLoadPreferences",
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
      this.setCurrentProfile(profile.profile || profile.username);
      this.setServer(profile.server);
      this.setProject(profile.project);
      this.setUsername(profile.username);
      this.setPassword(profile.password);
      this.$emit("connect");
    },

    onFormClick() {
      if (
        this.newProfile &&
        this.newServer &&
        this.newProject &&
        this.newUsername &&
        this.newPassword
      ) {
        this.setCurrentProfile(this.newProfile);
        this.setServer(this.newServer);
        this.setProject(this.newProject);
        this.setUsername(this.newUsername);
        this.setPassword(this.newPassword);
        this.$emit("connect");
        lsStoreProfiles(
          this.newProfile,
          this.newServer,
          this.newProject,
          this.newUsername,
          this.newPassword
        );
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
    async importTrenchPreferences(trench) {
      await this.fetchAndLoadPreferences(trench);
      try {
        await this.fetchAndLoadPreferences(trench);
        let message = `${this.$t("app.preferencesLoaded")} : ${trench}`;
        Notify.create({
          type: "positive",
          message,
          html: true,
          timeout: 10000,
        });
      } catch (e) {
        console.error(e);
        this.setIsLoaded(false);
      }
    },
  },
};
</script>
