<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <q-input
    v-if="editMode"
    v-model="currentItem[field.field]"
    square
    dense
    filled
    class="select"
    @focus="menuOpen = true"
  >
    <q-menu
      v-model="menuOpen"
      no-focus
      no-parent-event
      no-refocus
      fit
      anchor="bottom left"
      self="top left"
    >
      <q-list dense>
        <q-item
          v-for="option in filteredOptions"
          :key="option"
          v-close-popup
          clickable
          @click="currentItem[field.field] = option"
        >
          <q-item-section>{{ option }}</q-item-section>
        </q-item>
        <q-item v-if="filteredOptions.length === 0">
          <q-item-section class="text-grey">No results</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-input>
  <!-- eslint-enable vue/no-mutating-props -->

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
      previousValue: null,
      menuOpen: false,
    };
  },

  computed: {
    ...mapState(useDataStore, [
      "projectPreferencesTypes",
      "projectPreferencesFields",
      "checkedTrenchesItemsSelectedType",
    ]),
    allOptions() {
      const valeursField = this.checkedTrenchesItemsSelectedType.map(
        (objet) => objet[this.field.field],
      );
      const valuelistItems =
        this.fieldDefinition(this.field.field, this.group).valuelist || [];
      return valeursField
        .concat(valuelistItems)
        .filter(
          (valeur, index, self) => valeur && self.indexOf(valeur) === index,
        )
        .sort();
    },
    filteredOptions() {
      const needle = (this.currentItem[this.field.field] || "").toLowerCase();
      return this.allOptions.filter(
        (v) => v.toLowerCase().indexOf(needle) > -1,
      );
    },
  },
  mounted() {
    this.previousValue = this.currentItem[this.field.field];
  },
  methods: {
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
  },
};
</script>

<style scoped>
.select {
  margin: 4px;
}
</style>
