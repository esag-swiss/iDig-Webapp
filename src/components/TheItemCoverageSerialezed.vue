<template>
  <div class="col-12 p-1">
    <q-input
      v-if="editMode"
      v-model="coordinateText"
      type="textarea"
      autogrow
      square
      filled
      dense
      clearable
      class="coverage-editor"
      :label="editLabel"
      :error="Boolean(parseError)"
      :error-message="parseError"
      placeholder="P1 100.000 200.000 12.345"
      @update:model-value="updateCoverageSerialized"
      @clear="clearCoverageSerialized"
    />
    <div v-else>
      {{ determineTypeGeo(currentItem[field.field]) }}
    </div>
  </div>
</template>

<script>
import { mapState } from "pinia";
import { determineGeoType } from "@/services/json2geojson";
import {
  coverageSerializedToProjectText,
  projectTextToCoverageSerialized,
} from "@/services/coverageSerialized";
import { useDataStore } from "@/stores/data";

export default {
  name: "TheItemCoverageSerialezed",
  props: {
    field: {
      type: Object,
      required: true,
    },
    currentItem: {
      type: Object,
      required: true,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      coordinateText: "",
      parseError: "",
      isApplyingText: false,
      coverageTemplate: "",
    };
  },
  computed: {
    ...mapState(useDataStore, ["projectPreferencesCRS"]),

    coverageSerialized() {
      return this.currentItem[this.field.field] || "";
    },

    editLabel() {
      return `Coordonnees (${this.projectPreferencesCRS || "CRS projet"})`;
    },
  },
  watch: {
    editMode: {
      immediate: true,
      handler(isEditing) {
        if (isEditing) {
          this.resetCoordinateText();
        }
      },
    },

    coverageSerialized() {
      if (this.isApplyingText) {
        this.isApplyingText = false;
        return;
      }

      this.resetCoordinateText();
    },
  },
  methods: {
    determineTypeGeo(e) {
      if (e) {
        return determineGeoType(e);
      }
      return null;
    },

    resetCoordinateText() {
      this.coverageTemplate = this.coverageSerialized;
      this.coordinateText = coverageSerializedToProjectText(
        this.coverageSerialized,
      );
      this.parseError = "";
    },

    updateCoverageSerialized(value) {
      const result = projectTextToCoverageSerialized(
        value,
        this.coverageTemplate,
      );

      if (!result.ok) {
        this.parseError = result.error;
        return;
      }

      this.parseError = "";
      this.isApplyingText = true;
      // eslint-disable-next-line vue/no-mutating-props
      this.currentItem[this.field.field] = result.value;
    },

    clearCoverageSerialized() {
      this.coordinateText = "";
      this.parseError = "";
      this.coverageTemplate = "";
      this.isApplyingText = true;
      // eslint-disable-next-line vue/no-mutating-props
      this.currentItem[this.field.field] = "";
    },
  },
};
</script>

<style scoped>
.coverage-editor :deep(textarea) {
  font-family: monospace;
}
</style>
