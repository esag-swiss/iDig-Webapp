<template>
  <div class="row">
    <div class="col-md-3">
      <!-- The layer checkboxes go here -->
      <filter-liste
         @test-emit="testEmit">
      </filter-liste>
      <filter-fields
         :selected-filter="selectedFilter">        
      </filter-fields>
    </div>

    <div class="col-md-9">
      <!-- The map goes here -->
        <table class="table table-bordered">

        </table>
        <dyna-table
          :selected-fields="selectedFields"
          :selected-data="selectedData">
        </dyna-table>  
    </div>
  </div> 
</template>

<script>
import FilterListe from './components/FilterListe';
import FilterFields from './components/FilterFields';
// import UsersTable from './components/UsersTable';
import DynaTable from './components/DynaTable';
import preferencesData from "./components/AMA21-S24.Preferences.json";
import trenchData from "./components/AMA21-S24.json";

export default {
  name: 'App',
  components: {
    FilterListe,
    FilterFields,
    DynaTable
  },
  data() {
     return {
      fields: preferencesData.types,
       trenchdata: trenchData,
      selectedFilter: "Artifact", // type by default
   };
  },
  computed: {
    selectedFields(){
     return this.fields.filter(x => {
      return x.type.includes(this.selectedFilter)
     })[0].groups[0].fields
    },
    selectedData(){
     return this.trenchdata.filter(object => {
        return object.Type.includes(this.selectedFilter)
     })
    } 
  },
  methods: {
    testEmit(testid) {
      this.selectedFilter=testid,
      console.log(testid)
    },
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
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
}
#app h2 {
  font-size: 2rem;
  border-bottom: 2px solid #ccc;
  color: #58004d;
  margin: 0 0 1rem 0;
}
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
