<template>
  <div class="col-12 p-1">
    <q-input
    v-if="editMode"
    v-model="currentItem[field.field]"
    square
    filled
    dense
    :clearable="currentItem[field.field] !== previousValue"
    :label="previousValue !== currentItem[field.field] ? previousValue : ''"
    @clear="currentItem[field.field] = previousValue"
  />
    <div v-else>
      {{ determineTypeGeo(currentItem[field.field]) }}
    </div>
  </div>
</template>

<script>
import { determineGeoType } from "@/services/json2geojson";
export default {
  name: "TheItemCoverageSerialezed",
  props: {
    field: {
      type: Object,
      required: true,
    },
    currentItem: {
      type: Object,
      required: true,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
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
