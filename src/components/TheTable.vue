<template>
  <div v-show="currentItem" class="TheItemframe" @click="clearTheItem()"></div>
  <TheItem v-if="currentItem" :currentItem="currentItem"> </TheItem>
  <TheTableLite
    :hasCheckbox="false"
    :isLoading="table.isLoading"
    :isReSearch="table.isReSearch"
    :columns="table.columns"
    :rows="table.rows"
    :isStaticMode="true"
    :rowClasses="table.rowClasses"
    :total="table.totalRecordCount"
    :sortable="table.sortable"
    :messages="table.messages"
    @is-finished="tableLoadingFinish"
    @row-clicked="rowClicked"
  ></TheTableLite>
</template>

<script>
import {
  defineComponent,
  reactive,
  ref,
  computed,
  watch,
  onMounted,
} from "vue";
import TheTableLite from "@/components/TheTableLite.vue";
import TheItem from "@/components/TheItem.vue";
import { useDataStore } from "@/stores/data";
import { useAppStore } from "@/stores/app";

export default defineComponent({
  name: "TheTable",
  components: { TheTableLite, TheItem },
  setup() {
    // make table columns and rows reactive inside the table object, with 2 watches :
    const dataStore = useDataStore();
    const appStore = useAppStore();

    const updateTableColumns = () => {
      table.columns = dataStore.checkedFieldNames.map((fieldName) => ({
        field: fieldName,
        label: dataStore.projectPreferencesFieldsWithTranslation[fieldName],
        sortable: true,
        checked: true,
      }));
    };
    watch(
      [
        () => dataStore.checkedFieldNames,
        () => dataStore.checkedTrenchesNames,
        () => dataStore.selectedType,
        () => appStore.lang,
      ],
      updateTableColumns
    );
    onMounted(updateTableColumns);

    const checkedTrenchesItemsSelectedTypeAndSearched = ref(
      dataStore.checkedTrenchesItemsSelectedTypeAndSearched
    );
    watch(
      () => dataStore.checkedTrenchesItemsSelectedTypeAndSearched,
      (newItems) => {
        table.rows = newItems;
      }
    );

    // Table config
    const table = reactive({
      columns: [],
      rows: checkedTrenchesItemsSelectedTypeAndSearched,
      messages: {
        pagingInfo: "{0}-{1} / {2}",
        pageSizeChangeLabel: "item/page",
        gotoPageLabel: " page ",
        noDataAvailable: "no data",
      },
      totalRecordCount: computed(() => {
        return table.rows.length;
      }),
      sortable: {
        order: "Identifier",
        sort: "asc",
      },
    });

    // Loading finish event
    const tableLoadingFinish = (elements) => {
      table.isLoading = false;
      Array.prototype.forEach.call(elements, function (element) {
        if (element.classList.contains("name-btn")) {
          element.addEventListener("click", function (event) {
            event.stopPropagation(); // prevents further propagation of the current event in the capturing and bubbling phases.
            console.log(this.dataset.id + " name-btn click!!");
          });
        }
        if (element.classList.contains("quick-btn")) {
          element.addEventListener("click", function (event) {
            event.stopPropagation(); // prevents further propagation of the current event in the capturing and bubbling phases.
            console.log(this.dataset.id + " quick-btn click!!");
          });
        }
      });
    };

    // Row clicked event
    let currentItem = ref();
    const rowClicked = (rowsKey) => {
      // Pour modifier une variable réactive, déclaré avec ref(), vous devez utiliser sa propriété .value
      currentItem.value = rowsKey;
    };

    return {
      table,
      rowClicked,
      tableLoadingFinish,
      currentItem,
    };
  },
  data() {
    return {};
  },
  methods: {
    clearTheItem() {
      this.currentItem = false;
      // this.$parent.reload();
    },
  },
});
</script>

<style scoped>
::v-deep(.vtl-table) {
  margin: 0;
}

::v-deep(.vtl-table tr span) {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}

::v-deep(.vtl-table td) {
  vertical-align: top;
  padding: 0.25rem;

  max-height: 50px;
}

::v-deep(.vtl-paging-pagination-page-link) {
  border: none;
}

::v-deep(.page-link) {
  padding: 0.25rem;
}

::v-deep(.vtl-pagination) {
  margin: 0;
}

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
</style>
