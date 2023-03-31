<template>
  <input
    v-model="search"
    class="m-0 form-control input-sm"
    placeholder="Search..."
    @input="filteredList()"
  />
  <div class="p-1 m-1 bg-light border border-grey rounded">
    <h3 @click="downloadTrenches()">Secteurs</h3>
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
            @change="addSelectedTrench()"
          >
            <input v-model="checkedTrenches" type="checkbox" :value="trench" />
            <label class="px-1 m-0" for="checkbox">{{ trench }}</label>
          </li>
        </div>
      </div>
    </ul>
  </div>
</template>

<script>
import { json2geojson } from "@/assets/json2geojson";
import { geojson } from "@/assets/json2geojson";
import { fetchSurvey } from "@/services/ApiClient";

export default {
  props: {
    allTrenches: {
      type: Object,
      required: true,
    },
  },
  emits: ["selected-trench"],
  data() {
    return {
      search: "",
      checkedTrenches: [], // attention garde en mémoire les trenches cochées lorsque l'on change de projet
      arr: [], // data de toutes les trenches, pourra être remplacé par trenchData
      arrtoEmit: [],
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
      return this.allTrenches.map((x) => x.substr(0, 5));
    },
    groupedTrenches() {
      // groups and send reverse order
      return [...new Set(this.first5Trenches)].sort().reverse();
    },
    geojson() {
      return geojson;
    },
  },

  methods: {
    downloadTrenches: function () {
      const data = JSON.stringify(this.arr);
      const blob = new Blob([data], { type: "text/plain" });
      const e = document.createEvent("MouseEvents"),
        a = document.createElement("a");
      a.download = "trenches.geojson";
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
      e.initEvent(
        "click",
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      );
      a.dispatchEvent(e);
    },

    addSelectedTrench: function () {
      this.arr = [];
      // this.trenchesData = {},
      //   this.trenchesVersion = {},
      this.checkedTrenches.forEach((trench) => {
        fetchSurvey(trench).then((response) => {
          // pour emit des surveys
          Array.prototype.push.apply(this.arr, response.data.surveys);

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
        });
      });
      this.$emit("selected-trench", this.arr);
      json2geojson(this.arr);
    },
    filteredList() {
      let champ = this.search;
      if (champ.includes(":")) {
        champ = champ.split(":");
        // limite d'abord tout les objets ayant la proprieté demandée
        this.arrtoEmit = this.arr.filter((x) =>
          Object.prototype.hasOwnProperty.call(x, champ[0])
        );
        this.arrtoEmit = this.arrtoEmit.filter(function (x) {
          return x[champ[0]].toLowerCase().includes(champ[1].toLowerCase());
        });
        // search in all proprties
      } else {
        this.arrtoEmit = this.arr.filter(
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
