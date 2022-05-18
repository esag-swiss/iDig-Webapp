<template>
  <div style="text-align: left">
    <label>SearchBy:</label><input v-model="searchTerm" />
  </div>
  <table-lite
    :is-static-mode="true"
    :columns="table.columns"
    :rows="table.rows"
    :total="table.totalRecordCount"
    :sortable="table.sortable"
  ></table-lite>
</template>

<script>
import { defineComponent, reactive, ref, computed, toRef} from "vue";
import TableLite from "../components/TableLite.vue";
// import preferencesData from "../components/AMA21-S24.Preferences.json";
// import trenchData from "../components/AMA21-S24.json";

export default defineComponent({
  name: "App",
  components: { TableLite },
  props: {
    selectedFields: {
      type: String,
      required: true
    },
    selectedData: {
      type: String,
      required: true
    },
  },

  setup(props) {
  const searchTerm = ref(""); // Search text

    // data
    const data = toRef(props, 'selectedData');

    // utiliser toRef pour ne pas perdre la réactivité lorsque le props est destructuré
    const headers = toRef(props, 'selectedFields');


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
        order: "id",
        sort: "asc",
      },
    });
    return {
      searchTerm,
      table 
    };
  },
});
</script>