<template>
  <div>
    {{ format_date(currentItem[field.field]) }}
  </div>
</template>

<script>
import dayjs from "dayjs";
export default {
  name: "TheItemBoolean",
  props: {
    field: Object,
    currentItem: Object,
    editMode: Boolean,
  },
  data() {
    return {};
  },
  computed: {},
  methods: {
    format_date(value) {
      if (value) {
        return dayjs(value).format("DD/MM/YYYY");
      }
    },
  },
};
</script>

<style scoped></style>
