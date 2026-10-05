<template>
  <q-select
    v-model="model"
    dense
    options-dense
    outlined
    emit-value
    map-options
    :label="label"
    :options="filteredOptions"
    :multiple="multiple"
    :use-chips="multiple"
    :use-input="filterable"
    :disable="disable"
    input-debounce="0"
    @filter="onFilter"
  />
</template>

<script setup>
import { computed, ref } from "vue";
import { normalize } from "@/services/helpers/textHelper";

const props = defineProps({
  options: { type: Array, required: true },
  label: { type: String, default: "" },
  multiple: { type: Boolean, default: false },
  filterable: { type: Boolean, default: false },
  disable: { type: Boolean, default: false },
});

const model = defineModel({
  type: [String, Number, Boolean, Object, Array],
  default: null,
});

const needle = ref("");

const normalizedOptions = computed(() =>
  props.options.map((option) =>
    typeof option === "object" && option !== null
      ? option
      : { label: String(option), value: option },
  ),
);

const filteredOptions = computed(() => {
  const search = normalize(needle.value);
  return search
    ? normalizedOptions.value.filter((option) =>
        normalize(option.label).includes(search),
      )
    : normalizedOptions.value;
});

function onFilter(value, update) {
  update(() => {
    needle.value = value;
  });
}
</script>
