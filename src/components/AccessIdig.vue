<template>
  <div class="p-1 m-1 bg-light border border-grey rounded">
    <h3>Projet</h3>
    <select
      class="form-control"
      v-model="project"
      @change="changeSelectedProject"
    >
      <option v-for="project in projects" :key="project" :value="project">
        {{ project }}
      </option>
    </select>
    <div
      v-for="trench in trenches"
      :key="trench"
      @change="addSelectedTrench()"
      class="mt-1"
    >
      <input type="checkbox" v-model="checkedTrenches" :value="trench" />
      <label class="p-1 m-0" for="checkbox">{{ trench }}</label>
    </div>
  </div>
  <!-- work in progress -->
  <!-- <div class="p-1 m-1 bg-light border border-grey rounded">
    <h3 class="doigt" title="display only fields for the selected type">
      Trenches
    </h3>

    <ul
      v-for="(group, index) in groupedtrenches"
      :key="group"
      class="list-group"
    >
      <li
        class="list-group-item accordion"
        @click="isHiddenArray[index] = !isHiddenArray[index]"
      >
        {{ group }}
      </li>

      <div
        v-for="trench in trenches"
        :key="trench"
        @change="addSelectedTrench()"
        class="mt-1"
      >
        <input type="checkbox" v-model="checkedTrenches" :value="trench" />
        <label class="p-1 m-0" for="checkbox">{{ trench }}</label>
      </div>
    </ul>
  </div> -->
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      project: "",
      projects: ["Amarynthos", "Agora"], // could it be populated by XXXX.preferences.json files present in Data folder?
      selectedProject: {
        Agora: [2013, "ΒΘ West 2013"],
        Amarynthos: [
          "AMA21-S24",
          "AMA22-S22C",
          "AMA22-S24C",
          "AMA22-S24E",
          "AMA22-S24N",
          "AMA22-S28",
          "AMA22-S2801",
          "AMA22-S2802",
          "AMA22-S2803",
          "AMA22-S2804",
          "AMA22-S34",
          "AMA22-S35",
          "AMA22-S37",
          "AMA22-S39",
        ],
      }, // should it be listed in the preferences file?
      // trenches: [2013, "ΒΘ West 2013"],
      checkedTrenches: [],
      arr: [],
      // Agora: [2013, "ΒΘ West 2013"],
      // Amarynthos: ["AMA21-Plans"],
    };
  },
  computed: {
    trenches() {
      return this.selectedProject[this.project];
    },
    groupedtrenches() {
      return [
        ...new Set(
          this.selectedProject.Amarynthos.map(x => x.substring(0, 5))
        ),
      ];
    },
    trenchesbygroup() {
      return this.groupedtrenches.filter(x => x.startsWith('AMA21'));
    },
  },
  methods: {
    changeSelectedProject() {
      // this.trenches = this.selectedProject[this.projects];
    },

    addSelectedTrench: function () {
      this.arr = [];
      this.checkedTrenches.forEach((value) => {
        var session_url =
          "http://localhost:9000/idig/Agora/" + value + "/surveys";
        axios({
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          method: "get",
          url: session_url,
          auth: {
            username: "idig",
            password: "idig",
          },
          data: {
            datastuff: "survey",
          },
        }).then((response) =>
          Array.prototype.push.apply(this.arr, response.data.surveys)
        );
        this.$emit("selected-trench", this.arr);
      });
    },
  },
};
</script>