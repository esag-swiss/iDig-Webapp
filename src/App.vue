<template>
  <div class="row">

    <div class="col-md-3">
      <!-- The layer checkboxes go here -->
      <filter-liste
         @test-emit="testEmit">
      </filter-liste>
      <filter-fields
         :selected-filter="selectedfilter">        
      </filter-fields>
    </div>

    <div class="col-md-9">
      <!-- The map goes here -->
              <h2>UsersTable from json file</h2>
        <table class="table table-bordered">
          <users-table
        v-for="friend in filteredAndSorted"
        :key="friend.id"
        :name="friend.name"
        :phone-number="friend.phone"
        :email-address="friend.email"
        :friend-type="friend.type"
        :friend-truc="friend.truc"
        :selected-filter="selectedfilter"
        >
        </users-table>
        </table>
    </div>

  </div> 
  
</template>

<script>
import FilterListe from './components/FilterListe';
import FilterFields from './components/FilterFields';
import usersData from './components/Friends.json';

export default {
  data() {
     return {
      friends: usersData,  
      frinds: [
        {
          id: 23,
          name: "George",
          email: "gear@archaiodata.com",
          phone: 247977080,
          truc: "ca marche",
          type : "Feature"
        },
        {
          id: 24,
          name: "Kevin",
          email: "kev@bsa.uk",
          phone: 676318876,
          type : "Artifact"
        },
        {
          id: 25,
          name: "Lora",
          email: "lora@efa.gr",
          truc: "ca marche",
          type : "Artifact"
        }
      ],
      // type by default
      selectedfilter: "Artifact",
   };
  },
  computed: {
    filteredAndSorted(){
     // function to compare names
     function compare(a, b) {
       if (a.name < b.name) return -1;
       if (a.name > b.name) return 1;
       return 0;
     }
      
     return this.friends.filter(user => {
        return user.type.toLowerCase().includes(this.selectedfilter.toLowerCase())
     }).sort(compare)
    }
  },
  methods: {
    testEmit(testid) {
      this.selectedfilter=testid,
      console.log(testid)
    },

    
  },
  name: 'App',
  components: {
    FilterListe,
    FilterFields
  }
  
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
  padding: 1rem;
  text-align: center;
  width: 90%;
  max-width: 40rem;
}
#app h2 {
  font-size: 2rem;
  border-bottom: 4px solid #ccc;
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
}
</style>
