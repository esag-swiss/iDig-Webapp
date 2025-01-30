<template>
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
</template>

<script>
import { fieldsSchema } from "@/assets/nativeFields";
export default {
  name: "TheItemBoolean",
  props: {
    field: Object,
    currentItem: Object,
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
