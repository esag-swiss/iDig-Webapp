<template>
  <div class="ThePatcheswrapper justify-content-center">
    <!--header-->
    <div
      class="sticky-top q-fixed bg-grey-1 q-px-sm full-width row items-center justify-between"
    >
      <div>
        <q-btn
          round
          color="secondary"
          class="q-my-sm"
          icon="undo"
          :size="'sm'"
          @click="setSyncPatches('')"
        /><q-tooltip class="bg-accent">abort uploading</q-tooltip>
      </div>

      {{
        syncPatches.length > 1
          ? syncPatches.length + " conflicts to manage"
          : syncPatches.length + " conflict to manage"
      }}
      <div>
        <q-btn
          round
          color="secondary"
          class="q-my-sm"
          icon="cloud_upload"
          :size="'sm'"
          @click="syncSurvey()"
        />
        <q-tooltip class="bg-accent">upload to iDig server</q-tooltip>
      </div>
    </div>

    <div id="main" class="q-px-sm">
      <q-list separator class="q-px-sm">
        <q-item
          v-for="item in finalVersionItems"
          :key="item.IdentifierUUID"
          class="q-px-sm"
        >
          <q-item-section>
            <q-item-label
              ><strong
                >{{ projectPreferencesTypesTranslation[item.Type] }}
                {{ item.Identifier }}
              </strong></q-item-label
            >
            <q-item-label
              v-for="key in keyModified[item.IdentifierUUID]"
              :key="key"
              class="q-pl-md"
            >
              <strong
                >{{
                  projectPreferencesFieldsWithTranslation[key] ?? key
                }}:</strong
              >

              {{ item[key] }}
            </q-item-label>
          </q-item-section>
          <q-item-section side class="q-px-sm">
            <q-option-group
              v-model="UUIDsWithSelectedOptions[item.IdentifierUUID]"
              :options="versionOptions"
              inline
              dense
              borderless
            />
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
import { apiPushTrench } from "@/services/ApiClient";

export default {
  name: "ThePatches",
  data() {
    return {
      UUIDsWithSelectedOptions: {},
      versionOptions: [
        { label: "Server", value: "server" },
        { label: "Local", value: "local" },
        { label: "Merged", value: "merged" },
      ],
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

    UUIDsSyncPatches() {
      return this.syncPatches.map((obj) => obj.id);
    },

    itemsEdited() {
      return this.checkedTrenchesData[this.syncTrench]
        .filter((item) => this.UUIDsSyncPatches.includes(item.IdentifierUUID))
        .map((item) => item);
    },

    totalPatches() {
      return this.syncPatches.map((patche) => {
        const local = this.itemsEdited.find(
          (item) => item.IdentifierUUID === patche.id
        );
        return { ...patche, local };
      });
    },

    keyModified() {
      const result = {};
      this.totalPatches.forEach((patche) => {
        result[patche.id] = Object.keys(
          this.compareObjectsThree(patche.old, patche.new, patche.local || {})
        );
      });
      return result;
    },

    finalVersionItems() {
      let results = [];
      this.totalPatches.forEach((patche) => {
        const uuid = patche.new.IdentifierUUID;

        const choice = this.UUIDsWithSelectedOptions[uuid];
        if (choice === "server") {
          results.push(patche.new);
        } else if (choice === "local") {
          results.push(patche.local);
        } else if (choice === "merged") {
          results.push(
            this.mergeVersions(patche.old, patche.new, patche.local)
          );
        } else {
          results.push(patche.new);
        }
      });
      return results;
    },
  },

  async mounted() {
    this.syncPatches.forEach((patche) => {
      this.UUIDsWithSelectedOptions[patche.new.IdentifierUUID] = "merged";
    });
  },

  methods: {
    ...mapActions(useDataStore, [
      "setSyncPatches",
      "trenchtoSync",
      "UpdateSyncTrenchData",
    ]),

    compareObjectsThree(obj1, obj2, obj3) {
      const differences = {};
      const allKeys = new Set([
        ...Object.keys(obj1 || {}),
        ...Object.keys(obj2 || {}),
        ...Object.keys(obj3 || {}),
      ]);
      allKeys.delete("Trench");
      allKeys.forEach((key) => {
        if (!(obj1[key] === obj2[key] && obj2[key] === obj3[key])) {
          differences[key] = {
            old: obj1[key],
            server: obj2[key],
            local: obj3[key],
          };
        }
      });
      return differences;
    },

    mergeVersions(oldObj, serverObj, localObj) {
      const merged = { ...serverObj };
      Object.keys(localObj).forEach((key) => {
        if (oldObj[key] !== localObj[key]) {
          merged[key] = localObj[key];
        }
      });
      return merged;
    },

    async syncSurvey() {
      const head = this.syncNewVersion;
      let surveys = [];
      const preferences = this.projectPreferencesBase64;

      surveys = [
        ...this.trenchtoSync(this.syncTrench).filter(
          (item) => !this.UUIDsSyncPatches.includes(item.IdentifierUUID)
        ),
        ...this.finalVersionItems,
      ];
      let resp = await apiPushTrench(
        this.syncTrench,
        head,
        surveys,
        preferences
      );

      if (resp.data.status === "pushed" || resp.data.status === "ok") {
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
        this.$emit("clearTheItem");
      } else if (resp.data.status === "pull") {
        this.setSyncPatches(resp.data.updates);
        Notify.create({
          type: "warning",
          message: `There is a newer version on server`,
        });
      } else {
        Notify.create({
          type: "warning",
          message: `iDig server returned : ${resp.data.status}`,
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
