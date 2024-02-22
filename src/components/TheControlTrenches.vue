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
        <q-btn
          align="left"
          padding="2px 5px"
          size="10px"
          color="secondary"
          label="all"
          @click="checkGroup(trenchGroupName)"
          ><q-tooltip class="bg-accent"
            >all trenches from group</q-tooltip
          ></q-btn
        >
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
    <div class="q-pa-xs">
      <div class="q-gutter-sm">
        <q-btn
          align="left"
          size="10px"
          padding="2px 5px"
          color="secondary"
          :disabled="isNoneChecked"
          label="None"
          @click="uncheckAll"
          ><q-tooltip class="bg-accent">Uncheck all trenches</q-tooltip></q-btn
        >
        <q-btn
          align="left"
          size="10px"
          padding="2px 5px"
          color="secondary"
          :disabled="isAllChecked"
          label="All"
          @click="checkAll"
          ><q-tooltip class="bg-accent">Check all trenches</q-tooltip></q-btn
        >
      </div>
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
      const addedTrenches = newTrenchList.filter(
        (item) => !oldTrenchList.includes(item)
      );
      const removedTrenches = oldTrenchList.filter(
        (item) => !newTrenchList.includes(item)
      );
      this.removeCheckedTrenchesData(removedTrenches);
      this.addCheckedTrenchesData(addedTrenches);
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
    checkGroup(checkGroup) {
      let newCheckedTrenchesNames = this.checkedTrenchesNames.concat(
        this.projectTrenchesNames.filter((item) => item.includes(checkGroup))
      );
      this.setCheckedTrenchesNames(newCheckedTrenchesNames);
    },
  },
};
</script>
<style scoped></style>
