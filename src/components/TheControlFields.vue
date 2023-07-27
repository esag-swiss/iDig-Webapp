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
      {{ type.plurals.fr }}
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
        class="list-group-item accordion"
        @click="isHiddenArray[index] = !isHiddenArray[index]"
      >
        {{ group.labels ? group.labels.fr : group.group }}
      </li>

      <!-- liste les champs pour chaque groupe -->
      <div v-if="!isHiddenArray[index]">
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
import { useDataState } from "@/services/useDataState";
import { useAppState } from "@/services/useAppState";

export default {
  setup() {
    const {
      projectPreferencesTypes,
      projectPreferencesFields,
      setFilteredTrenchesItemsStore,
      filteredTrenchesItemsStore,
      selectedType,
      setSelectedType,
      settableColumns,
    } = useDataState();
    const { appState } = useAppState();

    return {
      projectPreferencesTypes,
      projectPreferencesFields,
      setFilteredTrenchesItemsStore,
      filteredTrenchesItemsStore,
      selectedType,
      setSelectedType,
      settableColumns,
      appState,
    };
  },
  data() {
    return {
      checkedFields: [],
      defaultColumns: {},
      isHiddenArray: [
        false,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
        true,
      ],
    };
  },
  computed: {
    // liste les groupes pour l'accordéon des champs en fonction du Type
    groupOfFieldsAccordingToType() {
      return this.projectPreferencesTypes.filter((x) => {
        return x.type.includes(this.selectedType);
      })[0].groups;
    },

    allFieldsLabel() {
      return this.projectPreferencesFields.map((field) => {
        if (Object.prototype.hasOwnProperty.call(field, "labels")) {
          return field.labels[this.appState.lang];
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
  // mounted() {
  //   this.update("Artifact");
  //   alert("mount");
  // },
  methods: {
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
      this.settableColumns(this.checkedFields);
    },

    setColumns() {
      this.settableColumns(this.checkedFieldsSortableTrue);

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
