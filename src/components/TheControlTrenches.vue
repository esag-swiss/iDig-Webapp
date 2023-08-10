<template>
  <input
    v-model="search"
    class="form-control form-control-sm"
    placeholder="Search..."
    @input="filterItems()"
  />
  <div name="secteurs" class="p-1 m-1 bg-light border-0">
    <h3>Secteurs</h3>

    <ul v-for="(n, index) in accordionLabels" :key="n" class="list-group">
      <li
        class="list-group-item accordion text-bold"
        @click="isDisplayedArray[index] = !isDisplayedArray[index]"
      >
        {{ n }}
      </li>
      <!-- liste trenches -->
      <div v-if="isDisplayedArray[index]">
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
import { apiFetchSurvey } from "@/services/ApiClient";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useDataStore } from "@/stores/data";

export default {
  data() {
    return {
      search: "",
      isCheckAll: false,
      checkedTrenchesVersions: {}, // use store ?
      isDisplayedArray: [],
    };
  },

  computed: {
    ...mapState(useDataStore, ["projectTrenchesNames"]),
    ...mapWritableState(useDataStore, [
      "checkedTrenchesNames",
      "checkedTrenchesData",
    ]), // TODO : no writable state if possible
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
  methods: {
    ...mapActions(useDataStore, ["setCheckedTrenchesItems", "selectedType"]),
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
      } else {
        apiFetchSurvey(trench)
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
            this.setCheckedTrenchesItems(this.checkedTrenchesItems);
          })
          .catch(() => {});
      }
    },

    fetchAllTrenchesData: function () {
      this.checkedTrenchesNames.forEach((trench) => {
        apiFetchSurvey(trench)
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
          })
          .catch(() => {});
      });
    },

    ////////////
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
    },
    ///////
  },
};
</script>
<style scoped></style>
