<template>
  <q-select
    v-if="editMode"
    v-model="currentItem[field.field]"
    use-input
    square
    dense
    options-dense
    filled
    fill-input
    hide-selected
    clearable
    input-debounce="0"
    :options="options"
    new-value-mode="add"
    @clear="currentItem[field.field] = previousValue"
    @filter="filterFn"
    class="select"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey"> No results </q-item-section>
      </q-item>
    </template>
  </q-select>

  <div v-else>
    {{ currentItem[field.field] }}
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useDataStore } from "@/stores/data";
import { fieldsSchema } from "@/assets/nativeFields";
import { resolveFieldDefinition } from "@/services/fieldDefinition";

export default {
  name: "TheItemValuelist",
  props: {
    field: {
      type: Object,
      required: true,
    },
    currentItem: {
      type: Object,
      required: true,
    },
    editMode: Boolean,
    group: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      fieldsSchema: fieldsSchema,
      selectedTypeSubtype: null,
      options: [],
      previousValue: null,
    };
  },

  computed: {
    ...mapState(useDataStore, [
      "projectPreferencesTypes",
      "projectPreferencesFields",
      "checkedTrenchesItemsSelectedType",
    ]),
  },
  mounted() {
    this.previousValue = this.currentItem[this.field.field];
  },
  methods: {
    filterFn(val, update, abort) {
      update(() => {
        const needle = val.toLowerCase();
        this.options = this.listValueInField(this.field.field).filter(
          (v) => v && v.toLowerCase().indexOf(needle) > -1
        );
      });
    },
    fieldDefinition(field, groupObject) {
      return resolveFieldDefinition({
        field,
        groupObject,
        item: this.currentItem,
        projectPreferencesTypes: this.projectPreferencesTypes,
        projectPreferencesFields: this.projectPreferencesFields,
        fieldsSchema: this.fieldsSchema,
      });
    },
    listValueInField(field) {
      let valeursField = this.checkedTrenchesItemsSelectedType.map(
        (objet) => objet[field]
      );
      let valuelistItems =
        this.fieldDefinition(this.field.field, this.group).valuelist || [];
      valeursField = valeursField.concat(valuelistItems);
      // Filtrer les doublons
      return valeursField
        .filter((valeur, index, self) => self.indexOf(valeur) === index)
        .sort();
    },
  },
};
</script>

<style scoped>
/* this style to correct a strange style differnece between first and secanod q-select component */
.select {
  margin: 4px;
}
</style>
