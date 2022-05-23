<template>
  <div class="row">
    <div class="col-md-3">
      <!-- The layer checkboxes go here -->
      <filter-liste 
         @selected-emit="selectedEmit">
      </filter-liste>
      <filter-fields
          :selected-filter="selectedFilter"
          @check-fields="checkFields">        
      </filter-fields>
    </div>

    <div class="col-md-9">
      <!-- The map goes here -->
    <!-- <div v-for="type in checkedFields" :key="type">{{selectedFields}}</div>  -->
        <dyna-table
          :selected-fields="selectedFields"
          :selected-data="selectedData"
          :checked-fields="checkedFields"
          >
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
      checkedFields: [{ "field": "Source" }, { "field": "Type" }, { "field": "Identifier", "labels": { "de": "FK-Nr.", "en": "FK-nr", "fr": "FK-no", "it": "FK-n.", "el": "" }, "tips": { "de": "Kontext-Nr. - fortlaufend-Nr. (z.B. 500-3). Objekte ohne exakten Fundort tragen lediglich die Kontext-Nr.", "en": "Context nr - serial nr (Ex. 500-3). Artifacts without exact provenance have the context number only", "fr": "No du contexte - no continu (Ex. 500-3). Les objets sans provenance exacte ont uniquement le numéro du contexte", "it": "N. del contesto - n. continuo (Es. 500-3). I reperti senza un luogo di ritrovamento esatto, avranno unicamente il numero del contesto", "el": "" } }]
   };
  },
  computed: {
    selectedFields(){
     return this.fields.filter(x => {
      return x.type.includes(this.selectedFilter)
     })[0].groups[0].fields
    },
    selectedGroups(){
     return this.fields.filter(x => {
      return x.type.includes(this.selectedFilter)
     })[0].groups
    },
    selectedData(){
     return this.trenchdata.filter(object => {
        return object.Type.includes(this.selectedFilter)
     })
    } 
  },
  methods: {
    selectedEmit(field) {
      this.selectedFilter=field
    },
    checkFields(fields) {
      this.checkedFields=fields
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
