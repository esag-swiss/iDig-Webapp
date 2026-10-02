<template>
  <div
    v-show="selectedItem || syncPatches"
    class="TheItemframe"
    @click="(clearTheItem(), setSyncPatches(''))"
  ></div>
  <ThePatches v-if="syncPatches" @clear-the-item="clearTheItem()"></ThePatches>
  <TheItem v-if="selectedItem"> </TheItem>

  <q-bar class="bg-grey-1 full-width row">
    <div class="q-align-center">
      <q-btn
        size="sm"
        color="secondary"
        label=".csv"
        @click="exportFile('csv')"
        ><q-tooltip class="bg-accent">{{
          $t("app.table.download_csv")
        }}</q-tooltip></q-btn
      >
      <q-btn
        :size="'sm'"
        color="secondary"
        :label="$t('app.table.print')"
        @click="printTable()"
        ><q-tooltip class="bg-accent">{{
          $t("app.table.print_tip")
        }}</q-tooltip></q-btn
      >
    </div>
    <q-space />
    <div class="text-grey-8 q-px-sm small">
      {{
        $t("app.items", { count: displayedItemsCount }, displayedItemsCount)
      }}
    </div>
    <div>
      <q-btn
        v-if="tableEditMode && editedCells.length > 0"
        round
        color="secondary"
        icon="cloud_upload"
        :size="'sm'"
        @click="pushSurveyHandler()"
      />
      <q-tooltip class="bg-accent">{{
        $t(
          "app.upload_changes",
          { count: editedCells.length },
          editedCells.length,
        )
      }}</q-tooltip>
    </div>
    <BaseToggleWithTooltip
      v-model="showThumbnails"
      icon="image"
      :label="$t('app.thumbnails')"
      :tooltip="$t('app.show_thumbnails')"
    />
    <BaseToggleWithTooltip
      v-if="userHasRwRightsOnAtLeastOneTrench"
      v-model="tableEditMode"
      color="red"
      :label="$t('app.edit_mode')"
      :tooltip="
        tableEditMode ? $t('app.disable_edit_mode') : $t('app.enable_edit_mode')
      "
    />
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
import { fieldsSchema } from "@/assets/nativeFields";

import { avrileSansRegularNormal } from "@/assets/AvrileSans-Regular-normal.js";
import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
applyPlugin(jsPDF);
import { openDB, readDataInIndexedDB } from "@/services/indexedDbManager";
import { pushSurvey } from "@/services/pushSurveyService";
import { useTableThumbnails } from "@/composables/useTableThumbnails";
import BaseToggleWithTooltip from "@/components/base/BaseToggleWithTooltip.vue";

export default {
  name: "TheTable",
  components: { TheItem, ThePatches, BaseToggleWithTooltip },

  data() {
    return {
      fieldsSchema: fieldsSchema,
      tabulator: null, //variable to hold table
      tableEditMode: false,
      editedCells: [],
      lastSelectedType: null,
      showThumbnails: false,
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
      "tableFilteredCheckedTrenchesItems",
      "projectPreferencesBase64",
    ]),

    displayedItemsCount() {
      return this.tableFilteredCheckedTrenchesItems
        ? this.tableFilteredCheckedTrenchesItems.length
        : this.checkedTrenchesItemsSelectedTypeAndSearched.length;
    },

    columnsTabulator() {
      var headerMenu = [
        {
          label: () => this.$t("app.table.hide_column"),
          action: (e, column) => {
            this.setCheckedFieldNames(
              this.checkedFieldNames.filter(
                (fieldName) => fieldName !== column.getField(),
              ),
            );
          },
        },
        {
          label: () => this.$t("app.table.group_by"),
          action: (e, column) => {
            this.tabulator.setGroupBy(column.getField());
            let groups = this.tabulator.getGroups();
            groups.forEach((group) => {
              console.log(
                `Group ${group.getKey()} has ${group.getRows().length} rows`,
              );
            });
          },
        },
        {
          label: () => this.$t("app.table.find_duplicates"),
          action: (e, column) => {
            this.tabulator.setGroupBy(column.getField());
            let groups = this.tabulator.getGroups();
            const duplicateKeys = groups
              .filter((group) => group.getRows().length > 1)
              .map((group) => group.getKey());
            this.tabulator.setFilter((data) =>
              duplicateKeys.includes(data[column.getField()]),
            );
          },
        },
        {
          label: () => this.$t("app.table.ungroup_or_clear"),
          action: () => {
            this.tabulator.setGroupBy(false);
            this.tabulator.clearFilter();
          },
        },
      ];
      function printFormatter(cell) {
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
      const columns = this.checkedFieldNames.map((fieldName) => ({
        title:
          this.projectPreferencesFieldsWithTranslation?.[fieldName] ||
          this.fieldsSchema?.[fieldName]?.labels?.[this.lang] ||
          fieldName,
        headerFilter: "input",
        field: fieldName,
        headerMenu: headerMenu,
        editor: "input",
        formatter: this.getColumnFormatter(fieldName),
        formatterParams: this.getColumnFormatterParams(fieldName),
        formatterPrint: printFormatter,
      }));
      if (this.showThumbnails) {
        columns.unshift({
          title: "",
          field: "_thumbnail",
          width: 64,
          hozAlign: "center",
          headerSort: false,
          resizable: false,
          download: false,
          print: false,
          formatter: (cell, params, onRendered) =>
            this.tableThumbnails.thumbnailFormatter(cell, onRendered),
        });
      }
      return columns;
    },
    userHasRwRightsOnAtLeastOneTrench() {
      return this.checkedTrenchesNames.some(
        (trench) => this.projectTrenchesRights[trench] === false,
      );
    },
  },

  watch: {
    showThumbnails(isShown) {
      if (!isShown) {
        this.tableThumbnails.disconnect();
      }
    },
  },

  created() {
    this.tableThumbnails = useTableThumbnails(() => this.checkedTrenchesData);
  },

  mounted() {
    //instantiate Tabulator when element is mounted
    this.tabulator = new Tabulator(this.$refs.table, {
      dependencies: {
        jspdf: jsPDF,
      },
      // Treat field names as literal keys (do not parse dots as nested paths).
      nestedFieldSeparator: false,
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
      height: "97%",
      rowFormatter: function (row) {
        if (row.getData().RightsStatus === "Archived") {
          row.getElement().style.backgroundColor = "rgba(128, 128, 153, 0.376)";
        }
      },
      pagination: true,
      paginationCounter: "rows",
      locale: "idig",
      langs: {
        idig: {
          pagination: {
            first: this.$t("app.pagination.first"),
            first_title: this.$t("app.pagination.first_title"),
            last: this.$t("app.pagination.last"),
            last_title: this.$t("app.pagination.last_title"),
            prev: this.$t("app.pagination.prev"),
            prev_title: this.$t("app.pagination.prev_title"),
            next: this.$t("app.pagination.next"),
            next_title: this.$t("app.pagination.next_title"),
            counter: {
              showing: this.$t("app.pagination.showing"),
              of: this.$t("app.pagination.of"),
              rows: this.$t("app.pagination.rows"),
              pages: this.$t("app.pagination.pages"),
            },
          },
        },
      },
      editTriggerEvent: "dblclick",
      rowContextMenu: [
        {
          label: () => this.$t("app.table.copy_to_clipboard"),

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
          label: () => this.$t("app.table.open_in_new_tab"),
          action: (e, row) => {
            this.openInNewTab(row.getData());
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
      { deep: true },
    );

    this.lastSelectedType = this.selectedType;
    this.$watch(
      () => this.columnsTabulator,
      (newCols) => {
        if (!this.tabulator) {
          return;
        }
        const newFields = new Set(newCols.map((column) => column.field));
        const currentValues = this.currentHeaderFilterValues();
        const typeChanged = this.lastSelectedType !== this.selectedType;

        Object.keys(currentValues).forEach((field) => {
          this.tabulator.setHeaderFilterValue(field, "");
        });

        this.tabulator.setColumns(newCols);

        if (!typeChanged) {
          Object.entries(currentValues).forEach(([field, value]) => {
            if (newFields.has(field) && value !== undefined && value !== null) {
              this.tabulator.setHeaderFilterValue(field, value);
            }
          });
        }

        this.lastSelectedType = this.selectedType;
      },
    );

    this.tabulator.on("cellEdited", () => {
      this.editedCells = this.tabulator.getEditedCells();
    });

    this.tabulator.on("rowClick", (e, row) => {
      if (!this.tableEditMode) {
        this.setSelectedItem(row.getData());
        this.setIsItemSelected(true);
      }
    });

    // When Tabulator filters change, push the currently displayed rows
    // to the store so other components (map, exports...) can react.
    this.tabulator.on("dataFiltered", (filters, rows) => {
      // Use the `rows` argument from Tabulator's event — it's the
      // list of RowComponent objects that match the active filters.
      // Mapping `rows` -> row.getData() is more reliable than
      // `getData(true)` which can return unexpected results
      // depending on Tabulator version/timing.
      let activeData = null;
      if (rows && rows.length) {
        try {
          activeData = rows.map((r) => r.getData());
        } catch {
          activeData = null;
        }
      }

      if (!filters || filters.length === 0) {
        this.setTableFilteredCheckedTrenchesItems(null);
      } else {
        this.setTableFilteredCheckedTrenchesItems(activeData);
      }
    });
  },
  beforeUnmount() {
    this.tableThumbnails.disconnect();
  },

  methods: {
    ...mapActions(useDataStore, [
      "setSyncPatches",
      "setSelectedItem",
      "setTableFilteredCheckedTrenchesItems",
    ]),
    ...mapActions(useAppStore, ["setIsItemSelected"]),
    clearTheItem() {
      this.setSelectedItem(null);

      this.setIsItemSelected(false);
    },

    openInNewTab(row) {
      const link = this.$router.resolve({
        name: "TheItemStandalone",
        params: { itemId: row.IdentifierUUID, trenchSource: row.Trench },
      }).href;

      window.open(link, "_blank");
    },
    currentHeaderFilterValues() {
      const headerFilters = this.tabulator.getHeaderFilters?.() ?? [];
      return headerFilters.reduce((acc, filter) => {
        if (filter?.field) {
          acc[filter.field] = filter.value;
        }
        return acc;
      }, {});
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
                {},
              );
              doc.setFontSize(8).text(text, 40, doc.lastAutoTable.finalY + 5);
              doc.addFileToVFS(
                "Avrile-SansRegular-Normal.ttf",
                avrileSansRegularNormal,
              );
              doc.addFont(
                "Avrile-SansRegular-Normal.ttf",
                "avrileSansRegularNormal",
                "normal",
              );
              doc.setFont("avrileSansRegularNormal");
              return {
                styles: {
                  font: "avrileSansRegularNormal",
                  fontStyle: "normal",
                },
              };
            },
          },
        );
      } else {
        this.tabulator.download(
          fileType,
          this.projectPreferencesTypesTranslationPlurals[this.selectedType] +
            " " +
            this.checkedTrenchesNames.join(", ") +
            "." +
            fileType,
        );
      }
    },

    getColumnFormatter(fieldName) {
      if (this.fieldsSchema?.[fieldName]?.type === "link") {
        return (cell) => this.linkChipsFormatter(cell);
      } else if (fieldName === "Type" || fieldName === "Subtype") {
        return (cell) => {
          const value = cell.getValue();
          return this.projectPreferencesTypesTranslation[value] ?? value;
        };
      } else if (
        fieldName === "RightsSidelined" ||
        fieldName === "RightsLocked"
      ) {
        return "tickCross";
      }
      // Ajoutez ici d'autres cas de formatage pour d'autres champs
      else if (
        fieldName === "DateEarliest" ||
        fieldName === "DateLatest" ||
        fieldName === "Date"
      ) {
        return (cell) => {
          const value = cell.getValue();
          // Exemple de formatage pour une date
          return new Date(value).toLocaleDateString();
        };
      }
      // Vous pouvez ajouter d'autres conditions ou retourner undefined pour le cas par défaut
      return undefined;
    },
    linkChipsFormatter(cell) {
      const currentItem = cell.getRow().getData();
      const container = document.createElement("div");
      container.className = "table-link-chips";

      this.itemsInChips(cell.getValue(), currentItem).forEach((item) => {
        const chip = document.createElement("span");
        chip.className =
          "q-chip row inline no-wrap items-center q-chip--colored bg-primary text-white q-chip--clickable cursor-pointer table-link-chip";
        chip.textContent = item.chipText;
        chip.title = item.chipText;

        chip.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (item.fullItem) {
            this.setSelectedItem(item.fullItem);
            this.setIsItemSelected(true);
          }
        });

        container.appendChild(chip);
      });

      return container;
    },
    itemsInChips(IdentifierUUIDs, currentItem) {
      if (!IdentifierUUIDs) {
        return [];
      }

      return String(IdentifierUUIDs)
        .split("\n")
        .filter(Boolean)
        .map((IdentifierUUID) => this.chipText(IdentifierUUID, currentItem));
    },
    chipText(IdentifierUUID, currentItem) {
      const filteredItems =
        this.checkedTrenchesData[currentItem.Trench]?.filter((x) =>
          x.IdentifierUUID.includes(IdentifierUUID),
        ) ?? [];

      if (filteredItems.length > 0) {
        const item = filteredItems[0];
        return {
          chipText:
            (this.projectPreferencesTypesTranslation[item.Subtype] ??
              this.projectPreferencesTypesTranslation[item.Type]) +
            " " +
            item.Identifier +
            " : " +
            item.Title,
          fullItem: item,
        };
      }

      return {
        chipText: this.$t("app.table.unknown_item"),
        fullItem: null,
      };
    },
    getColumnFormatterParams(fieldName) {
      if (
        fieldName === "DateEarliest" ||
        fieldName === "DateLatest" ||
        fieldName === "Date"
      ) {
        return {
          outputFormat: "DD/MM/YYYY",
          invalidPlaceholder: this.$t("app.table.invalid_date"),
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
            this.checkedTrenchesData[trenchName],
          );
          // readDataInIndexedDB renvoie le clonableData (chaine JSON) ou null s'il n'existe pas
          const storedData = await readDataInIndexedDB(db, trenchName);
          // Si aucune donnée n'est stockée ou si les données diffèrent, on considère la trench comme éditée.
          if (!storedData || storedData !== localData) {
            compte += 1;
            console.log(compte);
            editedTrenches.push(trenchName);
          }
        }),
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

:deep(.table-thumbnail) {
  width: 48px;
  height: 48px;
  margin: auto;
  background: #eee;
}

:deep(.table-thumbnail img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

:deep(.table-link-chips) {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

:deep(.table-link-chip) {
  max-width: 240px;
  min-height: 24px;
  margin: 1px;
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
