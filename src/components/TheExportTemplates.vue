<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(value) => $emit('update:modelValue', value)"
  >
    <q-card class="export-templates">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t("app.export_templates") }}</div>
        <q-space />
        <q-btn v-close-popup flat round dense icon="close" />
      </q-card-section>

      <q-card-section class="row q-col-gutter-md">
        <!-- Templates list -->
        <div class="col-12 col-md-4">
          <q-list bordered separator dense>
            <q-item
              v-for="template in templates"
              :key="template.id"
              clickable
              :active="template.id === currentId"
              active-class="bg-teal-1 text-weight-bold"
              @click="currentId = template.id"
            >
              <q-item-section>{{ template.name }}</q-item-section>
              <q-item-section side class="text-caption">
                {{ layoutLabel(template.layout) }}
              </q-item-section>
            </q-item>
          </q-list>
          <div class="q-mt-sm q-gutter-xs">
            <q-btn
              size="sm"
              color="secondary"
              icon="add"
              :label="$t('app.export_new')"
              @click="addTemplate()"
            />
            <q-btn
              size="sm"
              color="secondary"
              icon="content_copy"
              :label="$t('app.export_duplicate')"
              :disable="!current"
              @click="addTemplate(current)"
            />
            <q-btn
              size="sm"
              color="negative"
              icon="delete"
              :label="$t('app.export_delete')"
              :disable="templates.length < 2"
              @click="deleteTemplate()"
            />
          </div>
          <div class="q-mt-sm q-gutter-xs">
            <q-btn
              size="sm"
              outline
              color="secondary"
              icon="upload"
              :label="$t('app.export_import')"
              @click="$refs.importInput.click()"
            />
            <q-btn
              size="sm"
              outline
              color="secondary"
              icon="download"
              :label="$t('app.export_export')"
              @click="downloadTemplates()"
            />
            <q-btn
              size="sm"
              flat
              color="grey-8"
              icon="restart_alt"
              :label="$t('app.export_reset')"
              @click="resetTemplates()"
            />
            <input
              ref="importInput"
              type="file"
              accept="application/json,.json"
              hidden
              @change="importTemplates"
            />
          </div>
        </div>

        <!-- Selected template -->
        <div v-if="current" class="col-12 col-md-8 q-gutter-y-sm">
          <q-input
            v-model="current.name"
            dense
            outlined
            :label="$t('app.export_name')"
          />

          <div>
            <div class="text-caption text-grey-8">
              {{ $t("app.export_layout") }}
            </div>
            <q-option-group
              v-model="current.layout"
              inline
              dense
              :options="layoutOptions"
            />
          </div>

          <q-input
            v-model="current.title"
            dense
            outlined
            :label="$t('app.export_title')"
            :hint="$t('app.export_variables', { variables: titleVariables })"
          />
          <q-input
            v-if="current.layout === 'catalogue'"
            v-model="current.itemTitle"
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
              v-model="current.fieldsMode"
              dense
              :options="fieldsModeOptions"
            />
          </div>
          <q-select
            v-if="current.fieldsMode === 'custom'"
            v-model="current.fields"
            dense
            outlined
            multiple
            use-chips
            use-input
            emit-value
            map-options
            input-debounce="0"
            :options="filteredFieldOptions"
            :label="$t('app.export_fields_select')"
            @filter="filterFields"
          />

          <div class="row q-col-gutter-sm items-center">
            <q-select
              v-model="current.sortBy"
              class="col-6"
              dense
              outlined
              emit-value
              map-options
              use-input
              input-debounce="0"
              :options="filteredFieldOptions"
              :label="$t('app.export_sort_by')"
              @filter="filterFields"
            />
            <q-toggle
              v-if="current.layout === 'catalogue'"
              v-model="current.skipEmpty"
              class="col-6"
              dense
              :label="$t('app.export_skip_empty')"
            />
          </div>

          <q-separator />
          <div class="text-subtitle2">{{ $t("app.export_word_format") }}</div>
          <div class="row q-col-gutter-sm">
            <q-select
              v-model="current.docx.orientation"
              class="col-6 col-sm-4"
              dense
              outlined
              emit-value
              map-options
              :options="orientationOptions"
              :label="$t('app.export_orientation')"
            />
            <q-select
              v-model="current.docx.font"
              class="col-6 col-sm-4"
              dense
              outlined
              :options="fonts"
              :label="$t('app.export_font')"
            />
            <q-input
              v-model.number="current.docx.fontSize"
              class="col-6 col-sm-4"
              dense
              outlined
              type="number"
              min="6"
              max="24"
              :label="$t('app.export_font_size')"
            />
            <q-select
              v-model="current.docx.pageBreak"
              class="col-6 col-sm-4"
              dense
              outlined
              emit-value
              map-options
              :options="pageBreakOptions"
              :label="$t('app.export_page_break')"
            />
            <q-input
              v-model="current.docx.accentColor"
              class="col-6 col-sm-4"
              dense
              outlined
              :label="$t('app.export_accent_color')"
            >
              <template #prepend>
                <div
                  class="color-swatch"
                  :style="{ background: current.docx.accentColor }"
                />
              </template>
              <template #append>
                <q-icon name="colorize" class="cursor-pointer">
                  <q-popup-proxy>
                    <q-color
                      v-model="current.docx.accentColor"
                      no-header-tabs
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { Notify } from "quasar";
import {
  DEFAULT_TEMPLATES,
  loadTemplates,
  newTemplateId,
  normalizeTemplate,
  parseTemplatesFile,
  saveTemplates,
} from "@/services/export/exportTemplates";

export default {
  name: "TheExportTemplates",
  props: {
    modelValue: { type: Boolean, default: false },
    selectedId: { type: String, default: null },
    fieldOptions: { type: Array, default: () => [] },
  },
  emits: ["update:modelValue", "saved"],

  data() {
    return {
      templates: [],
      currentId: null,
      fieldFilter: "",
      fonts: [
        "Calibri",
        "Arial",
        "Helvetica",
        "Times New Roman",
        "Georgia",
        "Garamond",
        "Cambria",
      ],
      titleVariables: "{project}, {trenches}, {date}, {count}",
      itemExample: "{Identifier} – {Title}",
    };
  },

  computed: {
    current() {
      return this.templates.find((t) => t.id === this.currentId) ?? null;
    },
    filteredFieldOptions() {
      const needle = this.fieldFilter.toLowerCase();
      return this.fieldOptions.filter((option) =>
        option.label.toLowerCase().includes(needle),
      );
    },
    layoutOptions() {
      return [
        { label: this.$t("app.export_layout_catalogue"), value: "catalogue" },
        { label: this.$t("app.export_layout_listing"), value: "listing" },
      ];
    },
    fieldsModeOptions() {
      return [
        { label: this.$t("app.export_fields_table"), value: "table" },
        { label: this.$t("app.export_fields_all"), value: "all" },
        { label: this.$t("app.export_fields_custom"), value: "custom" },
      ];
    },
    orientationOptions() {
      return [
        { label: this.$t("app.export_portrait"), value: "portrait" },
        { label: this.$t("app.export_landscape"), value: "landscape" },
      ];
    },
    pageBreakOptions() {
      return [
        { label: this.$t("app.export_page_break_none"), value: "none" },
        { label: this.$t("app.export_page_break_group"), value: "group" },
        { label: this.$t("app.export_page_break_item"), value: "item" },
      ];
    },
  },

  watch: {
    modelValue: {
      handler(isOpen) {
        if (isOpen) {
          this.templates = loadTemplates();
          this.currentId =
            this.templates.find((t) => t.id === this.selectedId)?.id ??
            this.templates[0]?.id;
        }
      },
      immediate: true,
    },
    // Every change is saved right away: there is no "save" button to forget.
    templates: {
      handler(templates) {
        if (this.modelValue && templates.length > 0) {
          saveTemplates(templates);
          this.$emit("saved", templates, this.currentId);
        }
      },
      deep: true,
    },
    currentId(id) {
      this.$emit("saved", this.templates, id);
    },
  },

  methods: {
    layoutLabel(layout) {
      return layout === "catalogue" ? "Catalogue" : "Listing";
    },
    filterFields(value, update) {
      update(() => {
        this.fieldFilter = value;
      });
    },
    addTemplate(source) {
      const template = normalizeTemplate({
        ...(source
          ? JSON.parse(JSON.stringify(source))
          : DEFAULT_TEMPLATES.find((t) => t.layout === "listing")),
        id: newTemplateId(),
        name: source
          ? `${source.name} (${this.$t("app.export_copy")})`
          : this.$t("app.export_new"),
      });
      this.templates.push(template);
      this.currentId = template.id;
    },
    deleteTemplate() {
      const index = this.templates.findIndex((t) => t.id === this.currentId);
      this.templates.splice(index, 1);
      this.currentId = this.templates[Math.max(0, index - 1)]?.id;
    },
    resetTemplates() {
      this.templates = DEFAULT_TEMPLATES.map(normalizeTemplate);
      this.currentId = this.templates[0].id;
    },
    downloadTemplates() {
      const blob = new Blob([JSON.stringify(this.templates, null, 2)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "idig-export-templates.json";
      link.click();
      URL.revokeObjectURL(link.href);
    },
    async importTemplates(event) {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) {
        return;
      }
      try {
        const imported = parseTemplatesFile(await file.text());
        this.templates.push(...imported);
        this.currentId = imported[0].id;
      } catch (error) {
        console.error("Export templates import failed:", error);
        Notify.create({
          type: "negative",
          message: this.$t("app.export_import_failed"),
        });
      }
    },
  },
};
</script>

<style scoped>
.export-templates {
  width: 900px;
  max-width: 95vw;
}
.color-swatch {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
