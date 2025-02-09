<template>
  <q-input
    v-if="editMode"
    v-model="currentItem[field.field]"
    filled
    type="textarea"
    class="col-12 p-0 border-none"
  />

  <div v-else>{{ currentItem[field.field] }}</div>
</template>

<script>
export default {
  name: "TheItemMultiline",
  props: {
    field: Object,
    currentItem: Object,
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
