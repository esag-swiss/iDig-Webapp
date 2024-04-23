<template>
  <div>
    <q-tooltip class="bg-accent"
      >Search is case and diacritics sensitive only when search terms are
      enclosed within double quotation marks.<br />Operators AND and OR are
      accepted but can't be combined.<br />You can search within a specific
      field by mentioning the label in the current language before the colon.<br />
      <i>e.g.</i>: 'Titre:"Fusaï" OR spindle'.
    </q-tooltip>
    <input
      :value="searchText"
      class="form-control form-control-sm"
      placeholder="Search..."
      @keyup.enter="(event) => setSearchText(event.target.value)"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useDataStore } from "@/stores/data";

export default {
  name: "TheControlSearch",
  computed: {
    ...mapState(useDataStore, ["searchText"]),
  },
  methods: {
    ...mapActions(useDataStore, ["setSearchText"]),
  },
};
</script>

<style scoped></style>
