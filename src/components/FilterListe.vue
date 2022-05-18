<template>
  <h3>Types</h3>
  <!-- une liste déroulante -->
  <select
    id="dropdown"
    text="Options"
    v-model="selected"
    @change="changeSelectedType"
    class="form-control"
  >
    <option v-for="type in types" :key="type" :value="type.type">
      {{ type.type }}
    </option>
  </select>
</template>

<script>
import preferencesData from "../components/AMA21-S24.Preferences.json";

export default {
  data() {
    return {
      types: preferencesData.types,
      selected: "Artifact", // default type 
    };
  },
  methods: {
    changeSelectedType: function () {
      // reçoit du @change et renvoie au parent
      this.$emit("test-emit", this.selected);
    },
  },
};
</script>
<style>
</style>