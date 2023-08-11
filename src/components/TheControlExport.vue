<template>
  <div class="container-fluid px-1 q-gutter-sm">
    <h3>Export</h3>
    <q-btn
      align="left"
      padding="xs"
      color="secondary"
      label="json"
      @click="exportFile('json')"
      ><q-tooltip class="bg-accent">items as json file</q-tooltip></q-btn
    >
    <q-btn
      align="left"
      padding="xs"
      color="secondary"
      label=".tab"
      @click="exportFile('tab')"
      ><q-tooltip class="bg-accent">items as .tab file</q-tooltip></q-btn
    >
    <q-btn
      align="left"
      padding="xs"
      color="secondary"
      label="Geojson"
      @click="exportFile('geojson')"
      ><q-tooltip class="bg-accent">trenches as Geojson</q-tooltip></q-btn
    >
  </div>
</template>
<script>
import { geoSerializedToGeojson } from "@/services/json2geojson";
import { mapState } from "pinia";
import { useDataStore } from "@/stores/data";

export default {
  name: "TheControlExport",
  data() {
    return {
      fileData: "",
      fileName: "",
    };
  },
  computed: {
    ...mapState(useDataStore, [
      "checkedTrenchesItems",
      "checkedTrenchesItemsSelectedType",
      "selectedType",
    ]),
  },
  methods: {
    exportFile: function (fileType) {
      if (fileType === "tab") {
        this.fileName = this.selectedType;
        const items = this.checkedTrenchesItemsSelectedType;
        const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
        const header = Object.keys(items[0]);
        this.fileData = [
          header.join("\t"), // header row first
          ...items.map((row) =>
            header
              .map((fieldName) => JSON.stringify(row[fieldName], replacer))
              .join("\t")
          ),
        ].join("\r\n");
      } else if (fileType === "json") {
        this.fileName = this.selectedType;
        this.fileData = JSON.stringify(this.checkedTrenchesItemsSelectedType);
      } else if (fileType === "geojson") {
        this.fileName = "Trenches";
        this.fileData = JSON.stringify(
          geoSerializedToGeojson(this.checkedTrenchesItems)
        ); // tous les items des trenches selectionnées
      }

      const blob = new Blob([this.fileData], { type: "text/plain" });
      const e = document.createEvent("MouseEvents"),
        a = document.createElement("a");
      a.download = this.fileName + "." + fileType;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
      e.initEvent(
        "click",
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      );
      a.dispatchEvent(e);
    },
  },
};
</script>
<style></style>
