<template>
  <div class="p-1 m-1 bg-light border border-grey rounded">
    <h3
      class="doigt"
      title="filter table data and show only fields available for the selected type"
    >
      Type
    </h3>

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
    <h3 class="doigt" title="display only fields for the selected type">
      Champs
    </h3>
    <!-- liste les groupes pour le type selectionné -->
    <ul v-for="(group, index) in groups" :key="group" class="list-group">
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
            type="checkbox"
            v-model="checkFields"
            @change="checkfields()"
            :value="field"
          />
          <label class="pl-1 m-0" for="checkbox">{{
            labels(field.field)
          }}</label>
        </div>
      </div>
    </ul>

    <!-- lignes commentées work in progress pour visualiser les images
       <input
      id="checkboxattachment"
      type="checkbox"
      @change="attachmentcolumn(img_url)"
    /> 
    <label class="p-1 my-0" for="checkbox">attachments</label> -->
  </div>
</template>

<script>
import preferencesData from "../data/Preferences.json";

export default {
  data() {
    return {
      fields: preferencesData.fields,
      types: preferencesData.types,
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
      selectedtype: "Artifact", // default type
      // isHidden: true,
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
      lang: "fr", // for later dev
      img_url: "http://thacer.archaiodata.com/ThaCER.svg", // test images
    };
  },
  props: {
    selectedData: {
      type: Object,
      required: true,
    },
  },
  computed: {
    // liste les groupes pour l'accordéon
    // info : la liste des fields par groupe se trouvent dans types.groups.fields
    groups() {
      if (localStorage.types) {
        return JSON.parse(localStorage.types).filter((x) => {
          return x.type.includes(this.selectedtype);
        })[0].groups;
      } else {
        return this.types.filter((x) => {
          return x.type.includes(this.selectedtype);
        })[0].groups;
      }
    },

    // liste tous les fields afin ensuite d'établi la liste des labels correspondants
    allfields() {
      if (localStorage.fields) {
        return JSON.parse(localStorage.fields).map(({ field }) => {
          return field;
        });
      } else {
        return this.fields.map(({ field }) => {
          return field;
        });
      }
    },

    alllabels() {
      if (localStorage.fields) {
        return JSON.parse(localStorage.fields).map((field) => {
          if (Object.prototype.hasOwnProperty.call(field, "labels")) {
            return field.labels[localStorage.lang];
          } else {
            return field.field;
          }
        });
      } else {
        return this.fields.map((field) =>
          field.labels !== undefined ? field.labels.en : field.field
        );
      }
    },

    fieldLabel() {
      // calcule les correspondances field : label dans un objet field : label
      // sert pour afficher les labels des check box
      var langKeys = {};
      var i;
      for (i = 0; i < this.alllabels.length; i++) {
        langKeys[this.allfields[i]] = this.alllabels[i];
      }
      return langKeys;
    },

    // Maintenant on travaille pour faire le tableau des headers dans le format de TableLite
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
      this.checkFields = this.defaultcheckFields;
      // reçoit du @change et renvoie au parent
      this.$emit("selected-type", this.selectedtype);
      this.$emit("check-fields", this.addsortabletrue);
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
      var regExp = /[-]/g;
      // let imgUrl = "";
      var elm = document.getElementById("checkboxattachment");
      if (elm.checked == true) {
        this.addsortabletrue.push({
          field: "RelationIncludesUUID",
          sortable: false,
          label: "Attachment",
          display: function (row) {
            if (regExp.test(row.RelationIncludesUUID)) {
              // return axios({
              //   headers: {
              //     "Content-Type": "application/x-www-form-urlencoded",
              //   },
              //   method: "get",
              //   url: "http://localhost:9000/idig/Agora/ΒΓ 2013/attachments/ΒΓ (407,291,447,318).png?checksum=2022-05-12T12:30:42Z",
              //   responseType: "blob",
              //   auth: {
              //     username: "idig",
              //     password: "idig",
              //   },
              //   data: {},
              // })
              //   .then((response) => {
              //     let blob = new Blob([response.data], {
              //       type: response.headers["content-type"],
              //     });
              //      URL.createObjectURL(blob);
              //   });

              return row.RelationIncludesUUID.split("\n");

              // return this.selectedData.filter((x) => {
              //   return x.IdentifierUUID.includes("1CF4D560-8E7B-4E94-BBB5-E893E463D1EC");
              // })[0].Type;

              // return (
              //   '<img class="dqg img-UID" width="180" id="image" alt="' +
              //   imgUrl +
              //   'dfhd" src="' +
              //   img_url +
              //   '">'
              // );
            } else {
              // return row.RelationIncludesUUID;
              return (
                '<img class="dqg img-UID" width="180" id="image" alt="' +
                img_url +
                '" src="' +
                img_url +
                '">'
              );
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
.h3 {
  font-size: 1.2rem;
}
.doigt {
  cursor: pointer;
}
</style>