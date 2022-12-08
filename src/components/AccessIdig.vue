<template>
  <div class="p-1 m-1 bg-light border border-grey rounded">


    <!-- {{ prout }}
    <select class="form-control" v-model="project" @change="changeSelectedProject">
      <option v-for="project in projects" :key="project" :value="project">
        {{ project }}
      </option>
    </select> -->
    <h3>Trenches</h3>
    <!-- accordion -->
    <ul v-for="(n, index) in  nbtrenches * 1" :key="n" class="list-group">
      <li
        class="list-group-item accordion"
        @click="isHiddenArray[index] = !isHiddenArray[index]"
      >
        {{ index * 10 + 1 }} - {{ index * 10 + 10 }} 
      </li>
      <!-- liste tenches -->
      <div v-if="!isHiddenArray[index]">
        <div v-for="(trench, index2) in trenches" :key="trench">
          <li
            v-if="index2 < index * 10 + 10 && index2 >= index * 10"
            @change="addSelectedTrench()"
            class="mt-1"
          >
            <input type="checkbox" v-model="checkedTrenches" :value="trench" />
            <label class="p-1 m-0" for="checkbox">{{ trench }}</label>
          </li>
        </div>
      </div>
    </ul>
    <!-- accordion end -->

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
          "AMA_Kokalas",
          "AMA-Micromorpho",
          "AMA07",
          "AMA12",
          "AMA13",
          "AMA14",
          "AMA15-S14",
          "AMA15-S15",
          "AMA15-S16",
          "AMA15-S17",
          "AMA16_plans",
          "AMA16-S14",
          "AMA16-S14E",
          "AMA16-S15",
          "AMA16-S16",
          "AMA16·S17",
          "AMA16-S19",
          "AMA16-S20",
          "AMA17- plans",
          "AMA17-S17",
          "AMA17-S19",
          "AMA17-S20",
          "AMA17-S21",
          "AMA17-S22C",
          "AMA17-S22N",
          "AMA17-S22S",
          "AMA17-S23",
          "AMA18_plans",
          "AMA18-Ed4",
          "AMA18-S14",
          "AMA18-S19",
          "AMA18-S20",
          "AMA18-S21",
          "AMA18-S22C",
          "AMA18-S22N",
          "AMA18-S22S",
          "AMA18-S24",
          "AMA18-S25",
          "AMA18-S26",
          "AMA18-S27",
          "AMA19-plans",
          "AMA19-S17",
          "AMA19-S19",
          "AMA19-S20",
          "AMA19-S21",
          "AMA19-S22C",
          "AMA19-S22N",
          "AMA19-S22S",
          "AMA19-S24",
          "AMA19-S26",
          "AMA19-S27",
          "AMA19-S28",
          "AMA19-S29",
          "AMA19-S30",
          "AMA19-S31",
          "AMA19-S32",
          "AMA19-S33",
          "AMA20-plans",
          "AMA20-S14",
          "AMA20-S14E",
          "AMA20-S19",
          "AMA20-S21",
          "AMA20-S22-NE",
          "AMA20-S22N",
          "AMA20-S24",
          "AMA20-S26",
          "AMA20-S28",
          "AMA20-S31",
          "AMA20-S32",
          "AMA20-S34",
          "AMA20-S35",
          "AMA20-S36",
          "AMA21-Plans",
          "AMA21-S21",
          "AMA21-S22N",
          "AMA21-S24",
          "AMA21-S28",
          "AMA21-S2801",
          "AMA21-S2802",
          "AMA21-S2803",
          "AMA21-S33",
          "AMA21-S34",
          "AMA21-S35",
          "AMA21-S37",
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
      isHidden: true,
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
      ],
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
    nbtrenches() {
      return parseInt((this.trenches.length + 10) * 0.1);
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