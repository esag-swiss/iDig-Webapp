<template>
  <div v-show="currentItem" class="TheItemframe" @click="clearTheItem()"></div>
  <TheItem
    v-if="currentItem"
    :selectedType="selectedType"
    :currentItem="currentItem"
  >
  </TheItem>
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
import { defineComponent, reactive, ref, computed, toRef } from "vue";
import TheTableLite from "@/components/TheTableLite.vue";
import TheItem from "@/components/TheItem.vue";
import axios from "axios";

export default defineComponent({
  name: "TheTable",
  components: { TheTableLite, TheItem },
  props: {
    filteredTrenchesItems: {
      type: Object,
      required: true,
    },
    checkedFields: {
      type: Object,
      required: true,
    },
    selectedType: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const searchTerm = ref(""); // Search text
    // data utiliser toRef pour ne pas perdre la réactivité lorsque le props est destructuré
    const data = toRef(props, "filteredTrenchesItems");
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

    // Work in progress
    // fetch image from server when image button click
    const getImage = () => {
      axios({
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "get",
        url: "http://localhost:9000/idig/Agora/ΒΓ 2013/attachments/ΒΓ (407,291,447,318).png?checksum=2022-05-12T12:30:42Z",
        responseType: "blob",
        auth: {
          username: "idig",
          password: "idig",
        },
        data: {},
      })
        .then((response) => {
          let imageNode = document.getElementById("image");
          let blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });
          let imgUrl = URL.createObjectURL(blob);
          imageNode.src = imgUrl;
        })
        .catch((error) => {
          // eslint-disable-next-line
          alert(
            error +
              "something goes wrong! Maybe image url broken, try another img url."
          );
        });
    };

    return {
      searchTerm,
      table,
      headers,
      rowClicked,
      tableLoadingFinish,
      getImage,
      currentItem,
    };
  },
  data() {
    return {};
  },
  methods: {
    clearTheItem() {
      this.currentItem = false;
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
  z-index: 999999999;
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
  z-index: 9999;
}
.TheItemframe:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>
