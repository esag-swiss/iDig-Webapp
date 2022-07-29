<template>
  <div class="row">
    <div class="p-1 col-md-3">
      <!-- The layer checkboxes go here -->
      <access-idig
        @selected-trench="selectedTrench"
      >
      </access-idig>
      <filter-fields
        @check-fields="checkFields"
        @selected-type="selectedType"
      >
      </filter-fields>
    </div>

    <div class="p-1 col-md-9">
      <!-- The map or tab goes here -->
      <dyna-table
        :selected-data="selectedData"
        :checked-fields="checkedFields"
      >
      </dyna-table>
    </div>
  </div>
</template>

<script>
import AccessIdig from "./components/AccessIdig";
import FilterFields from "./components/FilterFields";
import DynaTable from "./components/DynaTable";
import preferencesData from "./data/AMA21-S24.Preferences.json";
import Data from "./data/AMA21-S24.json"; //Default data

export default {
  name: "App",
  components: {
    AccessIdig,
    FilterFields,
    DynaTable,
  },
  data() {
    return {
      trenchData: Data, // load default data, will be populate when selecting trenches on AccessIdig componant
      fields: preferencesData.types,
      
      selectedFilter: "Artifact", // type by default
      checkedFields: [ // columns by default before any selection /!\ label needed to display headers
        { field: "Source", sortable: true, label: "Source" },
        { field: "Type", sortable: true, label: "Type"},
        { field: "Identifier",
          isKey: true, sortable: true, label: "Identifier"},
      ],// ca pourrait etre emis de FilterFields
    };
  },
  computed: {
    selectedData() {
      return this.trenchData.filter((object) => {
        return object.Type.includes(this.selectedFilter);
      });
    },
  },
  methods: {
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
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 20px;
}
th {
  background-color: #eee;
}
/*
* {
  box-sizing: border-box;
}
html {
  font-family: 'Jost', sans-serif;
}
body {
  margin: 0;
}
header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  margin: 3rem auto;
  border-radius: 10px;
  padding: 1rem;
  background-color: #58004d;
  color: white;
  text-align: center;
  width: 90%;
  max-width: 40rem;
}
#app ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
#app li {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  margin: 1rem auto;
  border-radius: 10px;
  text-align: center;
  width: 90%;
  max-width: 40rem;
}*/
#app h3 {
  font-size: 1.3rem;
  /* border-bottom: 2px solid #ccc; */
  /* color: #58004d; */
  /* margin: 0 0 1rem 0; */
}
/*
#app button {
  font: inherit;
  cursor: pointer;
  border: 1px solid #ff0077;
  background-color: #ff0077;
  color: white;
  padding: 0.05rem 1rem;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.26);
}
#app button:hover,
#app button:active {
  background-color: #ec3169;
  border-color: #ec3169;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.26);
}*/
</style>
