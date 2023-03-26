<template>
  <div class="overlayframe" @click="removeLOverlay()" v-show="overlay"></div>
  <over-lay
    :all-types="allTypes"
    :selected-type="selectedType"
    :selected-row="selectedRow"
    v-show="overlay"
  >
  </over-lay>
  <!-- old search method -->
  <!-- <input class="m-2" v-model="searchTerm" /> -->

  <!-- Work in progress bouton pour afficher les images des attachments -->
  <!-- <button type="button" @click="getImage">Image</button> -->
  <table-lite
    :has-checkbox="false"
    :is-loading="table.isLoading"
    :is-re-search="table.isReSearch"
    :columns="table.columns"
    :rows="table.rows"
    :is-static-mode="true"
    :rowClasses="table.rowClasses"
    :total="table.totalRecordCount"
    :sortable="table.sortable"
    :messages="table.messages"
    @is-finished="tableLoadingFinish"
    @return-checked-rows="updateCheckedRows"
    @row-clicked="rowClicked"
  ></table-lite>
  <!-- Work in progress image test du bouton pour afficher les images des attachments -->
  <!-- <img id="image" src="http://thacer.archaiodata.com/ThaCER.svg" alt="test" width="280" /> -->
</template>

<script>
import { defineComponent, reactive, ref, computed, toRef } from "vue";
import TableLite from "@/components/TableLite.vue";
import OverLay from "@/components/OverLay.vue";
import axios from "axios";

export default defineComponent({
  name: "Dyna-Table",
  components: { TableLite, OverLay },
  props: {
    selectedData: {
      type: Object,
      required: true,
    },
    checkedFields: {
      type: Object,
      required: true,
    },
    // selectedTrenches: {
    //   type: Object,
    //   required: false,
    // },
    selectedType: {
      type: String,
      required: false,
    },
    allTypes: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      // selectedRow: 'prout',
    };
  },
  methods: {
    removeLOverlay() {
      this.overlay = false;
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

    /**
     * Loading finish event
     */
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

    // Row checked event
    const updateCheckedRows = (rowsKey) => {
      console.log(rowsKey);
    };

    // Row clicked event
    let overlay = ref(false);
    let selectedRow = ref();
    const rowClicked = (rowsKey) => {
      // console.log("Row clicked!", rowsKey);
      // Pour modifier une variable réactive, déclaré avec ref(), vous devez utiliser sa propriété .value
      overlay.value = true;
      selectedRow.value = rowsKey;
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
      updateCheckedRows,
      tableLoadingFinish,
      getImage,
      overlay,

      selectedRow,
    };
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

#hideoverlay {
  /* color: white; */
  z-index: 999999999;
  height: 20px;
  width: 12px;
  position: absolute;
  right: 20px;
  background-color: white;
}
.overlayframe {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
}
.overlayframe:hover {
  background: rgba(0, 0, 0, 0.5);
}
</style>