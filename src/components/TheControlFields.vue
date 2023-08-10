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
      {{ type.plurals.fr ? type.plurals.fr : type.plurals.en }}
    </option>
  </select>

  <div class="p-1 m-1 border-0">
    <h3 title="display only fields for the selected type">Champs</h3>
    <!-- liste les groupes pour le type selectionné -->
    <ul
      v-for="(group, index) in groupOfFieldsAccordingToType"
      :key="group"
      class="list-group"
    >
      <li
        class="list-group-item accordion text-bold"
        @click="isDisplayedArray[index] = !isDisplayedArray[index]"
      >
        {{ group.labels ? group.labels.fr : group.group }}
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
            labels(field.field)
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
      "selectedType",
    ]),
    // liste les groupes pour l'accordéon des champs en fonction du Type
    groupOfFieldsAccordingToType() {
      return this.projectPreferencesTypes.filter((x) => {
        return x.type.includes(this.selectedType);
      })[0].groups;
    },

    allFieldsLabel() {
      return this.projectPreferencesFields.map((field) => {
        if (Object.prototype.hasOwnProperty.call(field, "labels")) {
          return field.labels[this.lang];
        } else {
          return field.field;
        }
      });
    },

    projectPreferencesTranslatedFieldLabels() {
      // calcule les correspondances field : label dans un objet field : label
      // sert pour afficher les labels des checkbox
      var langKeys = {};
      var i;
      for (i = 0; i < this.projectPreferencesFields.length; i++) {
        langKeys[this.projectPreferencesFields[i].field] =
          this.allFieldsLabel[i];
      }
      return langKeys;
    },

    // Maintenant on travaille pour faire le tableau des headers dans le format de TheTable
    checkedFieldsSortableTrue() {
      // j'ajoute les propriétés label et sortable: true. pas certain que tous les undefined soient gérés
      return this.checkedFields.map((v) =>
        Object.assign(v, {
          label: this.projectPreferencesTranslatedFieldLabels[v.field],
          sortable: true,
          checked: true,
        })
      );
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
      this.setTableColumns(this.checkedFieldsSortableTrue);

      this.defaultColumns[this.selectedType] = this.checkedFieldsSortableTrue;
      localStorage.setItem(
        "defaultTableColumns",
        JSON.stringify(this.defaultColumns)
      );
    },

    labels: function (Obj) {
      return this.projectPreferencesTranslatedFieldLabels[Obj]
        ? this.projectPreferencesTranslatedFieldLabels[Obj]
        : Obj;
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
