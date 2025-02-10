<template>
  <div class="q-pa-xs">
    <q-btn-dropdown
      size="0.8em"
      split
      rounded
      :outline="!isLoaded"
      :disable-dropdown="isLoaded"
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
      <q-list>
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
      </q-list>
    </q-btn-dropdown>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import { useDataStore } from "@/stores/data";

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
  },
};
</script>
