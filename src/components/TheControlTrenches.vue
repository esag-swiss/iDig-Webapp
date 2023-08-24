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

    <!-- Check All/None -->
    <div class="q-gutter-sm">
      <q-btn
        align="left"
        padding="xs"
        color="secondary"
        :disabled="isNoneChecked"
        label="None"
        @click="uncheckAll"
        ><q-tooltip class="bg-accent">Uncheck all trenches</q-tooltip></q-btn
      >
      <q-btn
        align="left"
        padding="xs"
        color="secondary"
        :disabled="isAllChecked"
        label="All"
        @click="checkAll"
        ><q-tooltip class="bg-accent">Check all trenches</q-tooltip></q-btn
      >
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
    isAllChecked() {
      return (
        this.checkedTrenchesNames.length === this.projectTrenchesNames.length
      );
    },
    isNoneChecked() {
      return this.checkedTrenchesNames.length === 0;
    },
  },
  watch: {
    checkedTrenchesNames(newTrenchList, oldTrenchList) {
      if (newTrenchList.length > oldTrenchList.length) {
        const addedTrenches = newTrenchList.filter(
          (trenchName) => !oldTrenchList.includes(trenchName)
        );
        this.addCheckedTrenchesData(addedTrenches);
      } else if (newTrenchList.length < oldTrenchList.length) {
        const removedTrenches = oldTrenchList.filter(
          (trenchName) => !newTrenchList.includes(trenchName)
        );
        this.removeCheckedTrenchesData(removedTrenches);
      } else {
        console.error(
          "watch for checkedTrenchesNames was call with new and old value having same length"
        );
      }
    },
  },
  methods: {
    ...mapActions(useDataStore, [
      "setCheckedTrenchesData",
      "setCheckedTrenchesNames",
      "addCheckedTrenchesData",
      "removeCheckedTrenchesData",
    ]),
    checkAll() {
      this.setCheckedTrenchesNames([...this.projectTrenchesNames]);
    },
    uncheckAll() {
      this.setCheckedTrenchesNames([]);
    },
  },
};
</script>
<style scoped></style>
