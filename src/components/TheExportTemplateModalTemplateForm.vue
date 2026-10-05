<template>
  <div class="q-gutter-y-sm">
    <q-input
      v-if="isDefaultTemplate(template)"
      :model-value="t('app.export_default_template')"
      dense
      outlined
      readonly
      :label="t('app.export_name')"
      :hint="t('app.export_default_template_hint')"
    />
    <q-input
      v-else
      v-model="template.name"
      dense
      outlined
      :label="t('app.export_name')"
    />

    <q-input
      v-model="template.title"
      dense
      outlined
      :label="$t('app.export_title')"
      :hint="$t('app.export_variables', { variables: titleVariables })"
    />
    <q-input
      v-model="template.itemTitle"
      dense
      outlined
      :label="$t('app.export_item_title')"
      :hint="$t('app.export_item_title_hint', { example: itemExample })"
    />

    <div>
      <div class="text-caption text-grey-8">
        {{ $t("app.export_fields") }}
      </div>
      <q-option-group
        v-model="template.fieldsMode"
        dense
        :options="fieldsModeOptions"
      />
    </div>
    <BaseSelect
      v-if="template.fieldsMode === 'custom'"
      v-model="template.fields"
      multiple
      filterable
      :options="fieldOptions"
      :label="$t('app.export_fields_select')"
    />

    <div class="row q-col-gutter-sm items-center">
      <BaseSelect
        v-model="template.sortBy"
        class="col-6"
        filterable
        :options="fieldOptions"
        :label="$t('app.export_sort_by')"
      />
      <q-toggle
        v-model="template.skipEmpty"
        class="col-6"
        dense
        :label="$t('app.export_skip_empty')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseSelect from "@/components/base/BaseSelect.vue";
import { isDefaultTemplate } from "@/services/export/exportTemplates";

defineProps({
  fieldOptions: { type: Array, default: () => [] },
});

const template = defineModel({ type: Object, required: true });

const { t } = useI18n();

const titleVariables = "{project}, {trenches}, {date}, {count}";
const itemExample = "**{Identifier}** - {Title}";

const fieldsModeOptions = computed(() => [
  { label: t("app.export_fields_table"), value: "table" },
  { label: t("app.export_fields_all"), value: "all" },
  { label: t("app.export_fields_custom"), value: "custom" },
]);
</script>
