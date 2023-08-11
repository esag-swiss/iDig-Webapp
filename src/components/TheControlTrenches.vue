<template>
  <div name="secteurs" class="p-1 m-1 bg-light border-0">
    <h3>Secteurs</h3>

    <ul
      v-for="(trenchGroupName, index) in accordionLabels"
      :key="trenchGroupName"
      class="list-group"
    >
      <li
        class="list-group-item accordion text-bold"
        @click="isDisplayedArray[index] = !isDisplayedArray[index]"
      >
        {{ trenchGroupName }}
      </li>
      <!-- liste trenches -->
      <div v-if="isDisplayedArray[index]">
        <ul
          v-for="trenchName in projectTrenchesNames"
          :key="trenchName"
          class="list-group"
        >
          <li
            v-if="trenchName.includes(trenchGroupName)"
            class="list-group-item accordion"
            @change="updateTrenchesDataWithSelectedTrench(trenchName)"
          >
            <input
              v-model="checkedTrenchesNames"
              type="checkbox"
              :value="trenchName"
            />
            <label class="px-1 m-0 text-bold" for="checkbox">{{
              trenchName
            }}</label>
          </li>
        </ul>
      </div>
    </ul>

    <!-- Check All -->
    <div>
      <input
        :checked="areAllChecked"
        type="checkbox"
        @click="toggleCheckAll(), fetchAllTrenchesData()"
      />
      <label class="px-1 m-0 text-bold" for="checkbox"> Check All </label>
    </div>
  </div>
</template>

<script>
import { apiFetchSurvey } from "@/services/ApiClient";
import { mapActions, mapState, mapWritableState } from "pinia";
import { useDataStore } from "@/stores/data";

export default {
  data() {
    return {
      checkedTrenchesVersions: {}, // use store ?
      isDisplayedArray: [],
    };
  },

  computed: {
    ...mapState(useDataStore, ["projectTrenchesNames"]),
    ...mapWritableState(useDataStore, [
      "checkedTrenchesNames",
      "checkedTrenchesData",
    ]), // TODO : no writable state if possible
    accordionLabels() {
      // create groups by 5 first caracters and send reverse order
      return [...new Set(this.projectTrenchesNames?.map((x) => x.substr(0, 5)))]
        .sort()
        .reverse();
    },
    checkedTrenchesItems() {
      let allItem = [];
      Object.values(this.checkedTrenchesData).forEach((data) => {
        allItem.push(...data);
      });
      return allItem;
    },
    areAllChecked() {
      return (
        this.checkedTrenchesNames.length === this.projectTrenchesNames.length
      );
    },
  },
  methods: {
    ...mapActions(useDataStore, ["setCheckedTrenchesItems", "selectedType"]),
    toggleCheckAll: function () {
      // When the user click on check all
      if (this.areAllChecked) {
        this.checkedTrenchesNames = [];
      } else {
        this.checkedTrenchesNames = [...this.projectTrenchesNames];
      }
    },
    updateTrenchesDataWithSelectedTrench: function (trench) {
      if (
        Object.prototype.hasOwnProperty.call(this.checkedTrenchesData, trench)
      ) {
        delete this.checkedTrenchesData[trench];
      } else {
        apiFetchSurvey(trench)
          .then((response) => {
            // prepare data to store in session in case of PUSH
            this.checkedTrenchesData[trench] = response.data.surveys;
            this.checkedTrenchesVersions[trench] = response.data.version;

            // store in session in case of PUSH
            sessionStorage.setItem(
              "checkedTrenchesData",
              JSON.stringify(this.checkedTrenchesData)
            );
            sessionStorage.setItem(
              "checkedTrenchesVersions",
              JSON.stringify(this.checkedTrenchesVersions)
            );
            this.setCheckedTrenchesItems(this.checkedTrenchesItems);
          })
          .catch(() => {});
      }
    },

    fetchAllTrenchesData: function () {
      this.checkedTrenchesNames.forEach((trench) => {
        apiFetchSurvey(trench)
          .then((response) => {
            // prepare data to store in session in case of PUSH
            this.checkedTrenchesData[trench] = response.data.surveys;
            this.checkedTrenchesVersions[trench] = response.data.version;

            // store in session in case of PUSH
            sessionStorage.setItem(
              "checkedTrenchesData",
              JSON.stringify(this.checkedTrenchesData)
            );
            sessionStorage.setItem(
              "checkedTrenchesVersions",
              JSON.stringify(this.checkedTrenchesVersions)
            );
          })
          .catch(() => {});
      });
    },
  },
};
</script>
<style scoped></style>
