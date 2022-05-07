<template>
    <ul>
      <li v-for="header in headers" :key="header.id">
        <input type="checkbox" :value="header.type" @change="check(header.type), check2(header.type)">
        {{header.type}}
      </li>
    </ul>
</template>

<script>
import headersData from "../components/Friends.Preferences.json";

export default {
  data() {
    return {
      headers: headersData.types
    };
  },
  methods: {
    check(e) {
      // console.log(e),
      // reçoit du @change et renvoie au parent
      this.$emit('test-emit', e);
    },
    //on peut aussi ecrire la méthoode ainsi
    check2: function(e) {
      console.log(e)
    },
  }
};
</script>