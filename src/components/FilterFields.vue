<template>
  <div class="bg-light border border-grey rounded">
    <h3 class="mt-1">Fields for {{ selectedFilter }}</h3>
    <ul v-for="type in fieldsByType" :key="type" class="list-group " >
      <li class="list-group-item accordion" v-on:click="isHidden = !isHidden">{{ type.group }}</li>
      <div v-if="!isHidden">
      <div
        v-for="field in type.fields"
        :key="field"
        @change="check()"
        class="mt-1"
      >
       <label for="checkbox">{{ field.field }}</label>
       <input type="checkbox" v-model="checkFields" :value="field"/>
       
      </div>
      </div>
    </ul>
  </div>
</template>

<script>
import preferencesData from "../components/AMA21-S24.Preferences.json";

export default {
  data() {
    return {
      fields: preferencesData.types,
      checkFields: [  { "field": "Source" }, { "field": "Type" }, { "field": "Identifier", "labels": { "de": "FK-Nr.", "en": "FK-nr", "fr": "FK-no", "it": "FK-n.", "el": "" }, "tips": { "de": "Kontext-Nr. - fortlaufend-Nr. (z.B. 500-3). Objekte ohne exakten Fundort tragen lediglich die Kontext-Nr.", "en": "Context nr - serial nr (Ex. 500-3). Artifacts without exact provenance have the context number only", "fr": "No du contexte - no continu (Ex. 500-3). Les objets sans provenance exacte ont uniquement le numéro du contexte", "it": "N. del contesto - n. continuo (Es. 500-3). I reperti senza un luogo di ritrovamento esatto, avranno unicamente il numero del contesto", "el": "" } }],
      isHidden: true
    };
  },
  computed: {
    fieldsByType() {
      return this.fields.filter((field) => {
        return field.type.includes(this.selectedFilter);
      })[0].groups;
    },
  },
  methods: {
    check() {
      console.log(this.checkFields),
      // reçoit du @change et renvoie au parent
      this.$emit("check-fields", this.checkFields);
    },
    //on peut aussi ecrire la méthode ainsi
    check2: function (e) {
      console.log(e);
    },
  },
  props: {
    selectedFilter: {
      type: String,
      required: false,
    },
  },
};
</script>

<style>
/* Style the buttons that are used to open and close the accordion panel */
.accordion {
  background-color: #eee;
  color: #444;
  cursor: pointer;
  padding: 18px;
  width: 100%;
  text-align: left;
  border: none;
  outline: none;
  transition: 0.4s;
}

/* Add a background color to the button if it is clicked on (add the .active class with JS), and when you move the mouse over it (hover) */
.active, .accordion:hover {
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