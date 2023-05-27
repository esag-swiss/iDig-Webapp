<template>
  <TheSpinner></TheSpinner>

  <!-- header -->
  <TheHeader> </TheHeader>

  <div v-if="appState.isLoaded" class="container-fluid">
    <div class="row flex-xl-nowrap">
      <!-- SIDEBAR -->
      <div class="p-1 col-md-2">
        <div class="sticky-top">
          <TheControlTrenches
            ref="controlTrenches"
            @selected-trench="selectedTrench"
          >
          </TheControlTrenches>

          <TheControlFields @check-fields="checkFields"> </TheControlFields>
          <TheControlExport :filteredTrenchesItems="filteredTrenchesItems">
          </TheControlExport>
        </div>
      </div>

      <!-- MAIN FRAME The map or tab goes here -->
      <div class="p-1 col-md-10">
        <TheTable
          v-if="checkedTrenchesData !== null"
          :filteredTrenchesItems="filteredTrenchesItems"
          :checkedFields="checkedFields"
          :selectedType="selectedType"
        >
        </TheTable>
        <div v-else class="d-flex justify-content-center mt-5">
          Veuillez sélectionner au moins un secteur
        </div>
      </div>
    </div>
  </div>

  <div v-else class="d-flex justify-content-center mt-5">
    Veuillez vous connecter
  </div>
</template>

<script>
import TheControlTrenches from "@/components/TheControlTrenches.vue";
import TheHeader from "@/components/TheHeader.vue";
import TheControlFields from "@/components/TheControlFields.vue";
import TheTable from "@/components/TheTable.vue";
import { useAppState } from "@/services/useAppState";
import { useDataState } from "@/services/useDataState";
import TheSpinner from "@/components/TheSpinner.vue";
import TheControlExport from "@/components/TheControlExport.vue";

export default {
  name: "App",
  components: {
    TheSpinner,
    TheControlTrenches,
    TheControlFields,
    TheTable,
    TheHeader,
    TheControlExport,
  },
  setup() {
    const { appState } = useAppState();
    const { selectedType } = useDataState();
    return { appState, selectedType };
  },
  data() {
    return {
      checkedTrenchesData: null,
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
    filteredTrenchesItems() {
      if (this.checkedTrenchesData) {
        return this.checkedTrenchesData.filter((object) => {
          return object.Type.includes(this.selectedType);
        });
      } else {
        return {};
      }
    },
  },
  methods: {
    selectedTrench(trench) {
      this.checkedTrenchesData = trench;
    },
    checkFields(emited) {
      this.checkedFields = emited;
    },
    reload() {
      this.$refs.controlTrenches.fetchAllTrenchesData();
    },
  },
};
</script>

<style>
#app h3 {
  font-size: 1.3rem;
}
</style>
