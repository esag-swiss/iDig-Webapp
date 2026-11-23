<template>
  <div class="q-gutter-y-sm">
    <q-input
      v-model="compositionText"
      type="textarea"
      outlined
      autogrow
      class="composition-editor"
      :label="$t('app.export_composition')"
      :error="!isValid"
      :error-message="$t('app.export_composition_invalid')"
      @update:model-value="applyText"
    />
    <q-btn
      size="sm"
      flat
      color="secondary"
      icon="auto_fix_high"
      :label="$t('app.export_composition_example')"
      @click="insertExample"
    />
    <div v-if="previewText" class="composition-preview">
      <div class="text-caption text-grey-8">
        {{ $t("app.export_preview") }}
      </div>
      <div>{{ previewText }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import {
  EXAMPLE_COMPOSITION,
  composeText,
  isValidComposition,
} from "@/services/export/composedText";
import { formatValue } from "@/services/export/exportModel";

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  previewItem: { type: Object, default: null },
  previewContext: { type: Object, default: () => ({}) },
});
const emit = defineEmits(["update:modelValue"]);

const compositionText = ref("");
const isValid = ref(true);

function formatComposition(composition) {
  return JSON.stringify(composition, null, 2);
}

function parseComposition(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isSameComposition({ text, composition }) {
  return JSON.stringify(parseComposition(text)) === JSON.stringify(composition);
}

function applyText(text) {
  const composition = parseComposition(text);
  isValid.value = isValidComposition(composition);
  if (isValid.value) {
    emit("update:modelValue", composition);
  }
}

function insertExample() {
  compositionText.value = formatComposition(EXAMPLE_COMPOSITION);
  applyText(compositionText.value);
}

const previewText = computed(() => {
  if (!props.previewItem) {
    return "";
  }
  return composeText({
    composition: props.modelValue,
    valueOf: (field) =>
      formatValue(field, props.previewItem, props.previewContext),
  });
});

watch(
  () => props.modelValue,
  (composition) => {
    // Rewriting the text the user is typing would move the cursor.
    if (isSameComposition({ text: compositionText.value, composition })) {
      return;
    }
    compositionText.value = formatComposition(composition);
    isValid.value = true;
  },
  { immediate: true },
);
</script>

<style scoped>
.composition-editor :deep(textarea) {
  font-family: monospace;
  font-size: 12px;
}
.composition-preview {
  padding: 8px;
  border-left: 3px solid var(--q-secondary);
  background: rgba(0, 0, 0, 0.03);
}
</style>
