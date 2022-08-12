<template>
  <div class="p-1 m-1 bg-light border border-grey rounded">
    <h3>Type</h3>

    <!-- dropdown for types -->
    <select
      class="form-control"
      v-model="selectedtype"
      @change="changeSelectedType"
    >
      <option v-for="type in types" :key="type" :value="type.type">
        {{ type.plurals.fr }}
      </option>
    </select>
  </div>

  <div class="p-1 m-1 bg-light border border-grey rounded">
    <h3>Champs</h3>
    <!-- liste les groupes pour le type selectionné -->
    <ul v-for="group in groups" :key="group" class="list-group">
      <li class="list-group-item accordion" @click="isHidden = !isHidden">
        {{ group.labels.fr }}
      </li>
      <!-- liste les champs pour chaque groupe -->
      <div v-if="!isHidden">
        <div
          v-for="field in group.fields"
          :key="field"
          @change="checkfields()"
          class="mt-1"
        >
          <input type="checkbox" v-model="checkFields" :value="field" />
          <label class="p-1 m-0" for="checkbox">{{
            labels(field.field)
          }}</label>
        </div>
      </div>
    </ul>


    <input
      id="checkboxattachment"
      type="checkbox"
      @change="attachmentcolumn(img_url)"
    />
    <label class="p-1 m-0" for="checkbox">attachments</label>
  </div>
</template>

<script>
import preferencesData from "../data/AMA21-S24.Preferences.json";
// import axios from "axios";

export default {
  data() {
    return {
      fields: preferencesData.fields,
      types: preferencesData.types,
      checkFields: [
        // columns by default before any selection /!\ label needed to display headers
        { field: "Source", sortable: true, label: "Source" },
        { field: "Type", sortable: true, label: "Type" },
        {
          field: "Identifier",
          isKey: true,
          sortable: true,
          label: "Identifier",
        },
      ],
      selectedtype: "Artifact", // default type
      isHidden: true,
      lang: "fr", // for later dev
      img_url: "http://thacer.archaiodata.com/ThaCER.svg",
    };
  },
  computed: {
    groups() {
      return this.types.filter((x) => {
        // la liste des fields par groupe se trouvent dans types.groups.fields
        return x.type.includes(this.selectedtype);
      })[0].groups;
    },
    allfields() {
      return this.fields.map(({ field }) => {
        return field;
      });
    },
    alllabels() {
      // je ne comprends pas grand chose mais ca marche et j'en suis fier !
      return this.fields.map((field) =>
        field.labels !== undefined ? field.labels.fr : field.field
      );
    },
    fieldLabel() {
      // calcul les correspondances field : label dans un objet field : label
      // sert pour afficher les labels des check box
      var langKeys = {};
      var i;
      for (i = 0; i < this.alllabels.length; i++) {
        langKeys[this.allfields[i]] = this.alllabels[i];
      }
      return langKeys;
    },

    // Maintenant on travaille pour faire le tableau des headers
    // dans le format de TableLite
    addsortabletrue() {
      // j'ajoute les propriétés label et sortable: true
      // pas certain que tous les undefined soient gérés
      return this.checkFields.map((v) =>
        Object.assign(v, { label: this.fieldLabel[v.field], sortable: true })
      );
    },
  },

  methods: {
    changeSelectedType: function () {
      // reçoit du @change et renvoie au parent
      this.$emit("selected-type", this.selectedtype);
    },
    checkfields() {
      // reçoit du @change et renvoie au parent
      this.$emit("check-fields", this.addsortabletrue);
    },

    labels: function (Obj) {
      if (Object.prototype.hasOwnProperty.call(this.fieldLabel, Obj)) {
        return this.fieldLabel[Obj];
      } else {
        return Obj;
      }
    },

    // WORK IN PROGRESS
    // inclure des images

    attachmentcolumn: function (img_url) {
 var elm = document.getElementById("checkboxattachment");
      if (elm.checked == true) {
        this.addsortabletrue.push({
          field: "RelationIncludesUUID",
          sortable: false,
          label: "Attachment",
          display: function (row) {
            if (
              row.RelationIncludesUUID == "69413B9C-F4F6-4AAF-BD1E-1C2E5B73A281"
            ) {
              return (
                '<img class="dqg img-UID" width="180" id="image" alt="' +
                img_url +
                '" src="' +
                img_url +
                '">'
              );
            } else {
              return row.RelationIncludesUUID;
            }
          },
        });
        this.$emit("check-fields", this.addsortabletrue);
      } else {
        this.addsortabletrue.splice(-1, 1);
        this.$emit("check-fields", this.checkFields);
      }
    },
  },
  emits: ["checkFields", "selectedType"], // si je ne mets pas cette ligne j'ai un message Extraneous non-emits event listeners (checkFields) were passed to component but could not be automatically inherited
};
</script>

<style>
/* Style the buttons that are used to open and close the accordion panel */
.accordion {
  background-color: #eee;
  color: #444;
  cursor: pointer;
  padding: 10px;
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
.h3 {
  font-size: 1.2rem;
}
</style>