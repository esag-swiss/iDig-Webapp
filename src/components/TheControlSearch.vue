<template>
  <input
    :value="searchText"
    class="form-control form-control-sm"
    placeholder="Search..."
    @input="(event) => setSearchText(event.target.value)"
  />
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
