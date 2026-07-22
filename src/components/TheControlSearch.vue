<template>
  <div>
    <BaseToggle
      :model-value="searchMode"
      toggle-color="secondary"
      class="mb-1"
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

    <div v-if="searchMode === 'expert'" class="row justify-end q-mt-xs">
      <BaseButton
        :label="$t('app.search_expert_help_button')"
        icon="help_outline"
        icon-size="sm"
        class="text-secondary"
        data-test="expert-help-button"
        @click="isExpertHelpModalOpen = true"
      />
    </div>

    <BaseModal v-model="isExpertHelpModalOpen" data-test="expert-help-modal">
      <template #title>{{ $t("app.search_expert_help_title") }}</template>
      <template #content>
        <TheControlSearchExpertHelp />
      </template>
    </BaseModal>
  </div>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useDataStore } from "@/stores/data";
import { validateExpression } from "@/services/expertSearch";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseToggle from "@/components/base/BaseToggle.vue";
import TheControlSearchExpertHelp from "@/components/TheControlSearchExpertHelp.vue";

export default {
  name: "TheControlSearch",
  components: { BaseButton, BaseModal, BaseToggle, TheControlSearchExpertHelp },
  data() {
    return {
      searchTextValue: "",
      expertError: null,
      isExpertHelpModalOpen: false,
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
