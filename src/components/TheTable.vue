<template>
  <div
    v-show="selectedItem"
    class="TheItemframe"
    @click="clearTheItem2, setSyncPatches(''), setSelectedItem(null)"
  ></div>
  <ThePatches
    v-if="syncPatches"
    @clearTheItem="clearTheItem2, setSelectedItem(null)"
  ></ThePatches>
  <TheItem v-if="selectedItem"> </TheItem>

  <q-bar Class=" q-fixed bg-grey-1 q-px-sm full-width row items-right">
    <q-btn
      align="right"
      size="10px"
      padding="2px 5px"
      color="secondary"
      label=".json"
      @click="exportFile('json')"
      ><q-tooltip class="bg-accent"
        >download items as .json file</q-tooltip
      ></q-btn
    >
    <q-btn
      align="right"
      size="10px"
      padding="2px 5px"
      color="secondary"
      label=".csv"
      @click="exportFile('csv')"
      ><q-tooltip class="bg-accent"
        >download items as .csv file</q-tooltip
      ></q-btn
    >
    <q-btn
      align="right"
      size="10px"
      padding="2px 5px"
      color="secondary"
      label=".pdf"
      @click="exportFile('pdf')"
      ><q-tooltip class="bg-accent"
        >download items as .PDF file</q-tooltip
      ></q-btn
    >
    <q-space />
    <!-- <div>
      <q-btn
        v-if="tableEditMode"
        round
        color="secondary"
        icon="cloud_upload"
        :size="'sm'"
        @click="pushSurvey()"
      />
      <q-tooltip class="bg-accent"
        >upload curent trench modification to iDig server</q-tooltip
      >
    </div> -->
    <!-- <div class="mx-1">
      <q-toggle v-model="tableEditMode" color="red" />
      <q-tooltip class="bg-accent">"enable edit mode" </q-tooltip>
    </div> -->
  </q-bar>
  <div ref="table" class="q-pa-xs"></div>
</template>

<script>
import "tabulator-tables/dist/css/tabulator_simple.min.css";
import { mapActions, mapState } from "pinia";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { useDataStore } from "@/stores/data";
import { useAppStore } from "@/stores/app";
import TheItem from "@/components/TheItem.vue";
import ThePatches from "@/components/ThePatches.vue";

import { avrileSansRegularNormal } from "@/assets/AvrileSans-Regular-normal.js";
import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
applyPlugin(jsPDF);

export default {
  name: "TheTable",
  components: { TheItem, ThePatches },

  data() {
    return {
      tabulator: null, //variable to hold table
      // tableEditMode: false,
    };
  },

  computed: {
    ...mapState(useAppStore, ["project"]),
    ...mapState(useDataStore, [
      "lang",
      "syncPatches",
      "setCheckedFieldNames",
      "selectedItem",
      "selectedType",
      "checkedTrenchesNames",
      "checkedFieldNames",
      "projectPreferencesFieldsWithTranslation",
      "projectPreferencesTypesTranslation",
      "projectPreferencesTypesTranslationPlurals",
      "checkedTrenchesItemsSelectedTypeAndSearched",
    ]),

    columnsTabulator() {
      var headerMenu = [
        {
          label: "Hide Column",
          action: (e, column) => {
            this.setCheckedFieldNames(
              this.checkedFieldNames.filter(
                (fieldName) => fieldName !== column.getField()
              )
            );
          },
        },
      ];
      return this.checkedFieldNames.map((fieldName) => ({
        title: this.projectPreferencesFieldsWithTranslation[fieldName],
        headerFilter: "input",
        field: fieldName,
        headerMenu: headerMenu,
        // editor: "input",
      }));
    },
  },

  mounted() {
    //instantiate Tabulator when element is mounted
    this.tabulator = new Tabulator(this.$refs.table, {
      dependencies: {
        jspdf: jsPDF,
      },
      data: this.checkedTrenchesItemsSelectedTypeAndSearched, //link data to table
      // reactiveData: true, //turn on data reactivity
      layout: "fitColumns", //fit columns to width of table (optional)
      movableColumns: true,
      columns: this.columnsTabulator, //define table columns
      height: "98%",
      // editTriggerEvent: "dblclick",
      rowContextMenu: [
        {
          label: "Copy to clipboard",

          action: function (e, row) {
            const rowData = row.getData();
            const text = JSON.stringify(rowData, null, 2);
            navigator.clipboard
              .writeText(text)
              .catch((err) => console.error("Failed to copy: ", err));
          },
        },
        {
          separator: true,
        },
        {
          disabled: false,
          label: "Open to new tab",
          action: (e, row) => {
            this.openInNewTab2(row.getData());
          },
        },
      ],
    });

    this.$watch(
      () => this.checkedTrenchesItemsSelectedTypeAndSearched,
      (newRows) => {
        if (this.tabulator) {
          this.tabulator.replaceData(newRows);
        }
      },
      { deep: true }
    );

    this.$watch(
      () => this.columnsTabulator,
      (newCols) => {
        if (this.tabulator) {
          this.tabulator.setColumns(newCols);
        }
      },
      { deep: true }
    );

    this.tabulator.on("rowClick", (e, row) => {
      this.setSelectedItem(row.getData());
      this.setIsItemSelected(true);
    });
  },
  methods: {
    ...mapActions(useDataStore, ["setSyncPatches", "setSelectedItem"]),
    ...mapActions(useAppStore, ["setIsItemSelected"]),
    clearTheItem2() {
      this.setSelectedItem(null);
      this.setIsItemSelected(false);
    },
    openInNewTab2(row) {
      const link = this.$router.resolve({
        name: "TheItemStandalone",
        params: { itemId: row.IdentifierUUID, trenchSource: row.Trench },
      }).href;

      window.open(link, "_blank");
    },
    exportFile(fileType) {
      if (fileType === "pdf") {
        this.tabulator.download(
          "pdf",
          this.projectPreferencesTypesTranslationPlurals[this.selectedType] +
            " " +
            this.checkedTrenchesNames.join(", ") +
            ".pdf",
          {
            orientation: "portrait",
            title:
              this.project.toUpperCase() +
              " " +
              this.projectPreferencesTypesTranslationPlurals[this.selectedType], //add title to report
            //           jsPDF:{
            //     unit:"in", //set units to inches
            // },
            autoTable: (doc) => {
              //doc - the jsPDF document object

              doc.autoTable({ html: "#title" });
              var pageSize = doc.internal.pageSize;
              var pageWidth = pageSize.width
                ? pageSize.width
                : pageSize.getWidth();
              var text = doc.splitTextToSize(
                this.checkedTrenchesNames.join(", "),
                pageWidth + 350,
                {}
              );
              doc.setFontSize(8).text(text, 40, doc.lastAutoTable.finalY + 5);
              doc.addFileToVFS(
                "Avrile-SansRegular-Normal.ttf",
                avrileSansRegularNormal
              );
              doc.addFont(
                "Avrile-SansRegular-Normal.ttf",
                "avrileSansRegularNormal",
                "normal"
              );
              doc.setFont("avrileSansRegularNormal");
              return {
                styles: {
                  font: "avrileSansRegularNormal",
                  fontStyle: "normal",
                },
              };
            },
          }
        );
      } else {
        this.tabulator.download(fileType, this.selectedType + "." + fileType);
      }
    },
  },
};
</script>

<style scoped>
.TheItemframe {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1022;
}
.TheItemframe:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>
