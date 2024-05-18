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
          ? syncPatches.length + " Modifications"
          : syncPatches.length + " Modification"
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
          v-for="(patche, index) in syncPatches"
          :key="patche"
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
              {{ value }}
            </q-item-label>
          </q-item-section>
          <q-item-section side class="q-px-sm">
            <q-toggle
              v-model="toggleArrayOfValues"
              :val="patche.new.IdentifierUUID"
              color="blue"
              class="q-px-sm"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "pinia";
import { useDataStore } from "@/stores/data";

export default {
  name: "ThePatches",
  data() {
    return {
      toggleArrayOfValues: [],
      newItems: [],
    };
  },
  computed: {
    ...mapState(useDataStore, [
      "syncPatches",
      "syncTrench",
      "projectPreferencesFieldsWithTranslation",
      "projectPreferencesTypesTranslation",
    ]),
  },
  mounted() {
    this.toggleArrayOfValues = this.syncPatches.map((obj) => obj.id);
  },
  methods: {
    ...mapActions(useDataStore, [
      "setSyncPatches",
      "trenchtoSync",
      "trenchtoSync",
    ]),
    syncSurvey() {
      this.newItems = this.syncPatches
        .filter((item) => this.toggleArrayOfValues.includes(item.id))
        .map((item) => item.new);
    },

    compareObjects(oldObj, newObj) {
      const differences = {};
      const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
      allKeys.forEach((key) => {
        if (oldObj[key] !== newObj[key]) {
          differences[key] = newObj[key];
        }
      });
      return differences;
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

/* .ThePatches {
  height: auto;
  margin-top: 0%;
  margin-bottom: 0%;
  width: 100%;
  background: rgb(255, 255, 255);
} */
</style>
