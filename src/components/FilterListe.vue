<template>
  <h2>Types</h2>
    <p class="buttons" v-for="(type, index) in types" :key="index"  >
        <button @click="check(type.type)" :key="index" class="button is-light">{{ type.type }}</button>
    </p>
</template>

<script>
// import headersData from "../components/Friends.Preferences.json";
import preferencesData from "../components/ΒΘ West 2013.Preferences.json";

export default {
  data() {
    return {
      types: preferencesData.types
    };
  },
  methods: {
    check: function(e) {
      // console.log(e),
      // reçoit du @change et renvoie au parent
      this.$emit('test-emit', e);
    },
  }
};
</script>
<style>

</style>