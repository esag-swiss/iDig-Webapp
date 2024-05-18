<template>
  <div
    v-show="currentItem"
    class="TheItemframe"
    @click="clearTheItem(), setSyncPatches('')"
  ></div>
  <ThePatches v-if="syncPatches"></ThePatches>
  <TheItem v-if="currentItem" :currentItem="currentItem"> </TheItem>
  <div class="q-pa-xs">
    <q-table
      v-model:pagination="pagination"
      row-key="name"
      :rows="rows"
      :columns="columns"
      virtual-scroll
      :rows-per-page-options="[0]"
      dense
      separator="vertical"
      @row-click="onRowClick"
      ><template v-slot:header="props">
        <q-tr :props="props">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            :style="{
              width: col.colWidth + col.colWidthType,
            }"
            class="table_column"
          >
            {{ col.label }}
            <span
              class="table__resize-handler"
              draggable="true"
              @dragstart="dragStart($event, col.name)"
              @dragend="dragEnd($event, col.name)"
              >&nbsp;</span
            >
          </q-th>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { mapActions, mapState } from "pinia";
import { useDataStore } from "@/stores/data";
import TheItem from "@/components/TheItem.vue";
import ThePatches from "@/components/ThePatches.vue";

export default {
  name: "TheQTable",
  components: { TheItem, ThePatches },
  setup() {
    const dataStore = useDataStore();
    const rows = ref(dataStore.checkedTrenchesItemsSelectedTypeAndSearched);
    const currentItem = ref();
    const startX = ref(0);
    const deltaX = ref(0);
    const columns = ref(
      dataStore.checkedFieldNames.map((fieldName) => ({
        name: fieldName,
        required: true,
        label: dataStore.projectPreferencesFieldsWithTranslation[fieldName],
        align: "left",
        field: fieldName,
        sortable: true,
        colWidth: 200,
        colWidthType: "px",
      }))
    );

    watch(
      () => dataStore.checkedTrenchesItemsSelectedTypeAndSearched,
      (newRows) => {
        rows.value = newRows;
      }
    );
    watch(
      () => dataStore.checkedFieldNames,
      (newFieldNames) => {
        columns.value = newFieldNames.map((fieldName) => ({
          name: fieldName,
          required: true,
          label: dataStore.projectPreferencesFieldsWithTranslation[fieldName],
          align: "left",
          field: fieldName,
          sortable: true,
          colWidth: 200,
          colWidthType: "px",
        }));
      }
    );

    const onRowClick = (evt, row) => {
      currentItem.value = row;
    };
    const clearTheItem = () => {
      currentItem.value = null;
    };
    const dragStart = (event) => {
      startX.value = event.clientX;
    };

    const dragEnd = (event, colName) => {
      deltaX.value = event.clientX - startX.value;

      // Recherche de la colonne correspondant au nom
      const columnIndex = columns.value.findIndex(
        (column) => column.name === colName
      );
      if (columnIndex !== -1) {
        // Mise à jour de la taille de la colonne spécifique
        columns.value[columnIndex].colWidth =
          columns.value[columnIndex].colWidth + deltaX.value > 19
            ? columns.value[columnIndex].colWidth + deltaX.value
            : 20;
      }
      startX.value = 0;
      deltaX.value = 0;
    };

    const initialPagination = ref({
      sortBy: "desc",
      descending: false,
      page: 1,
      rowsPerPage: 20,
    });

    const pagination = ref({
      rowsPerPage: 0,
    });

    return {
      selected: ref([]),
      initialPagination,
      columns,
      rows,
      currentItem,
      onRowClick,

      pagination,
      clearTheItem,
      dragStart,
      dragEnd,
    };
  },
  computed: {
    ...mapState(useDataStore, ["syncPatches"]),
  },
  methods: {
    ...mapActions(useDataStore, ["setSyncPatches"]),
  },
};
</script>
<style>
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

.q-table {
  table-layout: fixed;
  height: 93vh;
}

.q-table td,
.q-table th {
  overflow: hidden;
}
.q-table__bottom {
  border: 0;
}

.table_column {
  position: relative;
}

.table__resize-handler {
  position: absolute;
  right: -10px;
  min-width: 15px;
  cursor: col-resize;
}
</style>
