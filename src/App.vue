<template>
  <!-- header -->
<header-idig>
</header-idig>


  <!-- To display sidebar -->
  <div class="p-1" style="float: right; position: absolute; z-index: 1; top:58px; left:8px">
<button v-on:click="changeDisplay()">Filters</button>
</div>

<div class="container-fluid">
  <div class="row flex-xl-nowrap">


    <!-- SIDEBAR -->
    <div class="p-1 col-md-2" id="sticky-sidebar" style="z-index: 1" v-bind:style="{ display: computedDisplay }">
<div class="sticky-top" v-if="!isHidden">
  <access-idig @selected-trench="selectedTrench" @display-sidebar="changeDisplay" @trench-version="trenchVersion"> </access-idig>

  <filter-fields @check-fields="checkFields" @selected-type="selectedType" :selected-data="selectedData">
  </filter-fields>
</div>
</div>


<!-- MAIN FRAME The map or tab goes here -->
<div class="p-1 col-md-10">

  <dyna-table :selected-data="selectedData" :checked-fields="checkedFields" :selected-trenches="trenchesversion">
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
  import preferencesData from "./data/AMA21-S24.Preferences.json";
  import Data from "./data/AMA21-S24.json"; //Default data

  export default {
    name: "App",
    components: {
      AccessIdig,
      FilterFields,
      DynaTable,
      HeaderIdig
    },
    data() {
      return {
        trenchData: Data, // load default data, will be populate when selecting trenches on AccessIdig componant
        fields: preferencesData.types,
        isHidden: false,
        display: "block",
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
        trenchesversion: {}


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
      changeDisplay(dis) {
        this.display = dis;
      },
      // reçoit des enfants
      selectedTrench(trench) {
        this.trenchData = trench;
      },
      selectedType(type) {
        this.selectedFilter = type;
      },
      checkFields(emited) {
        this.checkedFields = emited;
      },
      selectedSidebar(XXXX) {
        this.display = XXXX;
      },
      trenchVersion(version) {
        this.trenchesversion = version;
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
  margin-top: 0px;
}
th {
  background-color: #eee;
}
/* #sidebar {
  display: none;
}

#sidebar:target {
  display: block;
} */
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