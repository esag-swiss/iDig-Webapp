<template>
  <!-- eslint-disable vue/no-mutating-props -->
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
  <!-- eslint-enable vue/no-mutating-props -->

  <div v-else>{{ currentItem[field.field] }}</div>
</template>

<script>
export default {
  name: "TheItemInput",
  props: {
    field: {
      type: Object,
      required: true,
    },
    currentItem: {
      type: Object,
      required: true,
    },
    editMode: Boolean,
  },
  data() {
    return {
      previousValue: null,
    };
  },
  mounted() {
    this.previousValue = this.currentItem[this.field.field];
  },
  methods: {},
};
</script>

<style scoped>
/* Styles spécifiques au composant enfant */
</style>
