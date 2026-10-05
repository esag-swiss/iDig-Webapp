<template>
  <div>
    <q-list bordered separator dense>
      <TheExportTemplateModalTemplateListItem
        v-for="template in templates"
        :key="template.id"
        :label="
          isDefaultTemplate(template)
            ? t('app.export_default_template')
            : template.name
        "
        :active="template.id === currentId"
        @select="emit('select', template.id)"
      />
    </q-list>
    <div class="q-mt-sm q-gutter-xs">
      <BaseButton
        variant="primary"
        size="sm"
        icon="add"
        :label="t('app.export_new')"
        @click="emit('add')"
      />
      <BaseButton
        variant="primary"
        size="sm"
        icon="content_copy"
        :label="t('app.export_duplicate')"
        :disabled="!currentId"
        @click="emit('duplicate')"
      />
      <BaseButton
        variant="danger"
        size="sm"
        icon="delete"
        :label="t('app.export_delete')"
        :disabled="!canDelete"
        @click="emit('delete')"
      />
    </div>
    <div class="q-mt-sm q-gutter-xs">
      <BaseButton
        variant="outline"
        size="sm"
        icon="upload"
        :label="t('app.export_import')"
        @click="importInput.click()"
      />
      <BaseButton
        variant="outline"
        size="sm"
        icon="download"
        :label="t('app.export_export')"
        @click="emit('export')"
      />
      <input
        ref="importInput"
        type="file"
        accept="application/json,.json"
        hidden
        @change="(event) => emit('import', event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import BaseButton from "@/components/base/BaseButton.vue";
import { isDefaultTemplate } from "@/services/export/exportTemplates";
import TheExportTemplateModalTemplateListItem from "@/components/TheExportTemplateModalTemplateListItem.vue";

defineProps({
  templates: { type: Array, required: true },
  currentId: { type: String, default: null },
  canDelete: { type: Boolean, default: false },
});

const emit = defineEmits([
  "select",
  "add",
  "duplicate",
  "delete",
  "import",
  "export",
]);

const { t } = useI18n();

const importInput = ref(null);
</script>
