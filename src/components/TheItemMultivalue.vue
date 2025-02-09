<template>
  <!-- <q-select
    v-if="editMode && fieldType(field.field, group)?.valuelist?.length !== 0"
    v-model="model"
    square
    dense
    options-dense
    filled
    use-input
    use-chips
    multiple
    clearable
    input-debounce="0"
    class="select"
    :options="fieldType(field.field, group).valuelist"
    @update:model-value="updateMultiArrayNew(field.field, model)"
    @clear="resetValue"
  /> -->
  <q-select
    v-if="editMode"
    v-model="model"
    square
    dense
    options-dense
    filled
    use-input
    use-chips
    multiple
    clearable
    input-debounce="0"
    class="select"
    @new-value="createValue"
    :options="filterOptions"
    @filter="filterFn"
    @update:model-value="updateMultiArrayNew(field.field, model)"
    @clear="resetValue"
  />
  <div v-else>
    {{ currentItem[field.field] }}
  </div>
</template>

<script>
import { mapState } from "pinia";
import { useDataStore } from "@/stores/data";
import { fieldsSchema } from "@/assets/nativeFields";
export default {
  name: "TheItemMultivalue",
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
      arrayForMultivalueFields: [],
      model: null,
      filterOptions: [],
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
    this.model =
      this.currentItem[this.field.field] &&
      this.currentItem[this.field.field].split("\n");
    this.previousValue = this.currentItem[this.field.field];
  },
  methods: {
    createValue(val, done) {
      // Calling done(var) when new-value-mode is not set or "add", or done(var, "add") adds "var" content to the model
      // and it resets the input textbox to empty string
      // ----
      // Calling done(var) when new-value-mode is "add-unique", or done(var, "add-unique") adds "var" content to the model
      // only if is not already set
      // and it resets the input textbox to empty string
      // ----
      // Calling done(var) when new-value-mode is "toggle", or done(var, "toggle") toggles the model with "var" content
      // (adds to model if not already in the model, removes from model if already has it)
      // and it resets the input textbox to empty string
      // ----
      // If "var" content is undefined/null, then it doesn't tampers with the model
      // and only resets the input textbox to empty string

      if (val.length > 2) {
        if (!this.listValueInField(this.field.field).includes(val)) {
          done(val, "add-unique");
        }
      }
    },
    filterFn(val, update) {
      update(() => {
        if (val === "") {
          this.filterOptions = this.listValueInField(this.field.field);
        } else {
          const needle = val.toLowerCase();
          this.filterOptions = this.listValueInField(this.field.field).filter(
            (v) => v && v.toLowerCase().indexOf(needle) > -1
          );
        }
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
      let valuelistItems =
        this.fieldType(this.field.field, this.group).valuelist || [];
      valeursField = valeursField.concat(valuelistItems);
      // Filtrer les doublons
      return valeursField
        .filter((valeur, index, self) => self.indexOf(valeur) === index)
        .sort();
    },
    updateMultiArrayNew(field, value) {
      if (value) {
        this.currentItem[field] = value.join("\n");
      }
    },
    resetValue() {
      this.currentItem[this.field.field] = this.previousValue;
      this.model =
        this.currentItem[this.field.field] &&
        this.currentItem[this.field.field].split("\n");
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
