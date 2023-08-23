<template>
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
    @change="
      (event) => {
        updateCheckedFields(event.target.value);
        setSelectedType(event.target.value);
      }
    "
  >
    <option
      v-for="type in projectPreferencesTypes"
      :key="type"
      :value="type.type"
    >
      {{ type.plurals[lang] ?? type.type }}
    </option>
  </select>

  <div class="p-1 m-1 border-0">
    <h3 title="display only fields for the selected type">Champs</h3>
    <!-- liste les groupes pour le type selectionné -->
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
            v-model="checkedFields"
            type="checkbox"
            :value="field"
            checked
            @change="setColumns()"
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
import { mapActions, mapState } from "pinia";
import { useAppStore } from "@/stores/app";
import { useDataStore } from "@/stores/data";

export default {
  data() {
    return {
      checkedFields: [],
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
    ]),
    // liste les groupes pour l'accordéon des champs en fonction du Type
    groupsOfFieldsAccordingToType() {
      return this.projectPreferencesTypes.filter((x) => {
        return x.type.includes(this.selectedType);
      })[0].groups;
    },
  },
  methods: {
    ...mapActions(useDataStore, ["setSelectedType", "setTableColumns"]),
    updateCheckedFields(type) {
      if (localStorage.defaultTableColumns) {
        if (JSON.parse(localStorage.defaultTableColumns)[type]) {
          this.checkedFields = JSON.parse(localStorage.defaultTableColumns)[
            type
          ];
        } else {
          this.checkedFields = [];
        }
      }
      this.setTableColumns(this.checkedFields);
    },

    setColumns() {
      const addSortable = this.checkedFields.map((v) =>
        Object.assign(v, {
          label: this.projectPreferencesFieldsWithTranslation[v.field],
          sortable: true,
          checked: true,
        })
      );

      this.setTableColumns(addSortable);

      this.defaultColumns[this.selectedType] = addSortable;
      localStorage.setItem(
        "defaultTableColumns",
        JSON.stringify(this.defaultColumns)
      );
    },
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
