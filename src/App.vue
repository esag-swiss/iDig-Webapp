<template>
  <!-- header -->
  <HeaderIdig @toggle-menu="toggleMenu" @all-types="setallTypes"> </HeaderIdig>

  <div class="container-fluid">
    <div class="row flex-xl-nowrap">
      <!-- SIDEBAR -->
      <div class="p-1 col-md-2" :style="{ display: computedDisplay }">
        <div class="sticky-top">
          <AccessIdig @selected-trench="selectedTrench"> </AccessIdig>

          <FilterFields
            :selectedData="selectedData"
            @check-fields="checkFields"
            @selected-type="selectedType"
          >
          </FilterFields>
        </div>
      </div>

      <!-- MAIN FRAME The map or tab goes here -->
      <div
        class="p-1"
        :class="{ 'col-md-10': isHidden, 'col-md-12': !isHidden }"
      >
        <DynaTable
          :selectedData="selectedData"
          :checkedFields="checkedFields"
          :selectedType="selectedFilter"
          :allTypes="allTypes"
        >
        </DynaTable>
      </div>
    </div>
  </div>
</template>

<script>
import AccessIdig from "@/components/AccessIdig.vue";
import HeaderIdig from "@/components/HeaderIdig.vue";
import FilterFields from "@/components/FilterFields.vue";
import DynaTable from "@/components/DynaTable.vue";
import preferencesData from "@/data/Preferences.json";
import Data from "@/data/AMA21-S24.json";

export default {
  name: "App",
  components: {
    AccessIdig,
    FilterFields,
    DynaTable,
    HeaderIdig,
  },
  data() {
    return {
      isHidden: true,
      display: "block",
      class: true,
      trenchData: Data, // load default data, will be populate when selecting trenches on AccessIdig componant
      fields: preferencesData.types,
      selectedFilter: "Artifact", // type by default
      checkedFields: [
        // columns by default before any selection /!\ label needed to display headers
        { field: "Source", sortable: true, label: "Secteur" },
        { field: "Title", sortable: true, label: "Titre" },
        {
          field: "Identifier",
          isKey: true,
          sortable: true,
          label: "Identifiant",
        },
      ],
      allTypes: [],
    };
  },
  computed: {
    selectedData() {
      return this.trenchData.filter((object) => {
        return object.Type.includes(this.selectedFilter);
      });
    },
    computedDisplay() {
      return this.display;
    },
  },
  methods: {
    toggleMenu() {
      //a simplifier avec :class
      if (this.display == "none") {
        this.display = "block";
      } else {
        this.display = "none";
      }
      this.isHidden = !this.isHidden;
    },
    setallTypes(types) {
      this.allTypes = types;
    },
    selectedTrench(trench) {
      this.trenchData = trench;
    },
    selectedType(type) {
      this.selectedFilter = type;
    },
    checkFields(emited) {
      this.checkedFields = emited;
    },
  },
};
</script>

<style>
#app h3 {
  font-size: 1.3rem;
}
</style>
