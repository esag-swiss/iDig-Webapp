<template>
  <div class="container-fluid">
    <q-btn push color="primary" label="download" @click="exportFile" />
    <select v-model="fileType" class="mx-2">
      <option v-for="type in fileTypes" :key="type" :value="type">
        {{ type }}
      </option>
    </select>
  </div>
</template>
<script>
import { useDataState } from "@/services/useDataState";

export default {
  name: "TheControlExport",
  setup() {
    const { filteredTrenchesItemsStore, selectedType } = useDataState();

    return {
      filteredTrenchesItemsStore,
      selectedType,
    };
  },
  data() {
    return {
      fileTypes: ["tab", "json"],
      fileType: "tab",
      fileData: "",
    };
  },
  methods: {
    exportFile: function () {
      if (this.fileType === "tab") {
        const items = this.filteredTrenchesItemsStore;
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
      } else {
        this.fileData = JSON.stringify(this.filteredTrenchesItemsStore); // les items filtrés des trenches et type selectionnées
      }

      const blob = new Blob([this.fileData], { type: "text/plain" });
      const e = document.createEvent("MouseEvents"),
        a = document.createElement("a");
      a.download = this.selectedType + "." + this.fileType;
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
