<template>
  <div class="ThePatcheswrapper justify-content-center">
    <div
      id="header"
      class="sticky-top q-fixed bg-grey-4 q-px-sm q-py-sm full-width row items-center justify-between"
    >
      <q-btn
        round
        color="secondary"
        class="m-1 pl-3"
        icon="undo"
        :size="'sm'"
        @click="setSyncPatches('')"
      />

      {{
        syncPatches.length > 1
          ? syncPatches.length + " Modifications on iDig server"
          : syncPatches.length + " Modification on iDig server"
      }}
      <q-btn
        round
        color="secondary"
        class="m-1 pl-3"
        icon="cloud_upload"
        :size="'sm'"
        @click="syncSurvey()"
      />
    </div>

    <div id="main" class="q-px-sm">
      <q-list separator class="q-px-sm">
        <q-item
          v-for="patche in patchesInConflict"
          :key="patche.id"
          class="q-px-sm"
        >
          <q-item-section>
            <q-item-label
              >{{ projectPreferencesTypesTranslation[patche.new.Type] }}
              {{ patche.new.Identifier }} {{ patche.new.Title }}</q-item-label
            >
            <q-item-label
              v-for="[key, value] of Object.entries(
                compareObjects(patche.old, patche.new)
              )"
              :key="key"
              caption
            >
              {{ projectPreferencesFieldsWithTranslation[key] ?? key }}:
              {{ value.old + " -> " + value.new }}
            </q-item-label>
          </q-item-section>
          <q-item-section side class="q-px-sm">
            <q-toggle
              v-model="toggleArrayOfValues"
              :val="patche.new.IdentifierUUID"
              :color="patche.Conflict ? 'red' : 'blue'"
              class="q-px-sm"
            /><q-tooltip class="bg-accent">{{
              "reject or accept the modification from server"
            }}</q-tooltip>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { Notify } from "quasar";
import { useDataStore } from "@/stores/data";
import { apiUpdateTrenchItem } from "@/services/ApiClient";
import { openDB, readDataInIndexedDB } from "@/services/indexedDbManager";

export default {
  name: "ThePatches",
  data() {
    return {
      toggleArrayOfValues: [],
      newItems: [],
      oldTrenchData: [],
      locallyChangedIdentifierUUID: [],
    };
  },
  computed: {
    ...mapState(useDataStore, [
      "syncPatches",
      "syncTrench",
      "syncNewVersion",
      "checkedTrenchesVersion",
      "projectPreferencesFieldsWithTranslation",
      "projectPreferencesTypesTranslation",
      "checkedTrenchesData",
      "projectPreferencesBase64",
    ]),

    patchesInConflict() {
      return this.syncPatches
        .map((obj) => {
          return {
            ...obj,
            Conflict: this.locallyChangedIdentifierUUID.includes(obj.id),
          };
        })
        .sort((a, b) => b.Conflict - a.Conflict);
    },
  },

  async mounted() {
    this.toggleArrayOfValues = this.syncPatches.map((obj) => obj.id);
    const db = await openDB();
    const oldTrenchData = JSON.parse(
      await readDataInIndexedDB(db, this.syncTrench)
    );
    const currentTrenchData = this.checkedTrenchesData[this.syncTrench];
    let difInTrench = [];

    for (let i = 0; i < oldTrenchData.length; i++) {
      const differences = this.compareTrenches(
        oldTrenchData[i],
        currentTrenchData[i]
      );
      if (Object.keys(differences).length > 0) {
        difInTrench.push(oldTrenchData[i].IdentifierUUID);
      }
    }
    // console.log(difInTrench);
    this.locallyChangedIdentifierUUID = difInTrench;
    // console.log(currentTrenchData[0]);
    // console.log(oldTrenchData); // Si vous voulez voir le résultat
  },

  methods: {
    ...mapActions(useDataStore, [
      "setSyncPatches",
      "trenchtoSync",
      "UpdateSyncTrenchData",
    ]),

    compareObjects(oldObj, newObj) {
      const differences = {};
      const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
      allKeys.forEach((key) => {
        if (oldObj[key] !== newObj[key]) {
          differences[key] = { new: newObj[key], old: oldObj[key] };
        }
      });
      return differences;
    },

    compareTrenches(oldObj, newObj) {
      const differences = {};
      const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
      allKeys.forEach((key) => {
        if (oldObj[key] !== newObj[key]) {
          differences[key] = newObj[key];
        }
      });
      return differences;
    },

    async syncSurvey() {
      const head = this.syncNewVersion;
      let surveys = [];
      const preferences = this.projectPreferencesBase64;

      this.newItems = this.syncPatches
        .filter((item) => this.toggleArrayOfValues.includes(item.id))
        .map((item) => item.new);

      surveys = [
        ...this.trenchtoSync(this.syncTrench).filter(
          (item) => !this.toggleArrayOfValues.includes(item.IdentifierUUID)
        ),
        ...this.newItems,
      ];
      let resp = await apiUpdateTrenchItem(
        this.syncTrench,
        head,
        surveys,
        preferences
      );

      if (resp.data.status === "pushed") {
        // mettre les lignes suivantes conccernant version dans data.js
        this.checkedTrenchesVersion[this.syncTrench] = resp.data.version;
        // Update localStorage
        localStorage.setItem(
          "localTrenchesVersion",
          JSON.stringify(this.checkedTrenchesVersion)
        );

        this.UpdateSyncTrenchData(this.syncTrench, surveys);

        Notify.create({
          type: "positive",
          message: `The item was saved`,
        });
        this.setSyncPatches("");
      } else if (resp.data.status === "pull") {
        this.setSyncPatches(resp.data.updates);
        Notify.create({
          type: "warning",
          message: `There is a newer version on server`,
        });
      } else {
        Notify.create({
          type: "positive",
          message: `sync ok`,
        });
      }
    },
  },
};
</script>

<style scoped>
.ThePatcheswrapper {
  position: absolute;
  width: 90%;
  height: 90vh;
  overflow-y: auto;
  background: rgb(255, 255, 255);
  z-index: 1034;
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none; /* Firefox */
  border-radius: 12px;
}
.ThePatcheswrapper::-webkit-scrollbar {
  display: none; /* Safari and Chrome */
}
</style>
