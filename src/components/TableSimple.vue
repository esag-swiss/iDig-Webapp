<template>
  <thead>
    <tr>
      <th v-for="group in filteredField" :key="group">{{group.field}}</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="row in filtered" :key="row.id">
      <td v-for="group in filteredField" :key="group">{{row[group.field]}}</td>
    </tr>
  </tbody>
</template>

<script>
import trenchData from "@/data/AMA21-S24.json";
import preferencesData from "@/data/AMA21-S24.Preferences.json";

export default {
  data() {
    return {
      trenchdata: trenchData,
      // headers: preferencesData.fields,
      fields: preferencesData.types,
    };
  },
  props: {
    selectedFilter: {
      type: String,
      required: false
    },   
  },
  computed: {
    filteredField(){
     return this.fields.filter(x => {
      return x.type.includes(this.selectedFilter)
     })[0].groups[0].fields
    },
    filtered(){
     return this.trenchdata.filter(object => {
        return object.Type.includes(this.selectedFilter)
     })
    }
    
  },

};
</script>