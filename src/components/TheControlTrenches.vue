<template>
  <div name="secteurs" class="p-1 m-1 bg-light border-0">
    <div>
      <span class="text-bold pseudoh3">{{ $t("app.trenches") }}</span>
      <q-checkbox
        v-if="isAllChecked !== false"
        @update:model-value="handleCheckboxUpdate"
        v-model="isAllChecked"
        size="xs"
        toggle-order="ft"
        indeterminate-value="maybe"
        ><q-tooltip class="bg-accent"> Select none </q-tooltip></q-checkbox
      >
      <q-checkbox
        v-if="isAllChecked !== true"
        @update:model-value="handleCheckboxUpdate"
        size="xs"
        v-model="toAllChecked"
        ><q-tooltip class="bg-accent"> Select all </q-tooltip></q-checkbox
      >
    </div>
    <q-dialog v-model="confirmAllChecked" persistent>
      <q-card class="bg-accent text-white">
        <q-card-section>
          <div class="text-h6">Alert</div>
        </q-card-section>
        <q-card-section class="items-center">
          <span class="q-ml-sm"
            >This action will select all trenches. If there are more than 20
            trenches, please proceed with caution.</span
          >
        </q-card-section>

        <q-card-actions>
          <q-btn
            flat
            label="Cancel"
            @click="
              isAllChecked = 'maybe';
              toAllChecked = false;
            "
            v-close-popup
          />
          <q-btn flat label="Ok" @click="checkAll()" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- liste trenches -->
    <div v-if="projectTrenchesNames.length < 15">
      <ul
        v-for="trenchName in projectTrenchesNames"
        :key="trenchName"
        class="list-group"
      >
        <li class="list-group-item accordion">
          <input
            id="trench-checkbox"
            v-model="checkedTrenchesNames"
            type="checkbox"
            :value="trenchName"
          />
          <label class="px-1 m-0" for="trench-checkbox">{{ trenchName }}</label>
        </li>
      </ul>
    </div>
    <div v-else>
      <ul
        v-for="(trenchGroupName, index) in accordionLabels"
        :key="trenchGroupName"
        class="list-group"
      >
        <li
          class="list-group-item accordion text-bold"
          @click="isDisplayedArray[index] = !isDisplayedArray[index]"
        >
          <label class="px-1 m-0 text-bold" for="checkbox">
            <q-icon
              v-if="isDisplayedArray[index]"
              name="keyboard_arrow_down"
            /><q-icon
              v-if="!isDisplayedArray[index]"
              name="keyboard_arrow_right"
            />{{ trenchGroupName }}</label
          >
          <input
            v-model="isCheckedArray[index]"
            type="checkbox"
            @change="checkGroup(trenchGroupName, isCheckedArray[index])"
          />
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
                id="trench-checkbox"
                v-model="checkedTrenchesNames"
                type="checkbox"
                :value="trenchName"
              />
              <label class="px-1 m-0" for="trench-checkbox">{{
                trenchName
              }}</label>
            </li>
          </ul>
        </div>
      </ul>
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
      isCheckedArray: [],
      isAllChecked: false,
      toAllChecked: false,
      confirmAllChecked: false,
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

      if (newTrenchList.length === this.projectTrenchesNames.length) {
        this.isAllChecked = true;
      } else if (newTrenchList.length === 0) {
        this.isAllChecked = false;
      } else {
        this.isAllChecked = "maybe";
        this.toAllChecked = false;
      }
    },
  },
  methods: {
    ...mapActions(useDataStore, [
      "setCheckedTrenchesNames",
      "addCheckedTrenchesData",
      "removeCheckedTrenchesData",
    ]),
    handleCheckboxUpdate(value) {
      if (value === true) {
        if (this.projectTrenchesNames.length > 15) {
          this.confirmAllChecked = true;
        } else {
          this.checkAll();
        }
      } else if (value === false) {
        this.uncheckAll();
      }
    },
    checkAll() {
      this.setCheckedTrenchesNames([...this.projectTrenchesNames]);
      this.isCheckedArray = this.accordionLabels.map(() => true);
    },
    uncheckAll() {
      this.setCheckedTrenchesNames([]);
      this.isCheckedArray = this.accordionLabels.map(() => false);
    },
    checkGroup(checkGroup, checked) {
      if (checked) {
        let newCheckedTrenchesNames = this.checkedTrenchesNames.concat(
          this.projectTrenchesNames.filter((item) => item.includes(checkGroup))
        );
        this.setCheckedTrenchesNames(newCheckedTrenchesNames);
      } else {
        // Removes items from checkGroup and checkedTrenchesNames
        let filteredCheckedTrenchesNames = this.checkedTrenchesNames.filter(
          (item) => !item.includes(checkGroup)
        );
        this.setCheckedTrenchesNames(filteredCheckedTrenchesNames);
      }
    },
  },
};
</script>
<style>
/* seems necessary to avoid Bootstrap Quasar conflict */
.row {
  margin-right: 0px;
  margin-left: 0px;
}
.col {
  padding-right: 0px;
  padding-left: 0px;
}
.pseudoh3 {
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 0rem;
}
</style>
