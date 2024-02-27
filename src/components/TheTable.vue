<template>
  <div v-show="currentItem" class="TheItemframe" @click="clearTheItem()"></div>
  <TheItem v-if="currentItem" :currentItem="currentItem"> </TheItem>
  <div class="q-pa-xs">
    <q-table
      style="height: 93vh"
      flat
      bordered
      :rows="rows"
      :columns="columns"
      dense
      separator="vertical"
      row-key="name"
      @row-click="onRowClick"
      virtual-scroll
      v-model:pagination="pagination"
      :rows-per-page-options="[0]"
    />
  </div>
</template>

<script>
import { ref, watch } from "vue";
import TheItem from "@/components/TheItem.vue";
import { useDataStore } from "@/stores/data";

export default {
  name: "TheQTable",
  components: { TheItem },
  setup() {
    const dataStore = useDataStore();
    const rows = ref(dataStore.checkedTrenchesItemsSelectedTypeAndSearched);
    const columns = ref(
      dataStore.checkedFieldNames.map((fieldName) => ({
        name: fieldName,
        required: true,
        label: dataStore.projectPreferencesFieldsWithTranslation[fieldName],
        align: "left",
        field: fieldName,
        sortable: true,
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
        }));
      }
    );
    let currentItem = ref();
    const onRowClick = (evt, row) => {
      currentItem.value = row;
    };

    return {
      selected: ref([]),
      initialPagination: {
        sortBy: "desc",
        descending: false,
        page: 1,
        rowsPerPage: 20,
      },
      columns,
      rows,
      currentItem,
      onRowClick,

      pagination: ref({
        rowsPerPage: 50,
      }),
    };
  },
  methods: {
    clearTheItem() {
      this.currentItem = false;
    },
  },
};
</script>
<style>
#hideTheItem {
  /* color: white; */
  z-index: 1023;
  height: 20px;
  width: 12px;
  position: absolute;
  right: 20px;
  background-color: white;
}
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

.q-table__bottom {
  border: 0;
}
</style>
