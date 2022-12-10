<template>
  <div class="p-1 m-1 bg-light border border-grey rounded">
    <h3>Trenches</h3>
    <!-- accordion -->
    <ul v-for="(n, index) in nbtrenches * 1" :key="n" class="list-group">
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
      project: "Amarynthos",
      projects: ["Amarynthos", "Agora"], // could it be populated by XXXX.preferences.json files present in Data folder?
      username: "idig",
      password: "idig",
      
      checkedTrenches: [],
      arr: [],
      version: {},
      display: "block",
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
    props: {
    allTrenches: {
      type: Object,
      required: true,
    },
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
  computed: {
    trenches() {
      return this.allTrenches;
    },
    nbtrenches() {
      return parseInt((this.trenches.length + 10) * 0.1);
    },
    // groupedtrenches() {
    //   return [
    //     ...new Set(
    //       this.selectedProject.Amarynthos.map((x) => x.substring(0, 5))
    //     ),
    //   ];
    // },
    // trenchesbygroup() {
    //   return this.groupedtrenches.filter((x) => x.startsWith("AMA21"));
    // },
  },
  methods: {
    changeDisplay() {
      this.display = "none";
      this.$emit("display-sidebar", this.display);
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