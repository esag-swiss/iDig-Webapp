<template>
  <div v-if="editMode">
    <q-select
      v-model="selectedTypeSubtype"
      dense
      options-dense
      square
      filled
      :options="projectPreferencesTypesForOption"
      emit-value
      map-options
      :label="
        projectPreferencesTypesTranslation[currentItem.Subtype] ||
        projectPreferencesTypesTranslation[currentItem[field.field]]
      "
      @update:model-value="updateTypeAndSubtype"
    />
  </div>
  <div v-else>
    {{
      projectPreferencesTypesTranslation[currentItem.Subtype] ||
      projectPreferencesTypesTranslation[currentItem[field.field]]
    }}
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useDataStore } from "@/stores/data";
export default {
  name: "TheItemType",
  props: {
    field: Object,
    currentItem: Object,
    editMode: Boolean,
  },
  data() {
    return {
      selectedTypeSubtype: null,
    };
  },
  computed: {
    ...mapState(useDataStore, [
      "projectPreferencesTypesTranslation",
      "projectPreferencesTypesForOption",
    ]),
  },
  methods: {
    updateTypeAndSubtype(value) {
      this.currentItem.Type = value.type;
      this.currentItem.Subtype = value.subtype;
    },
  },
};
</script>

<style scoped>
/* Styles spécifiques au composant enfant */
</style>
