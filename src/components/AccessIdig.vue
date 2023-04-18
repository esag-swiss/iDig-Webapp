<template>
  <input
    v-model="search"
    class="m-0 form-control input-sm"
    placeholder="Search..."
    @input="filterItem()"
  />
  <div class="p-1 m-1 bg-light border border-grey rounded">
    <h3>Secteurs</h3>

    <ul v-for="(n, index) in groupedTrenches" :key="n" class="list-group">
      <li
        class="list-group-item accordion"
        @click="isHiddenArray[index] = !isHiddenArray[index]"
      >
        {{ n }}
      </li>
      <!-- liste tenches -->
      <div v-if="!isHiddenArray[index]">
        <div v-for="trench in allTrenches" :key="trench">
          <li
            v-if="trench.includes(n)"
            class="mt-1"
            @change="
              updateCheckall(), updateTrenchesDataWithSelectedTrench(trench)
            "
          >
            <input v-model="checkedTrenches" type="checkbox" :value="trench" />
            <label class="px-1 m-0" for="checkbox">{{ trench }}</label>
          </li>
        </div>
      </div>
    </ul>
    <!-- Check All -->
    <input
      v-model="isCheckAll"
      type="checkbox"
      @click="checkAll(), addSelectedTrench()"
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
    const { allTrenches } = useDataState();
    return { allTrenches };
  },
  data() {
    return {
      search: "",
      checkedTrenches: [], // attention garde en mémoire les trenches cochées lorsque l'on change de projet
      arr: [], // data de toutes les trenches, pourra être remplacé par trenchData
      arrtoEmit: [],
      isCheckAll: false,
      trenchesData: {},
      trenchesVersion: {},
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
    first5Trenches() {
      // new array of 5 substring
      return this.allTrenches?.map((x) => x.substr(0, 5));
    },
    groupedTrenches() {
      // groups and send reverse order
      return [...new Set(this.first5Trenches)].sort().reverse();
    },
    allItems() {
      let allItem = [];
      Object.values(this.trenchesData).forEach((data) => {
        allItem.push(...data);
      });
      return allItem;
    },
  },

  methods: {
    checkAll: function () {
      this.isCheckAll = !this.isCheckAll;
      this.checkedTrenches = [];
      if (this.isCheckAll) {
        // Check all
        for (var key in this.allTrenches) {
          this.checkedTrenches.push(this.allTrenches[key]);
        }
      }
    },
    updateCheckall: function () {
      if (this.checkedTrenches.length == this.allTrenches.length) {
        this.isCheckAll = true;
      } else {
        this.isCheckAll = false;
      }
    },
    updateTrenchesDataWithSelectedTrench: function (trench) {
      if (Object.prototype.hasOwnProperty.call(this.trenchesData, trench)) {
        delete this.trenchesData[trench];
        this.$emit("selected-trench", this.allItems);
      } else {
        fetchSurvey(trench)
          .then((response) => {
            // pour emit des surveys
            // this.arr.push(...response.data.surveys);

            // prepare data to store in session in case of PUSH
            this.trenchesData[trench] = response.data.surveys;
            this.trenchesVersion[trench] = response.data.version;

            // store in session in case of PUSH
            sessionStorage.setItem(
              "trenchesData",
              JSON.stringify(this.trenchesData)
            );
            sessionStorage.setItem(
              "trenchesVersion",
              JSON.stringify(this.trenchesVersion)
            );
            if (this.allItems.length === 0) {
              this.$emit("selected-trench", response.data.surveys);
            } else {
              this.$emit("selected-trench", this.allItems);
            }
          })
          .catch(() => {});
      }
    },

    addSelectedTrench: function () {
      this.arr = [];
      this.checkedTrenches.forEach((trench) => {
        fetchSurvey(trench)
          .then((response) => {
            // pour emit des surveys
            this.arr.push(...response.data.surveys);

            // prepare data to store in session in case of PUSH
            this.trenchesData[trench] = response.data.surveys;
            this.trenchesVersion[trench] = response.data.version;

            // store in session in case of PUSH
            sessionStorage.setItem(
              "trenchesData",
              JSON.stringify(this.trenchesData)
            );
            sessionStorage.setItem(
              "trenchesVersion",
              JSON.stringify(this.trenchesVersion)
            );
          })
          .catch(() => {});
      });

      this.$emit("selected-trench", this.arr);
    },
    filterItem() {
      let champ = this.search;
      if (champ.includes(":")) {
        champ = champ.split(":");
        // limite d'abord tout les objets ayant la proprieté demandée
        this.arrtoEmit = this.allItems.filter((x) =>
          Object.prototype.hasOwnProperty.call(x, champ[0])
        );
        this.arrtoEmit = this.arrtoEmit.filter(function (x) {
          return x[champ[0]].toLowerCase().includes(champ[1].toLowerCase());
        });
        // search in all proprties
      } else {
        this.arrtoEmit = this.allItems.filter(
          (
            o // array d'objets
          ) =>
            Object.keys(o).some((k) =>
              o[k].toLowerCase().includes(this.search.toLowerCase())
            )
        );
      }

      this.$emit("selected-trench", this.arrtoEmit);
    },
  },
};
</script>
<style>
.form-control {
  /* height: calc(1em + 0.75rem + 2px); */
  width: 98%;
}
</style>
