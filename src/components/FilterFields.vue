<template>
  <h3 class="mt-1">Fields for {{ selectedFilter }}</h3>
  <ul v-for="type in filteredAndSorted" :key="type" class="list-group">
    <li class="list-group-item">{{ type.group }}</li>
    <!--<input type="checkbox" id="checkbox" v-model="checked"><label for="checkbox">prout . </label>-->
    <!--<button v-for="field in type.fields" :key="field" @click="check(field.field)">{{ field.field }}</button>-->
    <div
      v-for="field in type.fields"
      :key="field"
      @change="check(field.field)"
      class="mt-1"
    >
      <input type="checkbox" id="checkbox" v-model="checked[field.field]" />
      <label for="checkbox">{{ field.field }}</label>
    </div>
  </ul>
</template>

<script>
import preferencesData from "../components/AMA21-S24.Preferences.json";

export default {
  data() {
    return {
      // fields: preferencesData.types[1].groups[0],
      fields: preferencesData.types,
      checked:{}
    };
  },
  computed: {
    filteredAndSorted() {
      return this.fields.filter((field) => {
        return field.type.includes(this.selectedFilter);
      })[0].groups;
    },
  },
  methods: {
    check(e) {
      // console.log(e),
      // reçoit du @change et renvoie au parent
      this.$emit("test-emit", e);
    },
    //on peut aussi ecrire la méthode ainsi
    check2: function (e) {
      console.log(e);
    },
  },
  props: {
    selectedFilter: {
      type: String,
      required: false,
    },
  },
};
</script>

<style>
</style>