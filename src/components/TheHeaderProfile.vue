<template>
  <div class="q-pa-xs">
    <q-btn-dropdown
      split
      rounded
      :outline="!isLoaded"
      :disable-dropdown="isLoaded"
      size:xs
      color="secondary"
      icon="account_circle"
      @click="$emit('connect')"
    >
      <template v-slot:label>
        <div class="row items-center no-wrap">
          <div class="text-center">{{ username }}</div>
          <q-tooltip v-if="isLoaded" class="bg-accent">log out</q-tooltip>

          <q-tooltip v-else class="bg-accent"
            >last login: {{ username }}<br />{{ project }}
            {{ server }}</q-tooltip
          >
        </div>
      </template>
      <q-list>
        <q-item dense>Select a previous connection: </q-item>
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
        <q-item dense>Create a new connection: </q-item>
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
  setup() {
    return {
      onMainClick() {
        // console.log('Clicked on main button')
      },
    };
  },
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
      //   this.$emit("connect");
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
        // const newProfile = {
        //   server: this.newServer,
        //   project: this.newProject,
        //   username: this.newUsername,
        //   password: this.newPassword,
        // };
        // const connections = JSON.parse(
        //   localStorage.getItem("connections") || "[]"
        // );
        // connections.push(newProfile);
        // localStorage.setItem("connections", JSON.stringify(connections));
        // this.connectionProfiles = connections;
        // this.newServer =
        //   this.newProject =
        //   this.newUsername =
        //   this.newPassword =
        //     "";
      }
    },
  },
};
</script>
