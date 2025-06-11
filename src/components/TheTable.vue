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

  <q-bar Class="bg-grey-1 full-width row ">
    <div class="q-align-center">
      <q-btn
        :size="'sm'"
        color="secondary"
        label=".json"
        @click="exportFile('json')"
        ><q-tooltip class="bg-accent"
          >download items as .json file</q-tooltip
        ></q-btn
      >
      <q-btn
        :size="'sm'"
        color="secondary"
        label=".csv"
        @click="exportFile('csv')"
        ><q-tooltip class="bg-accent"
          >download items as .csv file</q-tooltip
        ></q-btn
      >
      <q-btn :size="'sm'" color="secondary" label="print" @click="printTable()"
        ><q-tooltip class="bg-accent">you may print as .PDF</q-tooltip></q-btn
      >
    </div>
    <q-space />
    <div>
      <q-btn
        v-if="tableEditMode && editedCells.length > 0"
        round
        color="secondary"
        icon="cloud_upload"
        :size="'sm'"
        @click="pushSurveyHandler()"
      />
      <q-tooltip class="bg-accent"
        >upload {{ editedCells.length }} modification(s) to iDig
        server</q-tooltip
      >
    </div>
    <div>
      <q-toggle
        v-if="userHasRwRightsOnAtLeastOneTrench"
        v-model="tableEditMode"
        :size="'sm'"
        color="red"
      />
      <q-tooltip class="bg-accent">"enable edit mode" </q-tooltip>
    </div>
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
import { openDB, readDataInIndexedDB } from "@/services/indexedDbManager";
import { pushSurvey } from "@/services/pushSurveyService";
import { DateTime } from "luxon";

export default {
  name: "TheTable",
  components: { TheItem, ThePatches },

  data() {
    return {
      tabulator: null, //variable to hold table
      tableEditMode: false,
      editedCells: [],
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
      "checkedTrenchesVersion",
      "checkedTrenchesNames",
      "checkedTrenchesData",
      "checkedFieldNames",
      "projectPreferencesFieldsWithTranslation",
      "projectPreferencesTypesTranslation",
      "projectTrenchesRights",
      "projectPreferencesTypesTranslationPlurals",
      "projectPreferencesTypesTranslation",
      "checkedTrenchesItemsSelectedTypeAndSearched",
      "projectPreferencesBase64",
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
      function printFormatter(cell, formatterParams, onRendered) {
        if (
          cell.getField() === "DateEarliest" ||
          cell.getField() === "DateLatest"
        ) {
          const value = cell.getValue();
          if (!value) {
            return "";
          }
          const date = new Date(value);
          return date.toLocaleDateString("fr-FR");
        }
        return cell.getValue();
      }
      return this.checkedFieldNames.map((fieldName) => ({
        title: this.projectPreferencesFieldsWithTranslation[fieldName],
        headerFilter: "input",
        field: fieldName,
        headerMenu: headerMenu,
        editor: "input",
        formatter: this.getColumnFormatter(fieldName),
        formatterParams: this.getColumnFormatterParams(fieldName),
        formatterPrint: printFormatter,
      }));
    },
    userHasRwRightsOnAtLeastOneTrench() {
      return this.checkedTrenchesNames.some(
        (trench) => this.projectTrenchesRights[trench] === false
      );
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
      printAsHtml: true,
      printHeader:
        "<h3>" +
        this.project.toUpperCase() +
        " " +
        this.checkedTrenchesNames.join(", ") +
        "</h3>" +
        this.projectPreferencesTypesTranslationPlurals[this.selectedType] +
        "",
      printFooter: new Date().toLocaleDateString("fr-FR"),
      movableColumns: true,
      columns: this.columnsTabulator, //define table columns
      height: "98%",
      rowFormatter: function (row) {
        if (row.getData().RightsStatus === "Archived") {
          row.getElement().style.backgroundColor = "rgba(128, 128, 153, 0.376)";
        }
      },
      editTriggerEvent: "dblclick",
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

    this.tabulator.on("cellEdited", (cell) => {
      this.editedCells = this.tabulator.getEditedCells();
    });

    this.tabulator.on("rowClick", (e, row) => {
      if (!this.tableEditMode) {
        this.setSelectedItem(row.getData());
        this.setIsItemSelected(true);
      }
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
    printTable() {
      this.tabulator.print(false, true);
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

            autoTable: (doc) => {
              doc.autoTable({
                html: "#title",
              });
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
        this.tabulator.download(
          fileType,
          this.projectPreferencesTypesTranslationPlurals[this.selectedType] +
            " " +
            this.checkedTrenchesNames.join(", ") +
            "." +
            fileType
        );
      }
    },

    getColumnFormatter(fieldName) {
      if (fieldName === "Type") {
        return (cell, formatterParams, onRendered) => {
          const value = cell.getValue();
          return this.projectPreferencesTypesTranslation[value] ?? value;
        };
      }
      // Ajoutez ici d'autres cas de formatage pour d'autres champs
      else if (
        fieldName === "DateEarliest" ||
        fieldName === "DateLatest" ||
        fieldName === "Date"
      ) {
        var formatterParams = {
          outputFormat: "DD/MM/YYYY",
          invalidPlaceholder: "(invalid date)",
        };
        return (cell, formatterParams, onRendered) => {
          const value = cell.getValue();
          // Exemple de formatage pour une date
          return new Date(value).toLocaleDateString();
        };
      }
      // Vous pouvez ajouter d'autres conditions ou retourner undefined pour le cas par défaut
      return undefined;
    },
    getColumnFormatterParams(fieldName) {
      if (
        fieldName === "DateEarliest" ||
        fieldName === "DateLatest" ||
        fieldName === "Date"
      ) {
        return {
          outputFormat: "DD/MM/YYYY",
          invalidPlaceholder: "(invalid date)",
        };
      }

      return undefined;
    },

    async compareAllCheckedTrenchesData() {
      const editedTrenches = [];
      const trenchNames = Object.keys(this.checkedTrenchesData);
      const db = await openDB();
      let compte = 0;

      // On utilise Promise.all pour traiter toutes les comparaisons en parallèle.
      await Promise.all(
        trenchNames.map(async (trenchName) => {
          const localData = JSON.stringify(
            this.checkedTrenchesData[trenchName]
          );
          // readDataInIndexedDB renvoie le clonableData (chaine JSON) ou null s'il n'existe pas
          const storedData = await readDataInIndexedDB(db, trenchName);
          // Si aucune donnée n'est stockée ou si les données diffèrent, on considère la trench comme éditée.
          if (!storedData || storedData !== localData) {
            compte += 1;
            console.log(compte);
            editedTrenches.push(trenchName);
          }
        })
      );

      return editedTrenches;
    },

    async pushSurveyHandler() {
      const editedTrenches = await this.compareAllCheckedTrenchesData();

      for (let trench of editedTrenches) {
        await pushSurvey({
          trenchName: trench,
          trenchVersion: this.checkedTrenchesVersion[trench],
          trenchSurvey: this.checkedTrenchesData[trench],
          projectPreferencesBase64: this.projectPreferencesBase64,
        });
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
