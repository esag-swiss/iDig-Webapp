<template>
  <q-icon :name="name" :size="size || undefined" />
</template>

<script>
export default {
  name: "BaseIcon",
  props: {
    name: { type: String, required: true },
    size: { type: String, default: "" },
  },
};
</script>
