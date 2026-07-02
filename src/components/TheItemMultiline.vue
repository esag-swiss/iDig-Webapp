<template>
  <!-- eslint-disable vue/no-mutating-props -->
  <q-input
    v-if="editMode"
    v-model="currentItem[field.field]"
    filled
    type="textarea"
    class="col-12 p-0 border-none"
  />
  <!-- eslint-enable vue/no-mutating-props -->

  <div v-else>{{ currentItem[field.field] }}</div>
</template>

<script>
export default {
  name: "TheItemMultiline",
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
    return {};
  },
  computed: {},
  methods: {},
};
</script>

<style scoped></style>
