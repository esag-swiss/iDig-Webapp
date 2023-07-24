<template>
  <TheSpinner></TheSpinner>

  <!-- HEADER -->
  <TheHeader class="sticky-top"></TheHeader>

  <div class="container-fluid">
    <div v-if="appState.isLoaded" class="row">
      <!-- SIDEBAR -->
      <nav class="col-md-2 d-none d-md-block bg-light sidebar">
        <div class="sidebar-sticky hidescrollbar p-1">
          <TheControlTrenches
            ref="controlTrenches"
            @selected-trench="selectedTrench"
          >
          </TheControlTrenches>

          <TheControlFields> </TheControlFields>
          <TheControlExport :filteredTrenchesItems="filteredTrenchesItems">
          </TheControlExport>
        </div>
      </nav>

      <!-- MAIN FRAME The map or tab goes here -->
      <div class="col-md-10 ml-sm-auto col-lg-10 pt-3 px-4">
        <TheTable
          v-if="checkedTrenchesData !== null"
          :filteredTrenchesItems="filteredTrenchesItems"
        >
        </TheTable>
        <div v-else class="d-flex justify-content-center mt-5">
          Veuillez sélectionner au moins un secteur
        </div>
      </div>
    </div>
    <div v-else class="d-flex justify-content-center mt-5">
      Veuillez vous connecter
    </div>
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
    reload() {
      this.$refs.controlTrenches.fetchAllTrenchesData();
    },
  },
};
</script>

<style>
#app h3 {
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 0rem;
}
/*
* form https://getbootstrap.com/docs/4.0/examples/dashboard/#
*/
/*
 * Sidebar 
 */

.sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 100; /* Behind the navbar */
  padding: 0;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.1);
}

.sidebar-sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 48px; /* Height of navbar */
  height: calc(100vh - 48px);
  padding-top: 0.5rem;
  overflow-x: hidden;
  overflow-y: auto; /* Scrollable contents if viewport is shorter than content. */
}

.sidebar .nav-link {
  font-weight: 500;
  color: #333;
}

.sidebar .nav-link .feather {
  margin-right: 4px;
  color: #999;
}

.sidebar .nav-link.active {
  color: #007bff;
}

.sidebar .nav-link:hover .feather,
.sidebar .nav-link.active .feather {
  color: inherit;
}

.sidebar-heading {
  font-size: 0.75rem;
  text-transform: uppercase;
}

/*
 * Navbar
 */

.navbar-brand {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  font-size: 1rem;
  background-color: rgba(0, 0, 0, 0.25);
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.25);
}

.navbar .form-control {
  padding: 0.75rem 1rem;
  border-width: 0;
  border-radius: 0;
}

.form-control-dark {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
}

.form-control-dark:focus {
  border-color: transparent;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.25);
}

/*
 * Utilities
 */

.border-top {
  border-top: 1px solid #e5e5e5;
}
.border-bottom {
  border-bottom: 1px solid #e5e5e5;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.hidescrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.hidescrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
