<template>
  <div class="p-1 m-1 bg-light border border-grey rounded">
    <h3>Trenches</h3>
    <ul v-for="(n, index) in nbtrenches * 1" :key="n" class="list-group">
      <li class="list-group-item accordion" @click="isHiddenArray[index] = !isHiddenArray[index]">
        {{ index * 10 + 1 }} - {{ index * 10 + 10 }}
      </li>
      <!-- liste tenches -->
      <div v-if="!isHiddenArray[index]">
        <div v-for="(trench, index2) in allTrenches" :key="trench">
          <li v-if="index2 < index * 10 + 10 && index2 >= index * 10" @change="addSelectedTrench()" class="mt-1">
            <input type="checkbox" v-model="checkedTrenches" :value="trench" />
            <label class="p-1 m-0" for="checkbox">{{ trench }}</label>
          </li>
        </div>
      </div>
    </ul>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: {
    allTrenches: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      checkedTrenches: [], // attention garde en mémoire les trenches cochées lorsque l'on change de projet
      arr: [], // data de toutes les trenches, pourra être remplacé par trenchData
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
      ],
    };
  },
  mounted() {
  },
  computed: {

    nbtrenches() {
      return parseInt((this.allTrenches.length + 10) * 0.1);
    },
  },
  methods: {
    addSelectedTrench: function () {
      this.arr = [];
      // this.trenchesData = {},
      //   this.trenchesVersion = {},
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
          data: {},
        }).then((response) => {
          // pour emit des surveys
          Array.prototype.push.apply(this.arr, response.data.surveys);

          this.trenchesData[trench] = response.data.surveys;
          this.trenchesVersion[trench] = response.data.version;
          // store in session in case of PUSH
          sessionStorage.setItem("trenchesData", JSON.stringify(this.trenchesData));
          sessionStorage.setItem("trenchesVersion", JSON.stringify(this.trenchesVersion));
        });
      });
      this.$emit("selected-trench", this.arr);

    },
  },
};
</script>
<style>

</style>