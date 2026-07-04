<template>
  <div class="base-photo-uploader">
    <q-file
      v-model="selectedFiles"
      :label="label"
      :accept="accept"
      :multiple="multiple"
      outlined
      dense
      data-test="photo-file-input"
      @update:model-value="onSelect"
    >
      <template #prepend>
        <BaseIcon name="add_a_photo" />
      </template>
    </q-file>

    <div
      v-if="photos.length > 0"
      class="base-photo-uploader__grid q-mt-sm"
      data-test="photo-grid"
    >
      <div
        v-for="photo in photos"
        :key="photo.name"
        class="base-photo-uploader__item"
      >
        <img
          :src="photo.url"
          :alt="photo.name"
          class="base-photo-uploader__thumb"
          data-test="photo-thumb"
        />
        <BaseButton
          icon="close"
          icon-size="xs"
          :aria-label="`${removeLabel} ${photo.name}`"
          class="base-photo-uploader__remove"
          data-test="photo-remove"
          @click="emit('remove', photo.name)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import BaseButton from "@/components/base/BaseButton.vue";
import BaseIcon from "@/components/base/BaseIcon.vue";

defineProps({
  photos: { type: Array, default: () => [] },
  label: { type: String, default: "" },
  accept: { type: String, default: "image/*" },
  multiple: { type: Boolean, default: false },
  removeLabel: { type: String, default: "Remove" },
});

const emit = defineEmits(["add", "remove"]);

const selectedFiles = ref(null);

function onSelect(files) {
  if (!files) {
    return;
  }
  emit("add", Array.isArray(files) ? files : [files]);
  selectedFiles.value = null;
}
</script>

<style scoped>
.base-photo-uploader__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  max-width: 100%;
}
.base-photo-uploader__item {
  position: relative;
  display: inline-block;
}
.base-photo-uploader__thumb {
  max-width: 100px;
}
.base-photo-uploader__remove {
  position: absolute;
  top: 2px;
  right: 2px;
  color: #c10015;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}
</style>
