<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <q-toggle
    v-model="currentItem[field.field]"
    false-value="0"
    true-value="1"
    color="green"
    :disable="disable"
  />
  <!-- eslint-enable vue/no-mutating-props -->
</template>

<script>
export default {
  name: "TheItemBoolean",
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
  methods: {},
};
</script>

<style scoped>
/* Styles spécifiques au composant enfant */
</style>
