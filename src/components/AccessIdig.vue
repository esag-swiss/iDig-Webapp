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
      v-for="trench in groups"
      :key="trench"
      @change="addSelectedTrench()"
      class="mt-1"
    >
      <input type="checkbox" v-model="checkedTrenches" :value="trench" />
      <label class="p-1 m-0" for="checkbox">{{ trench }}</label>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      project: "Amarynthos",
      projects: ["Amarynthos", "Agora"], // for futur dev
      selectedProject: {
        Agora: [2013, "ΒΘ West 2013"],
        Amarynthos: ["AMA21-S24"],
      }, // for futur dev
      trenches: [2013, "ΒΘ West 2013"], //plan is to  have a list of "sources" (trenches, secteurs) as an array in the preference file under "source"
      checkedTrenches: [],
      arr: [],
      Agora: [2013, "ΒΘ West 2013"],
      Amarythos: ["AMA21-S24"],
    };
  },
  computed: {
    groups() {
      return this.selectedProject[this.project];
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
  created() {},
};
</script>