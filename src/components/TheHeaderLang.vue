<template>
  <select
    :value="lang"
    class="m-2 text-light input-header-small"
    @change="(event) => changeLang(event.target.value)"
  >
    <option>fr</option>
    <option>en</option>
    <option>el</option>
    <option>it</option>
    <option>de</option>
  </select>
</template>
<script>
import { lsStoreLang } from "@/services/localStorageManager";
import { mapActions, mapState } from "pinia";
import { useAppStore } from "@/stores/app";

export default {
  name: "TheHeaderLang",
  computed: {
    ...mapState(useAppStore, ["lang"]),
  },
  methods: {
    ...mapActions(useAppStore, ["setLang"]),
    changeLang(lang) {
      this.setLang(lang);
      lsStoreLang();
    },
  },
};
</script>
<style>
.input-header-small {
  background: #212529;
  border: 0px;
  width: 3em;
}
</style>
