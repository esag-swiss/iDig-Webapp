<template>
  <div class="base-image-gallery">
    <div
      v-if="images.length > 0"
      class="base-image-gallery__grid"
      data-test="gallery-grid"
    >
      <button
        v-for="(url, index) in images"
        :key="index"
        type="button"
        class="base-image-gallery__thumb-btn"
        data-test="gallery-thumb"
        :aria-label="`${openLabel} ${index + 1}`"
        @click="open(index)"
      >
        <img
          :src="url"
          :alt="`${imageLabel} ${index + 1}`"
          class="base-image-gallery__thumb"
        />
      </button>
    </div>

    <div
      v-if="selectedIndex !== null"
      class="base-image-gallery__overlay"
      data-test="gallery-overlay"
      @click="close"
    >
      <BaseButton
        icon="west"
        icon-size="3rem"
        :aria-label="previousLabel"
        class="base-image-gallery__nav base-image-gallery__nav--prev"
        data-test="gallery-prev"
        @click.stop="previous"
      />
      <img
        :src="images[selectedIndex]"
        :alt="`${imageLabel} ${selectedIndex + 1}`"
        class="base-image-gallery__full"
        data-test="gallery-full-image"
      />
      <BaseButton
        icon="east"
        icon-size="3rem"
        :aria-label="nextLabel"
        class="base-image-gallery__nav base-image-gallery__nav--next"
        data-test="gallery-next"
        @click.stop="next"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from "vue";
import BaseButton from "@/components/base/BaseButton.vue";

const props = defineProps({
  images: { type: Array, default: () => [] },
  imageLabel: { type: String, default: "Image" },
  openLabel: { type: String, default: "Open image" },
  previousLabel: { type: String, default: "Previous image" },
  nextLabel: { type: String, default: "Next image" },
});

const selectedIndex = ref(null);

function open(index) {
  selectedIndex.value = index;
}

function close() {
  selectedIndex.value = null;
}

function previous() {
  selectedIndex.value =
    (selectedIndex.value - 1 + props.images.length) % props.images.length;
}

function next() {
  selectedIndex.value = (selectedIndex.value + 1) % props.images.length;
}

function onKeydown(event) {
  if (event.key === "ArrowLeft") {
    previous();
  } else if (event.key === "ArrowRight") {
    next();
  } else if (event.key === "Escape") {
    close();
  }
}

watch(selectedIndex, (index) => {
  if (index !== null) {
    window.addEventListener("keydown", onKeydown);
  } else {
    window.removeEventListener("keydown", onKeydown);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>

<style scoped>
.base-image-gallery__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  max-width: 100%;
}
.base-image-gallery__thumb-btn {
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}
.base-image-gallery__thumb {
  max-width: 100px;
}
.base-image-gallery__thumb:hover {
  border: 2px solid #5b5d5f;
}
.base-image-gallery__overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  cursor: pointer;
}
.base-image-gallery__full {
  max-width: 90%;
  max-height: 90%;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
.base-image-gallery__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  padding: 0.5rem !important;
  border: 2px solid #fff !important;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.4) !important;
}
.base-image-gallery__nav--prev {
  left: 1.5rem;
}
.base-image-gallery__nav--next {
  right: 1.5rem;
}
.base-image-gallery__nav:hover {
  background-color: rgba(255, 255, 255, 0.2) !important;
}
</style>
