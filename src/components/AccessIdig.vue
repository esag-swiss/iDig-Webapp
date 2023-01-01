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
      // server: "localhost",
      // project: "Amarynthos",
      // username: "idig",
      // password: "idig",

      checkedTrenches: [], // attention garde en mémoire les trenches cochées lorsque l'on change de projet
      arr: [], // data de toutes les trenches, pourra être remplacé par trenchData
      trenchesData: {},
      version: {},

      // isHidden: true,
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
    // if (localStorage.IdigServer) {
    //   this.server = localStorage.IdigServer;
    // }
    // if (localStorage.project) {
    //   this.project = localStorage.project;
    // }
    // if (localStorage.username) {
    //   this.username = localStorage.username;
    // }
    // if (localStorage.password) {
    //   this.password = localStorage.password;
    // }
  },
  computed: {
    trenches() {
      return this.allTrenches;
    },
    nbtrenches() {
      return parseInt((this.trenches.length + 10) * 0.1);
    },
  },
  methods: { 
    addSelectedTrench: function () {
      this.arr = [];
      this.checkedTrenches.forEach((trench) => {
        var session_url =
          "http://" +
          localStorage.IdigServer +
          ":9000/idig/" +
          localStorage.project +
          "/" +
          trench +
          "/surveys";
        axios({
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          method: "get",
          url: session_url,
          auth: {
            username: localStorage.username,
            password: localStorage.password,
          },
          data: {
            datastuff: "survey",
          },
        }).then((response) => {
          Array.prototype.push.apply(this.arr, response.data.surveys);

          this.trenchesData[trench] = response.data.surveys;

          this.version[trench] = response.data.version;
        });
      });
      // list all objects type in array types
      sessionStorage.setItem("trenchesData", JSON.stringify(this.trenchesData));
      this.$emit("selected-trench", this.arr);
      this.$emit("trench-version", this.version);
    },
  },
};
</script>
<style>
</style>