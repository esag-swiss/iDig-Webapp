<template>
  <input
    v-model="search"
    class="m-0 form-control input-sm"
    placeholder="Search..."
    @input="filterItems()"
  />
  <div class="p-1 m-1 bg-light border border-grey rounded">
    <h3>Secteurs</h3>

    <ul v-for="(n, index) in groupsForTrenches" :key="n" class="list-group">
      <li
        class="list-group-item accordion"
        @click="isHiddenArray[index] = !isHiddenArray[index]"
      >
        {{ n }}
      </li>
      <!-- liste trenches -->
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
    const { allTrenches } = useDataState();
    return { allTrenches };
  },
  data() {
    return {
      search: "",
      checkedTrenches: [], // attention garde en mémoire les trenches cochées lorsque l'on change de projet
      // arr: [], // data de toutes les trenches, pourra être remplacé par trenchData
      // arrtoEmit: [],
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
    groupsForTrenches() {
      // create groups by 5 first caracters and send reverse order
      return [...new Set(this.allTrenches?.map((x) => x.substr(0, 5)))]
        .sort()
        .reverse();
    },
    ItemsAll() {
      let allItem = [];
      Object.values(this.trenchesData).forEach((data) => {
        allItem.push(...data);
      });
      return allItem;
    },
  },

  methods: {
    toggleCheckAll: function () {
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
        this.$emit("selected-trench", this.ItemsAll);
      } else {
        fetchSurvey(trench)
          .then((response) => {
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
            this.$emit("selected-trench", this.ItemsAll);
            // if (this.ItemsAll.length === 0) {
            //   this.$emit("selected-trench", response.data.surveys);
            // } else {
            //   this.$emit("selected-trench", this.ItemsAll);
            // }
          })
          .catch(() => {});
      }
    },

    fetchAllTrenchesData: function () {
      let itemsToEmit = [];
      this.checkedTrenches.forEach((trench) => {
        fetchSurvey(trench)
          .then((response) => {
            // pour emit des surveys
            itemsToEmit.push(...response.data.surveys);

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
            this.$emit("selected-trench", itemsToEmit);
          })
          .catch(() => {});
      });
    },

    filterItems() {
      let champ = this.search;
      let itemsToEmit = [];
      if (champ.includes(":")) {
        champ = champ.split(":");
        // limite d'abord tout les objets ayant la proprieté demandée
        itemsToEmit = this.ItemsAll.filter((x) =>
          Object.prototype.hasOwnProperty.call(x, champ[0])
        );
        itemsToEmit = itemsToEmit.filter(function (x) {
          return x[champ[0]].toLowerCase().includes(champ[1].toLowerCase());
        });
        // search in all properties
      } else {
        itemsToEmit = this.ItemsAll.filter(
          (
            o // array d'objets
          ) =>
            Object.keys(o).some((k) =>
              o[k].toLowerCase().includes(this.search.toLowerCase())
            )
        );
      }

      this.$emit("selected-trench", itemsToEmit);
    },
  },
};
</script>
<style scoped>
.form-control {
  width: 98%;
}
</style>
