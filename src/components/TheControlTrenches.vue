<template>
  <input
    v-model="search"
    class="m-0 form-control input-sm"
    placeholder="Search..."
    @input="filterItems()"
  />
  <div class="p-1 m-1 bg-light border border-grey rounded">
    <h3>Secteurs</h3>

    <ul v-for="(n, index) in accordionLabels" :key="n" class="list-group">
      <li
        class="list-group-item accordion"
        @click="isHiddenArray[index] = !isHiddenArray[index]"
      >
        {{ n }}
      </li>
      <!-- liste trenches -->
      <div v-if="!isHiddenArray[index]">
        <ul
          v-for="trench in projectTrenchesNames"
          :key="trench"
          class="list-group"
        >
          <li
            v-if="trench.includes(n)"
            class="list-group-item accordion"
            @change="
              updateCheckall(), updateTrenchesDataWithSelectedTrench(trench)
            "
          >
            <input
              v-model="checkedTrenchesNames"
              type="checkbox"
              :value="trench"
            />
            <label class="px-1 m-0" for="checkbox">{{ trench }}</label>
          </li>
        </ul>
      </div>
    </ul>
    <!-- Check All -->
    <input
      v-model="isCheckAll"
      type="checkbox"
      @click="toggleCheckAll(), fetchAllTrenchesData()"
    />
    Check All
  </div>
</template>

<script>
import { fetchSurvey } from "@/services/ApiClient";
import { useDataState } from "@/services/useDataState";

export default {
  emits: ["selected-trench"],
  setup() {
    const {
      projectTrenchesNames,
      setFilteredTrenchesItemsStore,
      selectedType,
    } = useDataState();
    return {
      projectTrenchesNames,
      setFilteredTrenchesItemsStore,
      selectedType,
    };
  },
  data() {
    return {
      search: "",
      checkedTrenchesNames: [], // attention garde en mémoire les trenches cochées lorsque l'on change de projet
      isCheckAll: false,
      checkedTrenchesData: {}, // use store ?
      checkedTrenchesVersions: {}, // use store ?
      isHiddenArray: [
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ],
    };
  },

  computed: {
    accordionLabels() {
      // create groups by 5 first caracters and send reverse order
      return [...new Set(this.projectTrenchesNames?.map((x) => x.substr(0, 5)))]
        .sort()
        .reverse();
    },
    checkedTrenchesItems() {
      let allItem = [];
      Object.values(this.checkedTrenchesData).forEach((data) => {
        allItem.push(...data);
      });
      return allItem;
    },
  },
  watch: {
    // whenever question changes, this function will run
    selectedType(newType) {
      let tempItems = [];
      tempItems = this.checkedTrenchesItems.filter((object) => {
        return object.Type.includes(newType);
      });
      this.setFilteredTrenchesItemsStore(tempItems);
    },
  },

  methods: {
    toggleCheckAll: function () {
      this.isCheckAll = !this.isCheckAll;
      this.checkedTrenchesNames = [];
      if (this.isCheckAll) {
        // Check all
        for (var key in this.projectTrenchesNames) {
          this.checkedTrenchesNames.push(this.projectTrenchesNames[key]);
        }
      }
    },
    updateCheckall: function () {
      if (
        this.checkedTrenchesNames.length == this.projectTrenchesNames.length
      ) {
        this.isCheckAll = true;
      } else {
        this.isCheckAll = false;
      }
    },
    updateTrenchesDataWithSelectedTrench: function (trench) {
      if (
        Object.prototype.hasOwnProperty.call(this.checkedTrenchesData, trench)
      ) {
        delete this.checkedTrenchesData[trench];
        this.$emit("selected-trench", this.checkedTrenchesItems);
      } else {
        fetchSurvey(trench)
          .then((response) => {
            // prepare data to store in session in case of PUSH
            this.checkedTrenchesData[trench] = response.data.surveys;
            this.checkedTrenchesVersions[trench] = response.data.version;

            // store in session in case of PUSH
            sessionStorage.setItem(
              "checkedTrenchesData",
              JSON.stringify(this.checkedTrenchesData)
            );
            sessionStorage.setItem(
              "checkedTrenchesVersions",
              JSON.stringify(this.checkedTrenchesVersions)
            );
            this.$emit("selected-trench", this.checkedTrenchesItems);

            let itemsToEmitStore = [];
            itemsToEmitStore = this.checkedTrenchesItems.filter((object) => {
              return object.Type.includes(this.selectedType);
            });
            this.setFilteredTrenchesItemsStore(itemsToEmitStore);
          })
          .catch(() => {});
      }
    },

    fetchAllTrenchesData: function () {
      // also used to reload after saving from TheItem
      let itemsToEmit = [];
      let itemsToEmitStore = [];

      this.checkedTrenchesNames.forEach((trench) => {
        fetchSurvey(trench)
          .then((response) => {
            // pour emit des surveys
            itemsToEmit.push(...response.data.surveys);

            // prepare data to store in session in case of PUSH
            this.checkedTrenchesData[trench] = response.data.surveys;
            this.checkedTrenchesVersions[trench] = response.data.version;

            // store in session in case of PUSH
            sessionStorage.setItem(
              "checkedTrenchesData",
              JSON.stringify(this.checkedTrenchesData)
            );
            sessionStorage.setItem(
              "checkedTrenchesVersions",
              JSON.stringify(this.checkedTrenchesVersions)
            );
            this.$emit("selected-trench", itemsToEmit);

            itemsToEmitStore = itemsToEmit.filter((object) => {
              return object.Type.includes(this.selectedType);
            });
            this.setFilteredTrenchesItemsStore(itemsToEmitStore);
          })
          .catch(() => {});
      });
    },

    filterItems() {
      let champ = this.search;
      let itemsToEmit = [];
      let itemsToEmitStore = [];

      if (champ.includes(":")) {
        champ = champ.split(":");
        // filter first all objects with requested property
        itemsToEmit = this.checkedTrenchesItems.filter((x) =>
          Object.prototype.hasOwnProperty.call(x, champ[0])
        );
        itemsToEmit = itemsToEmit.filter(function (x) {
          return x[champ[0]].toLowerCase().includes(champ[1].toLowerCase());
        });
        // search in all properties
      } else {
        itemsToEmit = this.checkedTrenchesItems.filter(
          (
            o // array d'objets
          ) =>
            Object.keys(o).some((k) =>
              o[k].toLowerCase().includes(this.search.toLowerCase())
            )
        );
      }

      this.$emit("selected-trench", itemsToEmit);

      itemsToEmitStore = itemsToEmit.filter((object) => {
        return object.Type.includes(this.selectedType);
      });
      this.setFilteredTrenchesItemsStore(itemsToEmitStore);
    },
  },
};
</script>
<style scoped>
.form-control {
  width: 98%;
}
</style>
