<template>
  <div>
    <q-tooltip class="bg-accent"
      >Search is case and diacritics sensitive only when search terms are
      enclosed within double quotation marks.<br />Operators AND and OR are
      accepted but can't be combined.<br />You can search within a specific
      field by mentioning the label in the current language before the colon.<br />
      <i>e.g.</i>: 'Titre:"Fusaï" OR spindle'.
    </q-tooltip>
    <q-input
      v-model="searchTextValue"
      square
      filled
      dense
      :clearable="searchText !== null"
      :placeholder="$t('app.search_placeholder')"
      @clear="setSearchText('')"
      @update:model-value="setSearchText(searchTextValue)"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useDataStore } from "@/stores/data";

export default {
  name: "TheControlSearch",
  data() {
    return {
      searchTextValue: "",
    };
  },
  computed: {
    ...mapState(useDataStore, ["searchText"]),
  },
  methods: {
    ...mapActions(useDataStore, ["setSearchText"]),
  },
};
</script>

<style scoped></style>
