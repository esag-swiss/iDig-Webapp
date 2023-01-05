<template>
  <!-- header -->
  <header-idig @toggle-menu="toggleMenu" @all-trenches="setallTrench" @all-types="setallTypes" >
  </header-idig>

  <div class="container-fluid">
    <div class="row flex-xl-nowrap">
      <!-- SIDEBAR -->
      <div class="p-1 col-md-2" v-bind:style="{ display: computedDisplay }">
        <div class="sticky-top">
          <access-idig
            @selected-trench="selectedTrench"
            
            :all-trenches="allTrench"
          >
          </access-idig>

          <filter-fields
            @check-fields="checkFields"
            @selected-type="selectedType"
            :selected-data="selectedData"
          >
          </filter-fields>
        </div>
      </div>

      <!-- MAIN FRAME The map or tab goes here -->
      <div
        class="p-1"
        :class="{ 'col-md-10': isHidden, 'col-md-12': !isHidden }"
      >
        <dyna-table
          :selected-data="selectedData"
          :checked-fields="checkedFields"
          
          :selected-type="selectedFilter"
          :all-types="allTypes"
        >
        </dyna-table>
      </div>
    </div>
  </div>
</template>

<script>
import AccessIdig from "./components/AccessIdig";
import HeaderIdig from "./components/HeaderIdig";
import FilterFields from "./components/FilterFields";
import DynaTable from "./components/DynaTable";
import preferencesData from "./data/Preferences.json";
import Data from "./data/AMA21-S24.json"; //Default data

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
        { field: "Source", sortable: true, label: "Source" },
        { field: "Title", sortable: true, label: "Titre" },
        {
          field: "Identifier",
          isKey: true,
          sortable: true,
          label: "Identifier",
        },
      ],
      // trenchesversion: {},
      allTrench: [],
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
    // reçoit des enfants
    setallTrench(allTrenches) { // recoit toutes les trenches de HeaderIdig
      this.allTrench = allTrenches;
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