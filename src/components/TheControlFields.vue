<template>
  <!-- TYPES -->
  <div class="p-1 m-1 border-0">
    <h3
      title="filter table data and show only fields available for the selected type"
    >
      Type
    </h3>
  </div>
  <!-- dropdown for types -->
  <select
    :value="selectedType"
    class="form-control form-control-sm"
    @change="(event) => setSelectedType(event.target.value)"
  >
    <option
      v-for="type in projectPreferencesTypes"
      :key="type"
      :value="type.type"
    >
      {{ type.plurals[lang] ?? type.type }}
    </option>
  </select>

  <!-- FIELDS -->
  <div class="p-1 m-1 border-0">
    <h3 title="display only fields for the selected type">Champs</h3>
    <!-- liste les groupes pour le type sélectionné -->
    <ul
      v-for="(group, index) in groupsOfFieldsAccordingToType"
      :key="group"
      class="list-group"
    >
      <li
        class="list-group-item accordion text-bold"
        @click="isDisplayedArray[index] = !isDisplayedArray[index]"
      >
        {{ group.labels?.[lang] ?? group.group }}
      </li>

      <!-- liste les champs pour chaque groupe -->
      <div v-if="isDisplayedArray[index]">
        <div v-for="(field, i) in group.fields" :key="i" class="m-0">
          <input
            v-model="checkedFieldNames"
            :value="field.field"
            type="checkbox"
          />
          <label class="pl-1 m-0" for="checkbox">{{
            projectPreferencesFieldsWithTranslation[field.field] ?? field.field
          }}</label>
        </div>
      </div>
    </ul>
  </div>
</template>

<script>
import { mapActions, mapState, mapWritableState } from "pinia";
import { useAppStore } from "@/stores/app";
import { useDataStore } from "@/stores/data";
import {
  lsLoadCheckedFieldNames,
  lsStoreCheckedFieldNames,
} from "@/services/PersistentUserSettings";

export default {
  data() {
    return {
      defaultColumns: {},
      isDisplayedArray: [true],
    };
  },
  computed: {
    ...mapState(useAppStore, ["lang"]),
    ...mapState(useDataStore, [
      "projectPreferencesTypes",
      "projectPreferencesFields",
      "projectPreferencesFieldsWithTranslation",
      "selectedType",
      "setCheckedFieldNames",
    ]),
    ...mapWritableState(useDataStore, ["checkedFieldNames"]), // mapWritableState for v-model only
    // liste les groupes pour l'accordéon des champs en fonction du Type
    groupsOfFieldsAccordingToType() {
      return this.projectPreferencesTypes.filter((x) => {
        return x.type.includes(this.selectedType);
      })[0].groups;
    },
  },
  watch: {
    checkedFieldNames() {
      lsStoreCheckedFieldNames();
    },
    selectedType() {
      lsLoadCheckedFieldNames();
    },
  },
  mounted() {
    lsLoadCheckedFieldNames();
  },
  methods: {
    ...mapActions(useDataStore, ["setSelectedType"]),
  },
};
</script>

<style>
/* Style the buttons that are used to open and close the accordion panel */
.accordion {
  cursor: pointer;
  color: #444;
  padding: 0.1rem;
  width: 100%;
  text-align: left;
  border: none;
  outline: none;
  transition: 0.4s;
}

/* Add a background color to the button if it is clicked on (add the .active class with JS), and when you move the mouse over it (hover) */
.active,
.accordion:hover {
  background-color: #ccc;
  /* font-weight: bold; */
}
.list-group-item {
  background-color: #f8f9fa;
}
</style>
