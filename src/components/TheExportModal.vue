<template>
  <BaseModal
    v-model="isOpen"
    :title="t('app.export_data')"
    :close-label="t('app.close')"
    width="680px"
  >
    <section class="q-mb-md">
      <div class="text-subtitle2 q-mb-xs">1. {{ t("app.export_scope") }}</div>
      <q-option-group v-model="scope" dense :options="scopeOptions" />
    </section>

    <section class="q-mb-md">
      <div class="text-subtitle2 q-mb-xs">2. {{ t("app.export_format") }}</div>
      <div v-for="group in formatGroups" :key="group.label" class="q-mb-sm">
        <div class="text-caption text-grey-7 q-mb-xs">{{ group.label }}</div>
        <div class="export-formats">
          <BaseOptionCard
            v-for="option in group.formats"
            :key="option.value"
            :icon="option.icon"
            :label="option.label"
            :description="option.description"
            :selected="format === option.value"
            @select="format = option.value"
          />
        </div>
      </div>
    </section>

    <section v-if="isDocumentFormat">
      <div class="text-subtitle2 q-mb-xs">
        3. {{ t("app.export_template") }}
      </div>
      <div class="row items-center no-wrap q-gutter-sm">
        <BaseSelect
          v-model="templateId"
          class="col"
          :options="templateOptions"
          :label="t('app.export_template')"
        />
        <BaseButton
          class="text-secondary"
          icon="tune"
          :label="t('app.export_manage_templates')"
          @click="isTemplatesOpen = true"
        />
      </div>
      <div class="text-caption text-grey-7 q-mt-xs">
        {{ templateSummary }}
      </div>
    </section>

    <template #actions>
      <span
        v-if="exportItems.length === 0"
        class="text-caption text-negative q-mr-auto"
        >{{ t("app.export_no_items") }}</span
      >
      <BaseButton
        class="q-mr-md"
        :label="t('app.cancel')"
        @click="isOpen = false"
      />
      <BaseButton
        variant="primary"
        icon="download"
        :label="t('app.export_submit')"
        :loading="isExporting"
        :disabled="!canExport"
        @click="exportData()"
      />
    </template>
  </BaseModal>

  <TheExportTemplateModal
    v-model="isTemplatesOpen"
    :selected-id="templateId"
    :field-options="fieldOptions"
    @saved="onTemplatesSaved"
  />
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { Notify } from "quasar";
import { useDataStore } from "@/stores/data";
import { useAppStore } from "@/stores/app";
import { fieldsSchema } from "@/assets/nativeFields";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseOptionCard from "@/components/base/BaseOptionCard.vue";
import BaseSelect from "@/components/base/BaseSelect.vue";
import TheExportTemplateModal from "@/components/TheExportTemplateModal.vue";
import {
  isDefaultTemplate,
  loadTemplates,
  loadSelectedTemplateId,
  saveSelectedTemplateId,
} from "@/services/export/exportTemplates";
import {
  buildExportModel,
  exportFileName,
  fieldLabel,
} from "@/services/export/exportModel";
import { toMarkdown } from "@/services/export/markdownExport";
import { toGeojson, toJson, toTab } from "@/services/export/rawExport";
import { downloadBlob } from "@/services/export/download";

const DOCUMENT_FORMATS = ["docx", "xlsx", "md"];
const RAW_EXPORTERS = { json: toJson, tab: toTab, geojson: toGeojson };

const isOpen = defineModel({ type: Boolean, required: true });

const { t } = useI18n();
const { project, lang } = storeToRefs(useAppStore());
const {
  checkedTrenchesItems,
  checkedTrenchesItemsSelectedTypeAndSearched,
  tableFilteredCheckedTrenchesItems,
  checkedTrenchesNames,
  checkedFieldNames,
  projectPreferencesTypes,
  projectPreferencesTypesTranslation,
  projectPreferencesTypesTranslationPlurals,
  projectPreferencesFieldsWithTranslation,
} = storeToRefs(useDataStore());

const templates = ref(loadTemplates());
const templateId = ref(loadSelectedTemplateId(templates.value));
const scope = ref("view");
const format = ref("docx");
const isExporting = ref(false);
const isTemplatesOpen = ref(false);

watch(templateId, saveSelectedTemplateId);

const viewItems = computed(
  () =>
    tableFilteredCheckedTrenchesItems.value ??
    checkedTrenchesItemsSelectedTypeAndSearched.value,
);

const exportItems = computed(() =>
  scope.value === "all" ? checkedTrenchesItems.value : viewItems.value,
);

const scopeOptions = computed(() => {
  const label = (key, items) => t(key, { count: items.length }, items.length);
  return [
    { value: "view", label: label("app.export_scope_view", viewItems.value) },
    {
      value: "all",
      label: label("app.export_scope_all", checkedTrenchesItems.value),
    },
  ];
});

const formatGroups = computed(() => [
  {
    label: t("app.export_documents"),
    formats: [
      {
        value: "docx",
        label: "Word (.docx)",
        icon: "description",
        description: t("app.export_docx_tip"),
      },
      {
        value: "xlsx",
        label: "Excel (.xlsx)",
        icon: "table_chart",
        description: t("app.export_xlsx_tip"),
      },
      {
        value: "md",
        label: "Markdown (.md)",
        icon: "notes",
        description: t("app.export_md_tip"),
      },
    ],
  },
  {
    label: t("app.export_raw_data"),
    formats: [
      {
        value: "json",
        label: "JSON (.json)",
        icon: "data_object",
        description: t("app.export_json_tip"),
      },
      {
        value: "tab",
        label: "Tabulations (.tab)",
        icon: "grid_on",
        description: t("app.export_tab_tip"),
      },
      {
        value: "geojson",
        label: "GeoJSON (.geojson)",
        icon: "public",
        description: t("app.export_geojson_tip"),
      },
    ],
  },
]);

const isDocumentFormat = computed(() =>
  DOCUMENT_FORMATS.includes(format.value),
);

const selectedTemplate = computed(
  () =>
    templates.value.find((template) => template.id === templateId.value) ??
    templates.value[0] ??
    null,
);

const templateOptions = computed(() =>
  templates.value.map((template) => ({
    label: isDefaultTemplate(template)
      ? t("app.export_default_template")
      : template.name,
    value: template.id,
  })),
);

const templateSummary = computed(() => {
  if (format.value === "xlsx") {
    return t("app.export_xlsx_summary");
  }
  return t("app.export_catalogue_summary");
});

const canExport = computed(
  () =>
    exportItems.value.length > 0 &&
    (!isDocumentFormat.value || Boolean(selectedTemplate.value)),
);

const exportContext = computed(() => ({
  project: project.value,
  trenchNames: checkedTrenchesNames.value,
  lang: lang.value,
  fieldLabels: projectPreferencesFieldsWithTranslation.value,
  typeLabels: projectPreferencesTypesTranslation.value ?? {},
  typePluralLabels: projectPreferencesTypesTranslationPlurals.value ?? {},
  typeOrder: (projectPreferencesTypes.value ?? []).flatMap((type) =>
    [].concat(type.type),
  ),
  tableFields: checkedFieldNames.value,
  itemsByUuid: new Map(
    checkedTrenchesItems.value.map((item) => [item.IdentifierUUID, item]),
  ),
}));

const fieldOptions = computed(() => {
  const fields = new Set([
    ...Object.keys(fieldsSchema),
    ...Object.keys(projectPreferencesFieldsWithTranslation.value ?? {}),
    "Trench",
  ]);
  return [...fields]
    .map((field) => {
      const label = fieldLabel(field, exportContext.value);
      return {
        value: field,
        label: label === field ? field : `${label} (${field})`,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
});

function onTemplatesSaved(savedTemplates, currentId) {
  templates.value = savedTemplates.map((template) => ({
    ...template,
    fields: [...template.fields],
  }));
  if (currentId) {
    templateId.value = currentId;
  }
}

async function buildDocument() {
  const template = selectedTemplate.value;
  const model = buildExportModel(
    exportItems.value,
    template,
    exportContext.value,
  );
  let blob;
  if (format.value === "md") {
    blob = new Blob([toMarkdown(model)], {
      type: "text/markdown;charset=utf-8",
    });
  } else if (format.value === "xlsx") {
    const { toXlsx } = await import("@/services/export/xlsxExport");
    blob = await toXlsx(model);
  } else {
    const { toDocx } = await import("@/services/export/docxExport");
    blob = await toDocx(model);
  }
  return { blob, fileName: exportFileName(model, format.value) };
}

function buildRawFile() {
  const title = [project.value, checkedTrenchesNames.value.join(", ")]
    .filter(Boolean)
    .join(" - ");
  return {
    blob: RAW_EXPORTERS[format.value](exportItems.value),
    fileName: exportFileName({ title }, format.value),
  };
}

async function exportData() {
  isExporting.value = true;
  try {
    const { blob, fileName } = isDocumentFormat.value
      ? await buildDocument()
      : buildRawFile();
    downloadBlob(blob, fileName);
    isOpen.value = false;
  } catch (error) {
    console.error(`Export ${format.value} failed:`, error);
    Notify.create({ type: "negative", message: t("app.export_failed") });
  } finally {
    isExporting.value = false;
  }
}
</script>

<style scoped>
.export-formats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 8px;
}
</style>
