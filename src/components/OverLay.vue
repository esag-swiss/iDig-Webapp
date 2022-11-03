<template>
  <div class="overlay justify-content-center" >
    <div id="overlay" class="center-block mx-auto p-3" style="height: auto; margin-top: 3%; margin-bottom: 3%; width: 90%; background: rgb(255, 255, 255);">

<!--header-->
<div class="row align-items-start  border-bottom mb-2">
  <div class="col" @click="$emit('removeOverlay')">
    &lt; Retour
  </div>
  <div v-if="selectedRow" class="col text-center">
    <h3>{{selectedRow.Type}} {{selectedRow.Identifier}}</h3>
  </div>
  <div class="col text-right">
    OK
  </div>
</div>

<!--Formulaire-->


<div v-for="(value, name) in selectedRow" :key="value.IdentifierUUID" class="row align-items-start  border-bottom my-1"  >

  <!--<label for="text" class="p-1 col-md-3">{{ name }}</label>-->
  <!--<input type="text" :value="value" class="p-1 col-md-9" />-->

  <div class="col-md-3">{{ name }}</div>
  <!-- Attention on dirait que l'input transforme les valeurs qui sont des arrays en enlevant automatiquement les crochets  -->
 <input type="text" :value="value" class="col-md-9 p-0 pl-1" style="border: none"/>
 <!-- <div class="col-md-5" >{{value}}</div> -->

</div>
<p v-if="selectedRow">
  Version GIT: {{ selectedTrenches[selectedRow.Source] }}
</p>


</div>
</div>
</template>

<script>
  // import preferencesData from "../data/AMA21-S24.Preferences.json";

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
    },
    data() {
      return {
        test: 'sdg',
        // headers: preferencesData.fields,
        //   fields: preferencesData.types,
      };
    },
    computed: {
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
    method: {
      removeOverlay2() {
        this.test = 'hhhh';
      },

    },
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
</style>