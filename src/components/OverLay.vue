<template>
  <div class="overlay justify-content-center">
    <div
      id="overlay"
      class="center-block mx-auto p-3"
      style="
        height: auto;
        margin-top: 3%;
        margin-bottom: 3%;
        width: 90%;
        background: rgb(255, 255, 255);
      "
    >
      <!--header-->
      <div class="row align-items-start border-bottom mb-2">
        <div v-if="selectedRow" class="col text-left">
          <h3>{{ selectedRow.Type }} {{ selectedRow.Identifier }}</h3>
        </div>
        <div v-if="selectedRow" class="navbar-text py-0">
          {{ selectedRow.IdentifierUUID }}
        </div>

        <button
          type="button"
          class="btn btn-outline-danger my-sm-0 m-2 py-0"
          @click="prout()"
        >
          save
        </button>
        <button
          type="button"
          class="btn btn-outline-primary my-0 my-sm-0 m-2 py-0"
          @click="$emit('removeOverlay')"
        >
          back
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary my-0 my-sm-0 m-2 py-0"
          @click="prout()"
        >
          settings
        </button>
      </div>

      <!--Formulaire-->

      <ul v-for="group in groups" :key="group" class="list-group">
        <li class="list-group-item accordion">
          <!-- attention gérer les langues -->
          {{ group.labels.fr }}
        </li>

        <div
          v-for="field in group.fields"
          :key="field"
          class="row align-items-start border-bottom my-1"
        >
          <div v-if="selectedRow" class="col-md-3">{{ field.field }}</div>
          <!--  V1  -->
          <!-- <input type="text" :value="selectedRow.Source" class="col-md-9 p-0 pl-1" style="border: none" />  -->

          <!-- <input type="text" :value="selectedRow['Source']" class="col-md-9 p-0 pl-1" style="border: none" /> -->
          <input
            v-if="selectedRow"
            type="text"
            :value="selectedRow[field.field]"
            class="col-md-9 p-0 pl-1"
            style="border: none"
          />
          <!-- <input type="text" :value="selectedValue" class="col-md-9 p-0 pl-1" style="border: none" /> -->
        </div>
      </ul>

      <!--Formulaire old-->
      <!-- <div
        v-for="(value, name) in selectedRow"
        :key="value.IdentifierUUID"
        class="row align-items-start border-bottom my-1"
      >
        <div class="col-md-3">{{ name }}</div>
                <input
          type="text"
          :value="value"
          class="col-md-9 p-0 pl-1"
          style="border: none"
        />
        
      </div> -->
      <p v-if="selectedRow">
        Version GIT: {{ selectedTrenches[selectedRow.Source] }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "over-lay",
  props: {
    selectedTrenches: {
      type: Object,
      required: false,
    },
    selectedRow: {
      type: Object,
      required: false,
    },
    selectedType: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      // selectedtype: "Artifact",
      groupByDefault: [
        {
          group: "General Section",
          labels: {
            de: "Allgemein",
            en: "General",
            fr: "Général",
            it: "Generale",
            el: "",
          },
          fields: [
            { field: "IdentifierUUID", isKey: true },
            { field: "Source" },
            { field: "Type" },
            {
              field: "Title",
              tips: {
                de: "Identifizierung des Objektes (z.B. Bronzemünze oder Ziegelfragment)",
                en: "Object Identification (Ex: Bronze coin or Tile fragment",
                fr: "Identification de l'objet (Ex: Monnaie en bronze ou Fragment de tuile)",
                it: "Identificazione del reperto (Es: Moneta in bronzo o frammento di tegola)",
                el: "",
              },
            },
            {
              field: "Identifier",
              labels: {
                de: "FK-Nr.",
                en: "FK-nr",
                fr: "FK-no",
                it: "FK-n.",
                el: "",
              },
              tips: {
                de: "Kontext-Nr. - fortlaufend-Nr. (z.B. 500-3). Objekte ohne exakten Fundort tragen lediglich die Kontext-Nr.",
                en: "Context nr - serial nr (Ex. 500-3). Artifacts without exact provenance have the context number only",
                fr: "No du contexte - no continu (Ex. 500-3). Les objets sans provenance exacte ont uniquement le numéro du contexte",
                it: "N. del contesto - n. continuo (Es. 500-3). I reperti senza un luogo di ritrovamento esatto, avranno unicamente il numero del contesto",
                el: "",
              },
            },
            {
              field: "DateEarliest",
              labels: {
                de: "Datum",
                en: "Date",
                fr: "Date",
                it: "Data",
                el: "",
              },
            },
          ],
        },
      ],
    };
  },
  computed: {
     selectedtype() {
      if (this.selectedType) {
        return this.selectedType;
      } else {
        return "Artifact";
      }
    },   
    // selectedValue() {
    //   if (this.selectedRow) {
    //     return this.selectedRow.Source;
    //   } else {
    //     return "NA";
    //   }
    // },

    // allgroups() {
    //   return JSON.parse(localStorage.types);
    // },

    groups() {
      if (localStorage.types) {
        return JSON.parse(localStorage.types).filter((x) => {
          return x.type.includes(this.selectedtype);
        })[0].groups;
      } else {
        return this.groupByDefault;
      }
    },
    filteredField() {
      return this.fields.filter((x) => {
        return x.type.includes(this.selectedFilter);
      })[0].groups[0].fields;
    },
    filtered() {
      return this.trenchdata.filter((object) => {
        return object.Type.includes(this.selectedFilter);
      });
    },
  },
  method: {},
};
</script>
<style scoped>
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
}
/* Style the buttons that are used to open and close the accordion panel */
.accordion {
  background-color: #eee;
  cursor: default;
  color: #444;
  padding: 5px;
  width: 100%;
  text-align: left;
  border: none;
  outline: none;
  transition: 0.4s;
}

/* Add a background color to the button if it is clicked on (add the .active class with JS), and when you move the mouse over it (hover) */
.active,
.accordion:hover {
  background-color: #eee;
}
</style>