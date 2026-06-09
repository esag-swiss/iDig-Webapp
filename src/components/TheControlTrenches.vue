<template>
  <div name="secteurs" class="p-1 m-1 bg-light border-0">
    <div>
      <span class="text-bold pseudoh3">{{ $t("app.trenches") }}</span>
      <q-checkbox
        v-if="isAllChecked !== false"
        v-model="isAllChecked"
        size="xs"
        toggle-order="ft"
        indeterminate-value="maybe"
        @update:model-value="handleCheckboxUpdate"
        ><q-tooltip class="bg-accent"> Select none </q-tooltip></q-checkbox
      >
      <q-checkbox
        v-if="isAllChecked !== true"
        v-model="toAllChecked"
        size="xs"
        @update:model-value="handleCheckboxUpdate"
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
            v-close-popup
            flat
            label="Cancel"
            @click="
              isAllChecked = 'maybe';
              toAllChecked = false;
            "
          />
          <q-btn v-close-popup flat label="Ok" @click="checkAll()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- liste trenches -->
    <div v-if="trenchNames.length < 15" class="py-1">
      <div v-for="trenchName in trenchNames" :key="trenchName">
        <BaseCheckbox
          :model-value="checkedTrenchesNames.includes(trenchName)"
          :label="trenchName"
          @update:model-value="
            (checked) => toggleTrench(trenchName, checked)
          "
        />
      </div>
    </div>
    <div v-else>
      <BaseAccordion
        v-for="(trenchGroup, index) in groupedTrenches"
        :key="trenchGroup.name"
        :initial-open="index === 0"
        :toggle-aria-label="`Toggle ${trenchGroup.name}`"
      >
        <template #title>
          <BaseCheckbox
            class="text-bold"
            :model-value="isGroupAllChecked(trenchGroup.trenches)"
            :label="trenchGroup.name"
            @update:model-value="
              (checked) => checkGroup(trenchGroup.trenches, checked)
            "
          />
        </template>
        <template #content>
          <div v-for="trenchName in trenchGroup.trenches" :key="trenchName">
            <BaseCheckbox
              :model-value="checkedTrenchesNames.includes(trenchName)"
              :label="trenchName"
              @update:model-value="
                (checked) => toggleTrench(trenchName, checked)
              "
            />
          </div>
        </template>
      </BaseAccordion>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapWritableState } from "pinia";
import { useDataStore } from "@/stores/data";
import BaseAccordion from "@/components/base/BaseAccordion.vue";
import BaseCheckbox from "@/components/base/BaseCheckbox.vue";

export default {
  components: { BaseAccordion, BaseCheckbox },
  data() {
    return {
      isAllChecked: false,
      toAllChecked: false,
      confirmAllChecked: false,
    };
  },
  computed: {
    ...mapState(useDataStore, ["projectTrenchesNames", "checkedTrenchesItems"]),
    ...mapWritableState(useDataStore, ["checkedTrenchesNames"]), // mapWritableState for v-model only
    trenchNames() {
      return this.projectTrenchesNames ?? [];
    },
    accordionLabels() {
      // create groups by 5 first caracters and send reverse order
      return [...new Set(this.trenchNames.map((x) => x.substr(0, 5)))]
        .sort()
        .reverse();
    },
    groupedTrenches() {
      return this.accordionLabels.map((name) => ({
        name,
        trenches: this.trenchNames.filter((trenchName) =>
          trenchName.includes(name),
        ),
      }));
    },
  },
  watch: {
    checkedTrenchesNames(newTrenchList, oldTrenchList) {
      const addedTrenches = newTrenchList.filter(
        (item) => !oldTrenchList.includes(item),
      );
      const removedTrenches = oldTrenchList.filter(
        (item) => !newTrenchList.includes(item),
      );
      this.removeCheckedTrenchesData(removedTrenches);
      this.addCheckedTrenchesData(addedTrenches);

      if (newTrenchList.length === this.trenchNames.length) {
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
        if (this.trenchNames.length > 15) {
          this.confirmAllChecked = true;
        } else {
          this.checkAll();
        }
      } else if (value === false) {
        this.uncheckAll();
      }
    },
    checkAll() {
      this.setCheckedTrenchesNames([...this.trenchNames]);
    },
    uncheckAll() {
      this.setCheckedTrenchesNames([]);
    },
    isGroupAllChecked(groupTrenches) {
      return (
        groupTrenches.length > 0 &&
        groupTrenches.every((trenchName) =>
          this.checkedTrenchesNames.includes(trenchName),
        )
      );
    },
    checkGroup(groupTrenches, checked) {
      const uniqueCheckedTrenchesNames = new Set(this.checkedTrenchesNames);
      if (checked) {
        groupTrenches.forEach((trenchName) =>
          uniqueCheckedTrenchesNames.add(trenchName),
        );
      } else {
        groupTrenches.forEach((trenchName) =>
          uniqueCheckedTrenchesNames.delete(trenchName),
        );
      }
      this.setCheckedTrenchesNames([...uniqueCheckedTrenchesNames]);
    },
    toggleTrench(trenchName, checked) {
      const uniqueCheckedTrenchesNames = new Set(this.checkedTrenchesNames);
      if (checked) {
        uniqueCheckedTrenchesNames.add(trenchName);
      } else {
        uniqueCheckedTrenchesNames.delete(trenchName);
      }
      this.setCheckedTrenchesNames([...uniqueCheckedTrenchesNames]);
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
