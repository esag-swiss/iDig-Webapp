<template>

  <input class="m-2" v-model="searchTerm" />
  <table-lite
    :has-checkbox="true"
    :is-loading="table.isLoading"
    :is-re-search="table.isReSearch"
    :columns="table.columns"
    :rows="table.rows"
    :rowClasses="table.rowClasses"
    :total="table.totalRecordCount"
    :sortable="table.sortable"
    :messages="table.messages"

    @return-checked-rows="updateCheckedRows"
    @row-clicked="rowClicked"
    
  ></table-lite>
</template>

<script>
import { defineComponent, reactive, ref, computed, toRef } from "vue";
import TableLite from "../components/TableLite.vue";

export default defineComponent({
  name: "Dyna-Table",
  components: { TableLite },
  props: {
    selectedData: {
      type: Array,
      required: true,
    },
    checkedFields: {
      type: Array,
      required: true,
    },
  },
  setup(props) {
    const searchTerm = ref(""); // Search text
    // data utiliser toRef pour ne pas perdre la réactivité lorsque le props est destructuré
    const data = toRef(props, "selectedData");
    // utiliser toRef pour ne pas perdre la réactivité lorsque le props est destructuré
    const headers = toRef(props, "checkedFields");

    // Table config
    const table = reactive({
      columns: headers,
      rows: computed(() => {
        return data.value.filter(
          (x) =>
            x.Type.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            x.Identifier.toLowerCase().includes(searchTerm.value.toLowerCase())
        );
      }),
      totalRecordCount: computed(() => {
        return table.rows.length;
      }),
      sortable: {
        order: "Identifier",
        sort: "asc",
      },
    });
    
    // Row checked event
    const updateCheckedRows = (rowsKey) => {
      console.log(rowsKey);
    };
    // Row clicked event
    const rowClicked = (rowsKey) => {
      console.log("Row clicked!", rowsKey);
    };
    return {
      searchTerm,
      table,
      headers,
      rowClicked,
      updateCheckedRows,
      
    };
  },
});
</script>