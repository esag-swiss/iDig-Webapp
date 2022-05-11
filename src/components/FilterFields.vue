<template>
  <h2>Fields for {{selectedFilter}}</h2>
    <ul v-for="type in filteredAndSorted" :key="type"  >
      <li>{{ type.group }}</li>
        <button v-for="field in type.fields" :key="field" @click="check(field.field)">{{ field.field }}</button>
    </ul> 
</template>
<script>
import preferencesData from "../components/ΒΘ West 2013.Preferences.json";

export default {
  data() {
    return {
      // fields: preferencesData.types[1].groups[0],
      fields: preferencesData.types,
    };
  },
  computed: {
    filteredAndSorted(){
     return this.fields.filter(field => {
      return field.type.includes(this.selectedFilter)
     })[0].groups
    }
  },
  methods: {
    check(e) {
      // console.log(e),
      // reçoit du @change et renvoie au parent
      this.$emit('test-emit', e);
    },
    //on peut aussi ecrire la méthode ainsi
    check2: function(e) {
      console.log(e)
    },
  },
  props: {
    selectedFilter: {
      type: String,
      required: false
    },   
  },
 };
</script>
<style>

</style>