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
      class="q-table"
      separator="vertical"
      @row-click="onRowClick"
      @row-contextmenu="openInNewTab"
      ><template v-slot:header="props">
        <q-tr :props="props">
          <q-th
            v-for="col in props.cols"
            :key="col.name"
            :props="props"
            :style="{
              width: col.colWidth + col.colWidthType,
            }"
            class="th-container dropzone"
            @dragover="onDragOver"
          >
            <span
              class="arrow-left"
              @click.stop="moveColumn(col.name, 'left')"
            ></span>
            <span>{{ col.label }}</span>
            <span
              class="arrow-right"
              @click.stop="moveColumn(col.name, 'right')"
            ></span>
            <span class="cross-th" @click.stop="removeColumn(col.name)"></span>
            <span
              class="column__resize-handler"
              draggable="true"
              @dragstart="dragStart($event, col.name)"
              @dragend="dragEnd($event, col.name)"
              >&nbsp;</span
            >
          </q-th>
        </q-tr>
      </template>
      <template v-slot:pagination="props">
        <div class="pagination">Total : {{ rows.length }}</div>
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
import { useAppStore } from "@/stores/app";

export default {
  name: "TheQTable",
  components: { TheItem, ThePatches },
  setup() {
    const dataStore = useDataStore();
    const appStore = useAppStore();
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
    const removeColumn = (colName) => {
      dataStore.setCheckedFieldNames(
        dataStore.checkedFieldNames.filter((fieldName) => fieldName !== colName)
      );
    };
    const moveColumn = (colName, leftOrRight) => {
      // Obtenir l'index actuel de la colonne
      const currentIndex = dataStore.checkedFieldNames.indexOf(colName);

      if (currentIndex === -1) {
        console.error(`Colonne ${colName} introuvable`);
        return;
      }

      // Calculer le nouvel index
      const newIndex =
        leftOrRight === "left"
          ? Math.max(0, currentIndex - 1) // Déplacement à gauche
          : Math.min(dataStore.checkedFieldNames.length - 1, currentIndex + 1); // Déplacement à droite

      // Réorganiser les colonnes
      const NewData = [...dataStore.checkedFieldNames];
      const [movedColumn] = NewData.splice(currentIndex, 1); // Retirer la colonne
      NewData.splice(newIndex, 0, movedColumn); // Insérer à la nouvelle position

      // Mettre à jour les colonnes dans le store
      dataStore.setCheckedFieldNames(NewData);
    };

    const onRowClick = (evt, row) => {
      currentItem.value = row;
      appStore.setIsItemSelected(true);
    };
    const clearTheItem = () => {
      currentItem.value = null;
      appStore.setIsItemSelected(false);
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

    const onDragOver = (event) => {
      event.preventDefault();
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
      removeColumn,
      moveColumn,
      pagination,
      clearTheItem,
      dragStart,
      dragEnd,
      onDragOver,
    };
  },
  computed: {
    ...mapState(useDataStore, ["syncPatches", "setCheckedFieldNames"]),
  },
  methods: {
    ...mapActions(useDataStore, ["setSyncPatches"]),
    openInNewTab(eve, row) {
      const url = this.$router.resolve({
        name: "TheItemStandalone",
        params: { itemId: row.IdentifierUUID, trenchSource: row.Trench },
      }).href;
      window.open(url, "_blank"); // Ouvre un nouvel onglet avec l'URL générée
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

.q-table {
  table-layout: fixed;
  max-height: 93vh;
}

.q-table__bottom {
  padding: 4px 24px 4px 16px;
}
.pagination {
  margin-right: 30px;
}

.q-table td,
.q-table th {
  overflow: hidden;
}

.column__resize-handler {
  position: absolute;
  right: -10px;
  min-width: 15px;
  cursor: col-resize;
}

.q-table th {
  position: relative;
  transition: background-color 0.3s ease;
}

.q-table th:hover {
  background-color: #f0f0f0;
}

.cross-th,
.arrow-left,
.arrow-right {
  cursor: pointer;

  margin: 0 8px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.cross-th {
  right: 0px;
  position: absolute;
}

.arrow-left,
.arrow-right {
  padding: 5px;
}

.cross-th:hover,
.arrow-right:hover,
.arrow-left:hover {
  background-color: rgba(
    0,
    0,
    0,
    0.1
  ); /* Couleur de fond plus foncée (semi-transparente) */
}

.cross-th::before {
  content: "\2716"; /* Code Unicode pour une croix (✖) */
}

.arrow-right::before {
  content: "\25B6";
}

.arrow-left::before {
  content: "\25C0";
}

.q-table th:hover .cross-th,
.q-table th:hover .arrow-left,
.q-table th:hover .arrow-right {
  opacity: 1; /* Rendre les ellipses visibles au survol du <q-th>*/
  visibility: visible; /* Permettre l'interaction */
}
</style>
