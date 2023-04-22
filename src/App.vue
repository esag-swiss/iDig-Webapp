<template>
  <TheSpinner></TheSpinner>

  <!-- header -->
  <TheHeader> </TheHeader>

  <div v-if="appState.isLoaded" class="container-fluid">
    <div class="row flex-xl-nowrap">
      <!-- SIDEBAR -->
      <div class="p-1 col-md-2" :style="{ display: computedDisplay }">
        <div class="sticky-top">
          <TheControlTrenches @selected-trench="selectedTrench">
          </TheControlTrenches>

          <TheControlFields
            :selectedData="selectedData"
            @check-fields="checkFields"
            @selected-type="selectedType"
          >
          </TheControlFields>
          <TheControlExport
            :selectedData="selectedData"
            :selectedType="selectedFilter"
          >
          </TheControlExport>
        </div>
      </div>

      <!-- MAIN FRAME The map or tab goes here -->
      <div
        class="p-1"
        :class="{ 'col-md-10': isHidden, 'col-md-12': !isHidden }"
      >
        <TheTable
          v-if="trenchData !== null"
          :selectedData="selectedData"
          :checkedFields="checkedFields"
          :selectedType="selectedFilter"
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
      if (this.trenchData) {
        return this.trenchData?.filter((object) => {
          return object.Type.includes(this.selectedFilter);
        });
      } else {
        return {};
      }
    },
    computedDisplay() {
      return this.display;
    },
  },
  methods: {
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
