<template>
  <div>
    {{ format_date(currentItem[field.field]) }}
  </div>
</template>

<script>
import dayjs from "dayjs";
export default {
  name: "TheItemDateUTC",
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
