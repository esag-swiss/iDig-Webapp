<template>
  <div class="p-1 m-1 bg-light border border-grey rounded">
    <h3>Projet :</h3>
    <select
      id="dropdown"
      text="Options"
      v-model="selectedProject"
      @change="addSelectedTrench()"
      class="form-control"
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
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      projects: ["Agora", "Amarynthos"],
      selectedProject: "Agora",
      trenches: [2013, "ΒΘ West 2013"],
      checkedTrenches: [],
      arr: [],
    };
  },
  // props: {
  //   selectedFilter: {
  //     type: String,
  //     required: false,
  //   },
  // },
  methods: {
    changeSelectedProject() {},
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
  computed: {},
};
</script>