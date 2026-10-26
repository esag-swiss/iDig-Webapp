<template>
  <div class="container-fluid px-1 q-gutter-sm">
    <h3>Export</h3>
    <q-btn
      align="left"
      size="10px"
      padding="2px 5px"
      color="secondary"
      label=".json"
      @click="exportFile('json')"
      ><q-tooltip class="bg-accent"
        >items from selected trenches with all non empty fields as .json
        file</q-tooltip
      ></q-btn
    >
    <q-btn
      align="left"
      size="10px"
      padding="2px 5px"
      color="secondary"
      label=".tab"
      @click="exportFile('tab')"
      ><q-tooltip class="bg-accent"
        >items of selected type with all fields use in the set of data as .tab
        file</q-tooltip
      ></q-btn
    >
    <q-btn
      align="left"
      size="10px"
      padding="2px 5px"
      color="secondary"
      label="Geojson"
      @click="exportFile('geojson')"
      ><q-tooltip class="bg-accent"
        >all geolocalized items from selected trenches</q-tooltip
      ></q-btn
    >

    <div class="row items-center no-wrap q-mt-sm">
      <q-select
        v-model="templateId"
        class="col"
        dense
        outlined
        options-dense
        emit-value
        map-options
        :options="templateOptions"
        :label="$t('app.export_template')"
      />
      <q-btn
        flat
        round
        dense
        size="sm"
        icon="tune"
        :aria-label="$t('app.export_templates')"
        @click="isTemplatesDialogOpen = true"
        ><q-tooltip class="bg-accent">{{
          $t("app.export_templates")
        }}</q-tooltip></q-btn
      >
    </div>
    <q-toggle
      v-model="exportAllTypes"
      dense
      size="sm"
      :label="$t('app.export_all_types')"
      ><q-tooltip class="bg-accent">{{
        $t("app.export_all_types_tip")
      }}</q-tooltip></q-toggle
    >
    <div>
      <q-btn
        v-for="format in documentFormats"
        :key="format"
        align="left"
        size="10px"
        padding="2px 5px"
        class="q-mr-xs"
        color="secondary"
        :label="'.' + format"
        :loading="exportingFormat === format"
        :disable="!selectedTemplate"
        @click="exportDocument(format)"
        ><q-tooltip class="bg-accent">{{
          $t("app.export_" + format + "_tip")
        }}</q-tooltip></q-btn
      >
    </div>

    <TheExportTemplates
      v-model="isTemplatesDialogOpen"
      :selected-id="templateId"
      :field-options="fieldOptions"
      @saved="onTemplatesSaved"
    />
  </div>
</template>
<script>
import { geoSerializedToGeojson } from "@/services/json2geojson";
import { mapState } from "pinia";
import { Notify } from "quasar";
import { useDataStore } from "@/stores/data";
import { useAppStore } from "@/stores/app";
import { fieldsSchema } from "@/assets/nativeFields";
import TheExportTemplates from "@/components/TheExportTemplates.vue";
import { loadTemplates } from "@/services/export/exportTemplates";
import {
  buildExportModel,
  exportFileName,
  fieldLabel,
} from "@/services/export/exportModel";
import { toMarkdown } from "@/services/export/markdownExport";

const TEMPLATE_ID_KEY = "exportTemplateId";

function initialTemplateId(templates) {
  let storedId = null;
  try {
    storedId = localStorage.getItem(TEMPLATE_ID_KEY);
  } catch {
    // Remembering the last template is only a convenience.
  }
  return templates.some((t) => t.id === storedId) ? storedId : templates[0]?.id;
}

export default {
  name: "TheControlExport",
  components: { TheExportTemplates },

  data() {
    const templates = loadTemplates();
    return {
      fileData: "",
      fileName: "",
      documentFormats: ["docx", "xlsx", "md"],
      templates,
      templateId: initialTemplateId(templates),
      exportAllTypes: false,
      exportingFormat: null,
      isTemplatesDialogOpen: false,
    };
  },
  computed: {
    ...mapState(useAppStore, ["project", "lang"]),
    ...mapState(useDataStore, [
      "checkedTrenchesItems",
      "checkedTrenchesItemsSelectedType",
      "checkedTrenchesItemsSelectedTypeAndSearched",
      "tableFilteredCheckedTrenchesItems",
      "checkedTrenchesNames",
      "checkedFieldNames",
      "selectedType",
      "projectPreferencesTypes",
      "projectPreferencesTypesTranslation",
      "projectPreferencesTypesTranslationPlurals",
      "projectPreferencesFieldsWithTranslation",
    ]),
    selectedTemplate() {
      return (
        this.templates.find((t) => t.id === this.templateId) ??
        this.templates[0] ??
        null
      );
    },
    templateOptions() {
      return this.templates.map((t) => ({ label: t.name, value: t.id }));
    },
    exportContext() {
      return {
        project: this.project,
        trenchNames: this.checkedTrenchesNames,
        lang: this.lang,
        fieldLabels: this.projectPreferencesFieldsWithTranslation,
        typeLabels: this.projectPreferencesTypesTranslation ?? {},
        typePluralLabels: this.projectPreferencesTypesTranslationPlurals ?? {},
        typeOrder: (this.projectPreferencesTypes ?? []).flatMap((t) =>
          [].concat(t.type),
        ),
        tableFields: this.checkedFieldNames,
        itemsByUuid: new Map(
          this.checkedTrenchesItems.map((item) => [item.IdentifierUUID, item]),
        ),
      };
    },
    fieldOptions() {
      const fields = new Set([
        ...Object.keys(fieldsSchema),
        ...Object.keys(this.projectPreferencesFieldsWithTranslation ?? {}),
        "Trench",
      ]);
      return [...fields]
        .map((field) => {
          const label = fieldLabel(field, this.exportContext);
          return {
            value: field,
            label: label === field ? field : `${label} (${field})`,
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    // Current table view (type, search, header filters) unless all types are
    // requested.
    exportItems() {
      if (this.exportAllTypes) {
        return this.checkedTrenchesItems;
      }
      return (
        this.tableFilteredCheckedTrenchesItems ??
        this.checkedTrenchesItemsSelectedTypeAndSearched
      );
    },
  },
  watch: {
    templateId(id) {
      try {
        localStorage.setItem(TEMPLATE_ID_KEY, id);
      } catch {
        // Remembering the last template is only a convenience.
      }
    },
  },
  methods: {
    onTemplatesSaved(templates, currentId) {
      this.templates = templates.map((t) => ({ ...t, docx: { ...t.docx } }));
      if (currentId) {
        this.templateId = currentId;
      }
    },

    async exportDocument(format) {
      const template = this.selectedTemplate;
      if (this.exportItems.length === 0) {
        Notify.create({
          type: "warning",
          message: this.$t("app.export_no_items"),
        });
        return;
      }

      this.exportingFormat = format;
      try {
        const model = buildExportModel(
          this.exportItems,
          template,
          this.exportContext,
        );
        let blob;
        if (format === "md") {
          blob = new Blob([toMarkdown(model)], {
            type: "text/markdown;charset=utf-8",
          });
        } else if (format === "xlsx") {
          const { toXlsx } = await import("@/services/export/xlsxExport");
          blob = await toXlsx(model, template);
        } else {
          const { toDocx } = await import("@/services/export/docxExport");
          blob = await toDocx(model, template);
        }

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = exportFileName(model, format);
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 0);
      } catch (error) {
        console.error(`Export ${format} failed:`, error);
        Notify.create({
          type: "negative",
          message: this.$t("app.export_failed"),
        });
      } finally {
        this.exportingFormat = null;
      }
    },

    exportFile: function (fileType) {
      if (fileType === "tab") {
        this.fileName = this.selectedType;
        const items = this.checkedTrenchesItems;
        const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
        const uniqueKeys = new Set();

        items.forEach((item) => {
          Object.keys(item).forEach((key) => uniqueKeys.add(key));
        });
        const header = Array.from(uniqueKeys);

        this.fileData = [
          header.join("\t"),
          ...items.map((row) =>
            header
              .map((fieldName) => JSON.stringify(row[fieldName], replacer))
              .join("\t"),
          ),
        ].join("\r\n");
      } else if (fileType === "json") {
        this.fileName = this.selectedType;
        this.fileData = JSON.stringify(this.checkedTrenchesItems);
      } else if (fileType === "geojson") {
        this.fileName = "Trenches";
        this.fileData = JSON.stringify(
          geoSerializedToGeojson(this.checkedTrenchesItems),
        );
      }

      const blob = new Blob([this.fileData], { type: "text/plain" });
      const e = document.createEvent("MouseEvents"),
        a = document.createElement("a");
      a.download = this.fileName + "." + fileType;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
      e.initEvent(
        "click",
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null,
      );
      a.dispatchEvent(e);
    },
  },
};
</script>
<style></style>
