<template>
  <div class="p-1 m-1 bg-light border border-grey rounded">
    <div @click="changeDisplay" id="close" class="position-absolute top-0">
      <p>x</p>
    </div>

    <!-- {{ prout }}
    <select class="form-control" v-model="project" @change="changeSelectedProject">
      <option v-for="project in projects" :key="project" :value="project">
        {{ project }}
      </option>
    </select> -->
    <h3>Trenches</h3>
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
      server: "localhost",
      display: "block",
      project: "Agora",
      projects: ["Amarynthos", "Agora"], // could it be populated by XXXX.preferences.json files present in Data folder?
      selectedProject: {
        Agora: ["ΒΓ 2013", "ΒΘ West 2013"],
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
      checkedTrenches: [],
      arr: [],
      version: {},
      username: "idig",
      password: "idig",
    };
  },
  mounted() {
    if (localStorage.IdigServer) {
      this.server = localStorage.IdigServer;
    }
    if (localStorage.project) {
      this.project = localStorage.project;
    }
    if (localStorage.IdigServer) {
      this.username = localStorage.username;
    }
    if (localStorage.project) {
      this.password = localStorage.password;
    }
  },
  watch: {
    // prout(newProut) {
    //   localStorage.project = newProut;
    // }
  },
  computed: {
    trenches() {
      return this.selectedProject[this.project];
    },
    groupedtrenches() {
      return [
        ...new Set(
          this.selectedProject.Amarynthos.map((x) => x.substring(0, 5))
        ),
      ];
    },
    trenchesbygroup() {
      return this.groupedtrenches.filter((x) => x.startsWith("AMA21"));
    },
  },
  methods: {
    changeDisplay() {
      this.display = "none";
      this.$emit("display-sidebar", this.display);
    },

    changeSelectedProject() {
      // this.trenches = this.selectedProject[this.projects];
    },

    addSelectedTrench: function () {
      this.arr = [];
      this.checkedTrenches.forEach((value) => {
        var session_url =
          "http://" +
          this.server +
          ":9000/idig/" +
          this.project +
          "/" +
          value +
          "/surveys";
        axios({
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          method: "get",
          url: session_url,
          auth: {
            username: this.username,
            password: this.password,
          },
          data: {
            datastuff: "survey",
          },
        }).then((response) => {
          Array.prototype.push.apply(this.arr, response.data.surveys);
          // alert(value + response.data.version);
          this.version[value] = response.data.version;
        });
        this.$emit("selected-trench", this.arr);
        this.$emit("trench-version", this.version);
      });
    },
  },
};
</script>
<style>
#close {
  right: 10px;
}
</style>