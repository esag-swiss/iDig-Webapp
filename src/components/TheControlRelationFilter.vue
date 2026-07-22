<template>
  <div class="p-1 m-1 border-0">
    <h3>{{ $t("app.relation_filter_title") }}</h3>
    <q-tooltip class="bg-accent">{{ $t("app.relation_filter_tip") }}</q-tooltip>
  </div>
  <select
    v-model="relation"
    class="form-control form-control-sm mb-1"
    @change="emitFilter"
  >
    <option value="">{{ $t("app.relation_filter_relation") }}</option>
    <option v-for="field in relationFields" :key="field" :value="field">
      {{ relationLabel(field) }}
    </option>
  </select>
  <select
    v-model="property"
    class="form-control form-control-sm mb-1"
    @change="emitFilter"
  >
    <option value="">{{ $t("app.relation_filter_property") }}</option>
    <option
      v-for="(label, key) in projectPreferencesFieldsWithTranslation"
      :key="key"
      :value="key"
    >
      {{ label || key }}
    </option>
  </select>
  <q-input
    v-model="value"
    square
    filled
    dense
    clearable
    :placeholder="$t('app.relation_filter_value')"
    @update:model-value="emitFilter"
    @clear="clearValue"
  />
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useDataStore } from "@/stores/data";
import { useAppStore } from "@/stores/app";
import { fieldsSchema } from "@/assets/nativeFields";
import { RELATION_FIELDS } from "@/services/relationResolver";

export default {
  name: "TheControlRelationFilter",
  data() {
    return {
      relation: "",
      property: "",
      value: "",
    };
  },
  computed: {
    relationFields() {
      return RELATION_FIELDS;
    },
    ...mapState(useAppStore, ["lang"]),
    ...mapState(useDataStore, ["projectPreferencesFieldsWithTranslation"]),
  },
  methods: {
    ...mapActions(useDataStore, ["setRelationFilter"]),
    relationLabel(field) {
      return fieldsSchema[field]?.labels?.[this.lang] ?? field;
    },
    emitFilter() {
      if (this.relation && this.property && this.value?.trim()) {
        this.setRelationFilter({
          relation: this.relation,
          property: this.property,
          value: this.value,
        });
      } else {
        this.setRelationFilter(null);
      }
    },
    clearValue() {
      this.value = "";
      this.emitFilter();
    },
  },
};
</script>

<style scoped></style>
