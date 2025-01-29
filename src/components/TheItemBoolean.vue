<template>
  <div class="col-12 p-1">
    <q-toggle
      v-model="currentItem[field.field]"
      false-value="0"
      true-value="1"
      color="green"
      :disable="disable"
    />
  </div>
</template>

<script>
export default {
  name: "TheItemBoolean",
  props: {
    field: Object,
    currentItem: Object,
    disable: Boolean,
  },
  methods: {},
};
</script>

<style scoped>
/* Styles spécifiques au composant enfant */
</style>
