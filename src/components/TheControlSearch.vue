<template>
  <div>
    <q-tooltip class="bg-accent"
      >Search is not case sensitive. Operators AND, OR are accepted.<br />Search
      in a specific field by mentioning the label in the current language before
      columns.<br />
      <i>e.g.</i>: 'Title: Pyxis AND zigzag'.
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
