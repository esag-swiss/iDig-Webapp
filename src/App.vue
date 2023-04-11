<template>
  <TheSpinner></TheSpinner>

  <!-- header -->
  <HeaderIdig @toggle-menu="toggleMenu"> </HeaderIdig>

  <div v-if="appState.isLoaded" class="container-fluid">
    <div class="row flex-xl-nowrap">
      <!-- SIDEBAR -->
      <div class="p-1 col-md-2" :style="{ display: computedDisplay }">
        <div class="sticky-top">
          <AccessIdig @selected-trench="selectedTrench"> </AccessIdig>

          <FilterFields
            :selectedData="selectedData"
            @check-fields="checkFields"
            @selected-type="selectedType"
          >
          </FilterFields>
        </div>
      </div>

      <!-- MAIN FRAME The map or tab goes here -->
      <div
        class="p-1"
        :class="{ 'col-md-10': isHidden, 'col-md-12': !isHidden }"
      >
        <DynaTable
          v-if="trenchData !== null"
          :selectedData="selectedData"
          :checkedFields="checkedFields"
          :selectedType="selectedFilter"
        >
        </DynaTable>
        <div v-else class="d-flex justify-content-center mt-5">
          Veuillez sélectionner une ou plusieurs tranches
        </div>
      </div>
    </div>
  </div>

  <div v-else class="d-flex justify-content-center mt-5">
    Veuillez vous connecter
  </div>
</template>

<script>
import AccessIdig from "@/components/AccessIdig.vue";
import HeaderIdig from "@/components/HeaderIdig.vue";
import FilterFields from "@/components/FilterFields.vue";
import DynaTable from "@/components/DynaTable.vue";
import { useAppState } from "@/services/useAppState";
import TheSpinner from "@/components/TheSpinner.vue";

export default {
  name: "App",
  components: {
    TheSpinner,
    AccessIdig,
    FilterFields,
    DynaTable,
    HeaderIdig,
  },
  setup() {
    const { appState } = useAppState();
    return { appState };
  },
  data() {
    return {
      isHidden: true,
      display: "block",
      class: true,
      trenchData: null,
      selectedFilter: "Artifact", // type by default
      checkedFields: [
        // columns by default before any selection /!\ label needed to display headers
        { field: "Source", sortable: true, label: "Secteur" },
        { field: "Title", sortable: true, label: "Titre" },
        {
          field: "Identifier",
          isKey: true,
          sortable: true,
          label: "Identifiant",
        },
      ],
    };
  },
  computed: {
    selectedData() {
      return this.trenchData?.filter((object) => {
        return object.Type.includes(this.selectedFilter);
      });
    },
    computedDisplay() {
      return this.display;
    },
  },
  methods: {
    toggleMenu() {
      //a simplifier avec :class
      if (this.display == "none") {
        this.display = "block";
      } else {
        this.display = "none";
      }
      this.isHidden = !this.isHidden;
    },
    selectedTrench(trench) {
      this.trenchData = trench;
    },
    selectedType(type) {
      this.selectedFilter = type;
    },
    checkFields(emited) {
      this.checkedFields = emited;
    },
  },
};
</script>

<style>
#app h3 {
  font-size: 1.3rem;
}
</style>
