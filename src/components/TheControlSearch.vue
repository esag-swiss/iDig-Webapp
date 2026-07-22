<template>
  <div>
    <q-btn-toggle
      :model-value="searchMode"
      spread
      no-caps
      dense
      unelevated
      toggle-color="primary"
      color="white"
      text-color="primary"
      size="sm"
      class="mb-1 border"
      :options="[
        { label: $t('app.search_mode_basic'), value: 'basic' },
        { label: $t('app.search_mode_expert'), value: 'expert' },
      ]"
      @update:model-value="onModeChange"
    />

    <q-tooltip v-if="searchMode === 'basic'" class="bg-accent"
      >Search is case and diacritics sensitive only when search terms are
      enclosed within double quotation marks.<br />Operators AND and OR are
      accepted but can't be combined.<br />You can search within a specific
      field by mentioning the label in the current language before the colon.<br />
      <i>e.g.</i>: 'Titre:"Fusaï" OR spindle'.
    </q-tooltip>
    <q-tooltip v-else class="bg-accent">
      {{ $t("app.search_expert_help") }}
    </q-tooltip>

    <q-input
      v-model="searchTextValue"
      square
      filled
      dense
      :clearable="searchText !== null"
      :placeholder="
        searchMode === 'expert'
          ? $t('app.search_expert_placeholder')
          : $t('app.search_placeholder')
      "
      :error="expertError !== null"
      :error-message="expertError"
      @clear="onClear"
      @update:model-value="onInput"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useDataStore } from "@/stores/data";
import { validateExpression } from "@/services/expertSearch";

export default {
  name: "TheControlSearch",
  data() {
    return {
      searchTextValue: "",
      expertError: null,
    };
  },
  computed: {
    ...mapState(useDataStore, ["searchText", "searchMode"]),
  },
  methods: {
    ...mapActions(useDataStore, ["setSearchText", "setSearchMode"]),
    onInput(value) {
      if (this.searchMode === "expert") {
        const { valid, error } = validateExpression(value ?? "");
        if (!valid) {
          this.expertError = `${this.$t("app.search_expert_error")} ${error}`;
          return;
        }
        this.expertError = null;
      }
      this.setSearchText(value ?? "");
    },
    onClear() {
      this.expertError = null;
      this.setSearchText("");
    },
    onModeChange(mode) {
      this.setSearchMode(mode);
      this.searchTextValue = "";
      this.expertError = null;
      this.setSearchText("");
    },
  },
};
</script>

<style scoped></style>
