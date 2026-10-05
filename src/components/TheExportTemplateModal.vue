<template>
  <BaseModal
    v-model="isOpen"
    :title="t('app.export_templates')"
    :close-label="t('app.close')"
    width="900px"
  >
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <TheExportTemplateModalTemplateList
          :templates="templates"
          :current-id="currentId"
          :can-delete="!isDefaultTemplate(current)"
          @select="(id) => (currentId = id)"
          @add="addTemplate()"
          @duplicate="addTemplate(current)"
          @delete="isDeleteConfirmOpen = true"
          @import="importTemplates"
          @export="downloadTemplates()"
        />
      </div>

      <div v-if="current" class="col-12 col-md-8">
        <TheExportTemplateModalTemplateForm
          v-model="current"
          :field-options="fieldOptions"
        />
      </div>
    </div>
  </BaseModal>

  <BaseModal
    v-model="isDeleteConfirmOpen"
    :title="t('app.export_delete_confirm_title')"
    :close-label="t('app.close')"
    width="420px"
  >
    {{ t("app.export_delete_confirm", { name: templateLabel(current) }) }}
    <template #actions>
      <BaseButton
        class="q-mr-md"
        :label="t('app.cancel')"
        @click="isDeleteConfirmOpen = false"
      />
      <BaseButton
        variant="danger"
        icon="delete"
        :label="t('app.export_delete')"
        @click="deleteTemplate()"
      />
    </template>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { Notify } from "quasar";
import {
  DEFAULT_TEMPLATE,
  isDefaultTemplate,
  loadTemplates,
  newTemplateId,
  normalizeTemplate,
  parseTemplatesFile,
  saveTemplates,
} from "@/services/export/exportTemplates";
import { downloadBlob } from "@/services/export/download";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import TheExportTemplateModalTemplateList from "@/components/TheExportTemplateModalTemplateList.vue";
import TheExportTemplateModalTemplateForm from "@/components/TheExportTemplateModalTemplateForm.vue";

const props = defineProps({
  selectedId: { type: String, default: null },
  fieldOptions: { type: Array, default: () => [] },
});

const emit = defineEmits(["saved"]);

const isOpen = defineModel({ type: Boolean, default: false });

const { t } = useI18n();

const templates = ref([]);
const currentId = ref(null);
const isDeleteConfirmOpen = ref(false);

const current = computed({
  get: () =>
    templates.value.find((template) => template.id === currentId.value) ?? null,
  set: (value) => {
    const index = templates.value.findIndex(
      (template) => template.id === value.id,
    );
    templates.value.splice(index, 1, value);
  },
});

watch(
  isOpen,
  (open) => {
    if (open) {
      templates.value = loadTemplates();
      currentId.value =
        templates.value.find((template) => template.id === props.selectedId)
          ?.id ?? templates.value[0]?.id;
    }
  },
  { immediate: true },
);

watch(
  templates,
  (list) => {
    if (isOpen.value && list.length > 0) {
      saveTemplates(list);
      emit("saved", list, currentId.value);
    }
  },
  { deep: true },
);

watch(currentId, (id) => emit("saved", templates.value, id));

function templateLabel(template) {
  return isDefaultTemplate(template)
    ? t("app.export_default_template")
    : template?.name;
}

function addTemplate(source) {
  const template = normalizeTemplate({
    ...(source ? JSON.parse(JSON.stringify(source)) : DEFAULT_TEMPLATE),
    id: newTemplateId(),
    name: source
      ? `${templateLabel(source)} (${t("app.export_copy")})`
      : t("app.export_new"),
  });
  templates.value.push(template);
  currentId.value = template.id;
}

function deleteTemplate() {
  const index = templates.value.findIndex(
    (template) => template.id === currentId.value,
  );
  templates.value.splice(index, 1);
  currentId.value = templates.value[Math.max(0, index - 1)]?.id;
  isDeleteConfirmOpen.value = false;
}

function downloadTemplates() {
  const blob = new Blob([JSON.stringify(templates.value, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, "idig-export-templates.json");
}

async function importTemplates(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) {
    return;
  }
  try {
    const imported = parseTemplatesFile(await file.text());
    if (imported.length === 0) {
      return;
    }
    templates.value.push(...imported);
    currentId.value = imported[0].id;
  } catch (error) {
    console.error("Export templates import failed:", error);
    Notify.create({ type: "negative", message: t("app.export_import_failed") });
  }
}
</script>
