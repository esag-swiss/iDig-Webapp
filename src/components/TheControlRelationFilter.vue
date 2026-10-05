<template>
  <div class="p-1 m-1 border-0 d-flex align-items-center justify-content-between">
    <BaseTitle :label="$t('app.relation_filter_title')">
      <q-tooltip class="bg-accent">{{ $t("app.relation_filter_tip") }}</q-tooltip>
    </BaseTitle>
    <BaseButton
      v-if="relation || property || value"
      icon="close"
      icon-size="sm"
      :aria-label="$t('app.relation_filter_reset')"
      @click="resetFilter"
    >
      <q-tooltip class="bg-accent">{{ $t("app.relation_filter_reset") }}</q-tooltip>
    </BaseButton>
  </div>
  <BaseSelect v-model="relation" :options="relationOptions" @update:model-value="emitFilter" />
  <BaseSelect v-model="property" :options="propertyOptions" @update:model-value="emitFilter" />
  <BaseInput
    v-model="value"
    :placeholder="$t('app.relation_filter_value')"
    @update:model-value="emitFilter"
  />
</template>

<script setup>
import { computed, ref } from "vue";
import { useDataStore } from "@/stores/data";
import { useAppStore } from "@/stores/app";
import { fieldsSchema } from "@/assets/nativeFields";
import { RELATION_FIELDS } from "@/services/relationResolver";
import { t } from "@/i18n";
import BaseTitle from "@/components/base/BaseTitle.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import BaseInput from "@/components/base/BaseInput.vue";

const dataStore = useDataStore();
const appStore = useAppStore();

const relation = ref("");
const property = ref("");
const value = ref("");

function relationLabel(field) {
  return fieldsSchema[field]?.labels?.[appStore.lang] ?? field;
}

const relationOptions = computed(() => {
  const options = [...RELATION_FIELDS]
    .sort((a, b) => relationLabel(a).localeCompare(relationLabel(b)))
    .map((field) => ({ value: field, label: relationLabel(field) }));
  return [
    { value: "", label: t("app.relation_filter_relation"), disabled: true },
    ...options,
  ];
});

const propertyOptions = computed(() => {
  const options = Object.entries(dataStore.projectPreferencesFieldsWithTranslation)
    .sort(([keyA, labelA], [keyB, labelB]) =>
      (labelA || keyA).localeCompare(labelB || keyB),
    )
    .map(([key, label]) => ({ value: key, label: label || key }));
  return [
    { value: "", label: t("app.relation_filter_property"), disabled: true },
    ...options,
  ];
});

function emitFilter() {
  if (!relation.value || !property.value || !value.value) {
    dataStore.setRelationFilter(null);
    return;
  }

  dataStore.setRelationFilter({
    relation: relation.value,
    property: property.value,
    value: value.value,
  });
}

function resetFilter() {
  relation.value = "";
  property.value = "";
  value.value = "";
  dataStore.setRelationFilter(null);
}
</script>
