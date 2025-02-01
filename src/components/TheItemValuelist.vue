<template>
  <!-- VALUELIST NOT EMPTY (RESTRICTED)-->
  <q-select
    v-if="editMode && fieldType(field.field, group)?.valuelist.length !== 0"
    v-model="currentItem[field.field]"
    use-input
    square
    dense
    options-dense
    filled
    clearable
    input-debounce="0"
    :label="isFocused ? previousValue : ''"
    @focus="isFocused = true"
    @blur="isFocused = false"
    :options="fieldType(field.field, group).valuelist"
    @clear="currentItem[field.field] = previousValue"
  />
  <!-- VALUELIST EMPTY (DYNAMIQUE)-->
  <q-select
    v-else-if="editMode && fieldType(field.field, group)?.valuelist.length == 0"
    v-model="currentItem[field.field]"
    use-input
    square
    dense
    options-dense
    filled
    clearable
    input-debounce="0"
    :label="previousValue"
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
    fieldType(field, groupObject) {
      let groupName = groupObject.group ?? "";
      let fieldSchema = this.projectPreferencesFields.filter(
        (x) => x.field == field
      )[0];

      let fieldSchemaFromGroups = this.projectPreferencesTypes
        .filter((x) => {
          return (
            x.type.includes(this.currentItem.Type) ||
            (x.subtype && x.subtype.includes(this.currentItem.Subtype))
          );
        })[0]
        ?.groups.filter((x) => {
          return x.group.includes(groupName);
        })[0]
        ?.fields.filter((x) => {
          return x.field.includes(field);
        })[0];

      if (fieldSchemaFromGroups) {
        fieldSchema = { ...fieldSchema, ...fieldSchemaFromGroups };
      }

      if (this.fieldsSchema[field]) {
        fieldSchema = { ...this.fieldsSchema[field], ...fieldSchema };
      }

      return fieldSchema;
    },
    listValueInField(field) {
      let valeursField = this.checkedTrenchesItemsSelectedType.map(
        (objet) => objet[field]
      );
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
