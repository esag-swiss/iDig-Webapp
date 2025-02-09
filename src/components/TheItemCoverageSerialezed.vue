<template>
  <div class="col-12 p-1">
    <div>
      {{ determineTypeGeo(currentItem[field.field]) }}
    </div>
  </div>
</template>

<script>
import { determineGeoType } from "@/services/json2geojson";
export default {
  name: "TheItemCoverageSerialezed",
  props: {
    field: Object,
    currentItem: Object,
  },
  methods: {
    determineTypeGeo(e) {
      if (e) {
        return determineGeoType(e);
      } else {
        return null;
      }
    },
  },
};
</script>

<style scoped>
/* Styles spécifiques au composant enfant */
</style>
