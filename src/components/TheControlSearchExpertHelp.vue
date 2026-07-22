<template>
  <div class="expert-help">
    <p class="expert-help__intro">
      {{ $t("app.search_expert_help_intro") }}
    </p>

    <div class="expert-help__section">
      <div class="expert-help__section-title">
        {{ $t("app.search_expert_help_section_basics") }}
      </div>
      <ul class="expert-help__list">
        <li>{{ $t("app.search_expert_help_basics_raw_keys") }}</li>
        <li>{{ $t("app.search_expert_help_basics_case") }}</li>
        <li>{{ $t("app.search_expert_help_basics_syntax") }}</li>
      </ul>
    </div>

    <div class="expert-help__section">
      <div class="expert-help__section-title">
        {{ $t("app.search_expert_help_section_fields") }}
      </div>
      <p class="expert-help__fields-hint">
        {{ $t("app.search_expert_help_fields_hint") }}
      </p>
      <q-input
        v-if="fieldTranslationEntries.length > 0"
        v-model="fieldFilter"
        dense
        filled
        square
        clearable
        :placeholder="$t('app.search_expert_help_fields_filter')"
        class="expert-help__fields-filter"
      />
      <div
        v-if="fieldTranslationEntries.length > 0"
        class="expert-help__fields-table"
      >
        <div
          v-for="entry in filteredFieldTranslationEntries"
          :key="entry.key"
          class="expert-help__fields-row"
        >
          <code class="expert-help__fields-key">{{ entry.key }}</code>
          <q-icon name="arrow_forward" size="xs" />
          <span class="expert-help__fields-label">{{ entry.label }}</span>
        </div>
        <p
          v-if="filteredFieldTranslationEntries.length === 0"
          class="expert-help__fields-empty"
        >
          {{ $t("app.search_expert_help_fields_no_match") }}
        </p>
      </div>
      <p v-else class="expert-help__fields-empty">
        {{ $t("app.search_expert_help_fields_none_loaded") }}
      </p>
    </div>

    <div class="expert-help__section">
      <div class="expert-help__section-title">
        {{ $t("app.search_expert_help_section_examples") }}
      </div>
      <div
        v-for="example in examples"
        :key="example.expression"
        class="expert-help__example"
      >
        <code class="expert-help__code">{{ example.expression }}</code>
        <p class="expert-help__caption">{{ $t(example.captionKey) }}</p>
      </div>
    </div>

    <q-banner class="expert-help__warning" rounded dense>
      <template #avatar>
        <q-icon name="warning_amber" color="warning" />
      </template>
      {{ $t("app.search_expert_help_warning") }}
    </q-banner>

    <a
      class="expert-help__doc-link"
      href="https://jmespath.org/tutorial.html"
      target="_blank"
      rel="noopener noreferrer"
    >
      <q-icon name="open_in_new" size="xs" class="q-mr-xs" />
      {{ $t("app.search_expert_doc_link") }}
    </a>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useDataStore } from "@/stores/data";

const fieldFilter = ref("");

const examples = [
  {
    expression: "[?Type=='Context']",
    captionKey: "app.search_expert_help_example_type",
  },
  {
    expression: "[?contains(Title, 'FK')]",
    captionKey: "app.search_expert_help_example_contains",
  },
  {
    expression: "[?RightsStatus=='All Done']",
    captionKey: "app.search_expert_help_example_status",
  },
  {
    expression: "[?Type=='Artifact' && RightsStatus=='Open']",
    captionKey: "app.search_expert_help_example_and",
  },
  {
    expression: "[?Type=='Context' || Type=='Feature']",
    captionKey: "app.search_expert_help_example_or",
  },
  {
    expression: "[?DateEarliest > '2024-01-01']",
    captionKey: "app.search_expert_help_example_date",
  },
];

const dataStore = useDataStore();

const fieldTranslationEntries = computed(() => {
  return Object.entries(dataStore.projectPreferencesFieldsWithTranslation)
    .filter(([, label]) => label)
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
});

const filteredFieldTranslationEntries = computed(() => {
  const filter = fieldFilter.value?.trim().toLowerCase() ?? "";
  if (filter === "") {
    return fieldTranslationEntries.value;
  }
  return fieldTranslationEntries.value.filter(
    (entry) =>
      entry.key.toLowerCase().includes(filter) ||
      entry.label.toLowerCase().includes(filter),
  );
});
</script>

<style scoped>
.expert-help__intro {
  margin-top: 0;
  color: rgba(0, 0, 0, 0.7);
}

.expert-help__section + .expert-help__section {
  margin-top: 16px;
}

.expert-help__section-title {
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--q-secondary);
  margin-bottom: 8px;
}

.expert-help__list {
  margin: 0;
  padding-left: 20px;
}

.expert-help__list li {
  margin-bottom: 4px;
}

.expert-help__example {
  border: 1px solid #e0e0e0;
  border-left: 3px solid var(--q-secondary);
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: #fafafa;
}

.expert-help__code {
  display: block;
  font-family: "Roboto Mono", "Courier New", monospace;
  font-size: 0.85rem;
  color: #1d1d1d;
  word-break: break-all;
}

.expert-help__caption {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
}

.expert-help__fields-hint {
  margin: 0 0 8px;
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.6);
}

.expert-help__fields-filter {
  margin-bottom: 8px;
}

.expert-help__fields-table {
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.expert-help__fields-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  font-size: 0.82rem;
}

.expert-help__fields-row:nth-child(even) {
  background-color: #fafafa;
}

.expert-help__fields-key {
  font-family: "Roboto Mono", "Courier New", monospace;
  color: #1d1d1d;
  flex: 0 0 auto;
}

.expert-help__fields-label {
  color: rgba(0, 0, 0, 0.7);
}

.expert-help__fields-empty {
  margin: 4px 0 0;
  font-size: 0.8rem;
  font-style: italic;
  color: rgba(0, 0, 0, 0.5);
}

.expert-help__warning {
  margin-top: 16px;
  background-color: #fff8e1;
  font-size: 0.85rem;
}

.expert-help__doc-link {
  display: inline-flex;
  align-items: center;
  margin-top: 16px;
  color: var(--q-secondary);
  font-weight: 500;
  text-decoration: none;
}

.expert-help__doc-link:hover {
  text-decoration: underline;
}
</style>
