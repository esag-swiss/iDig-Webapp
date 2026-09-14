<template>
  <div class="d-flex align-items-center plan-row">
    <BaseButton
      class="plan-row__star"
      icon-size="sm"
      :icon="favorite ? 'star' : 'star_border'"
      :class="favorite && 'plan-row__star--active'"
      :aria-label="$t('app.toggle_favorite')"
      @click="$emit('toggle-favorite')"
    />
    <BaseCheckbox
      class="plan-row__checkbox"
      :model-value="checked"
      :label="plan.title"
      @update:model-value="$emit('toggle-visible')"
    />
  </div>
</template>

<script>
import BaseCheckbox from "@/components/base/BaseCheckbox.vue";
import BaseButton from "@/components/base/BaseButton.vue";

export default {
  name: "MapLayerListItem",
  components: { BaseCheckbox, BaseButton },
  props: {
    plan: { type: Object, required: true },
    checked: { type: Boolean, default: false },
    favorite: { type: Boolean, default: false },
  },
  emits: ["toggle-visible", "toggle-favorite"],
};
</script>

<style scoped>
.plan-row {
  min-height: 32px;
  font-size: 0.85rem;
}
.plan-row__star {
  color: #999;
  padding: 6px !important;
  margin-right: 2px;
}
.plan-row__star--active {
  color: #f5b301;
}
.plan-row__checkbox {
  min-width: 0;
}
.plan-row__checkbox :deep(input) {
  width: 17px;
  height: 17px;
}
.plan-row__checkbox :deep(span) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
