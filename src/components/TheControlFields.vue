<template>
  <div class="p-1 m-1 bg-light border border-grey rounded">
    <h3
      title="filter table data and show only fields available for the selected type"
    >
      Type
    </h3>

    <!-- dropdown for types -->
    <select
      v-model="selectedType"
      class="form-control"
      @change="changeSelectedType"
    >
      <option
        v-for="type in projectPreferencesTypes"
        :key="type"
        :value="type.type"
      >
        {{ type.plurals.fr }}
      </option>
    </select>
  </div>

  <div class="p-1 m-1 bg-light border border-grey rounded">
    <h3 title="display only fields for the selected type">Champs</h3>
    <!-- liste les groupes pour le type selectionné -->
    <ul
      v-for="(group, index) in groupOfFieldsAccordingToType"
      :key="group"
      class="list-group"
    >
      <li
        v-if="group.hasOwnProperty('labels')"
        class="list-group-item accordion"
        @click="isHiddenArray[index] = !isHiddenArray[index]"
      >
        {{ group.labels.fr }}
      </li>
      <li
        v-else
        class="list-group-item accordion"
        @click="isHiddenArray[index] = !isHiddenArray[index]"
      >
        {{ group.group }}
      </li>
      <!-- liste les champs pour chaque groupe -->
      <div v-if="!isHiddenArray[index]">
        <div v-for="field in group.fields" :key="field" class="m-0">
          <input
            v-model="checkFields"
            type="checkbox"
            :value="field"
            @change="checkfields()"
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
  emits: ["checkFields", "selectedType", "selected-type", "check-fields"],
  setup() {
    const { projectPreferencesTypes, projectPreferencesFields } =
      useDataState();
    const { appState } = useAppState();
    return { projectPreferencesTypes, projectPreferencesFields, appState };
  },
  data() {
    return {
      checkFields: [],
      defaultcheckFields: [
        // columns by default before any selection /!\ label needed to display headers
        { field: "Source", sortable: true, label: "Secteur", checked: true },
        { field: "Title", sortable: true, label: "Titre", checked: true },
        {
          field: "Identifier",
          isKey: true,
          sortable: true,
          label: "Identifiant",
          checked: true,
        },
      ],
      selectedType: "Artifact", // default type
      isHiddenArray: [
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
        true,
      ],
    };
  },
  computed: {
    // liste les groupes pour l'accordéon des champs
    // info : la liste des fields par groupe se trouvent dans types.groups.fields
    // on pourrait s'assurer ici que le label de la langue existe toujours pour eviter la methode "labels"
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
      // sert pour afficher les labels des check box

      var langKeys = {};
      var i;
      for (i = 0; i < this.projectPreferencesFields.length; i++) {
        langKeys[this.projectPreferencesFields[i].field] =
          this.allFieldsLabel[i];
      }
      return langKeys;
    },

    // Maintenant on travaille pour faire le tableau des headers dans le format de TheTable
    addsortabletrue() {
      // j'ajoute les propriétés label et sortable: true
      // pas certain que tous les undefined soient gérés
      return this.checkFields.map((v) =>
        Object.assign(v, {
          label: this.projectPreferencesTranslatedFieldLabels[v.field],
          sortable: true,
        })
      );
    },
  },

  methods: {
    changeSelectedType: function () {
      this.checkFields = this.defaultcheckFields;
      // reçoit du @change et renvoie au parent
      this.$emit("selected-type", this.selectedType);
      this.$emit("check-fields", this.addsortabletrue);
    },
    checkfields() {
      // reçoit du @change et renvoie au parent
      this.$emit("check-fields", this.addsortabletrue);
    },

    labels: function (Obj) {
      if (
        Object.prototype.hasOwnProperty.call(
          this.projectPreferencesTranslatedFieldLabels,
          Obj
        )
      ) {
        return this.projectPreferencesTranslatedFieldLabels[Obj];
      } else {
        return Obj;
      }
    },
  },
};
</script>

<style>
/* Style the buttons that are used to open and close the accordion panel */
.accordion {
  background-color: #eee;
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
}

/* Style the accordion panel. Note: hidden by default */
.panel {
  padding: 0 18px;
  background-color: white;
  display: none;
  overflow: hidden;
}
</style>
