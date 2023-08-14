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
        @click="toggleCheckAll()"
      />
      <label class="px-1 m-0 text-bold" for="checkbox"> Check All </label>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapWritableState } from "pinia";
import { useDataStore } from "@/stores/data";

export default {
  data() {
    return {
      isDisplayedArray: [],
    };
  },
  computed: {
    ...mapState(useDataStore, ["projectTrenchesNames", "checkedTrenchesItems"]),
    ...mapWritableState(useDataStore, ["checkedTrenchesNames"]), // mapWritableState for v-model only
    accordionLabels() {
      // create groups by 5 first caracters and send reverse order
      return [...new Set(this.projectTrenchesNames?.map((x) => x.substr(0, 5)))]
        .sort()
        .reverse();
    },
    areAllChecked() {
      return (
        this.checkedTrenchesNames.length === this.projectTrenchesNames.length
      );
    },
  },
  watch: {
    checkedTrenchesNames(newValue, oldValue) {
      // console.log("old", oldValue);
      // console.log("new", newValue);
      // console.log("======");

      // Solution temporaire brutale. Il faudra comparer les longueurs de newValue et oldValue,
      // et ne faire que le necessaire
      this.setCheckedTrenchesData({});
      this.updateCheckedTrenchesData();
    },
  },
  methods: {
    ...mapActions(useDataStore, [
      "setCheckedTrenchesData",
      "setCheckedTrenchesNames",
      "updateCheckedTrenchesData",
    ]),
    toggleCheckAll: function () {
      // When the user click on check all
      if (this.areAllChecked) {
        this.setCheckedTrenchesNames([]);
      } else {
        this.setCheckedTrenchesNames([...this.projectTrenchesNames]);
      }
    },
  },
};
</script>
<style scoped></style>
