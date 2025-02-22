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

export default {
  name: "TheTable",
  components: { TheItem, ThePatches },

  data() {
    return {
      tabulator: null, //variable to hold your table
    };
  },

  computed: {
    ...mapState(useDataStore, [
      "lang",
      "syncPatches",
      "setCheckedFieldNames",
      "selectedItem",
      "checkedFieldNames",
      "projectPreferencesFieldsWithTranslation",
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
      }));
    },
  },

  mounted() {
    //instantiate Tabulator when element is mounted
    this.tabulator = new Tabulator(this.$refs.table, {
      data: this.checkedTrenchesItemsSelectedTypeAndSearched, //link data to table
      reactiveData: true, //turn on data reactivity
      layout: "fitColumns", //fit columns to width of table (optional)
      movableColumns: true,
      columns: this.columnsTabulator, //define table columns
      minHeight: "100%",
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
      () => this.rows,
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
