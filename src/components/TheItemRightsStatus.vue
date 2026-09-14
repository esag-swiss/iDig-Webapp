<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <q-select
    v-model="currentItem[field.field]"
    dense
    options-dense
    filled
    :options="fieldsSchema.RightsStatus.valuelists"
    option-value="en"
    option-label="fr"
    :disable="disable"
    emit-value
    map-options
    class="select"
  />
  <!-- eslint-enable vue/no-mutating-props -->
</template>

<script>
import { fieldsSchema } from "@/assets/nativeFields";
export default {
  name: "TheItemRightsStatus",
  props: {
    field: {
      type: Object,
      required: true,
    },
    currentItem: {
      type: Object,
      required: true,
    },
    disable: Boolean,
  },
  data() {
    return {
      fieldsSchema: fieldsSchema,
    };
  },
  methods: {},
};
</script>

<style scoped>
/* Styles spécifiques au composant enfant */
</style>
