<template>
  <q-chip
    v-for="item in itemsInChips(currentItem[field.field])"
    clickable
    @click="$emit('update:currentItem', item.fullItem)"
    :key="item"
    color="primary"
    text-color="white"
    class="q-chip"
  >
    {{ item.chipText }}
  </q-chip>
</template>

<script>
import { mapState } from "pinia";
import { useDataStore } from "@/stores/data";

export default {
  name: "TheItemLink",
  props: {
    field: Object,
    currentItem: {
      type: Object,
      required: true,
    },
    editMode: Boolean,
  },
  data() {
    return {};
  },
  computed: {
    ...mapState(useDataStore, [
      "checkedTrenchesData",
      "projectPreferencesTypesTranslation",
    ]),
  },
  methods: {
    itemsInChips(IdentifierUUIDs) {
      if (IdentifierUUIDs && IdentifierUUIDs.includes("\n")) {
        let relatedItems = IdentifierUUIDs.split("\n");
        relatedItems = relatedItems.map((obj) => this.chipText(obj));
        return relatedItems;
      } else if (IdentifierUUIDs) {
        return [this.chipText(IdentifierUUIDs)];
      } else {
        return [];
      }
    },
    chipText(IdentifierUUID) {
      const filteredItems = this.checkedTrenchesData[
        this.currentItem.Trench
      ].filter((x) => x.IdentifierUUID.includes(IdentifierUUID));

      if (filteredItems.length > 0) {
        const item = filteredItems[0];
        return {
          chipText:
            this.projectPreferencesTypesTranslation[item.Type] +
            ": " +
            item.Title,
          fullItem: item,
        };
      }

      return {
        chipText: "Unknown Item", // Valeur par défaut si aucun élément correspondant n'est trouvé
        fullItem: null,
      };
    },
  },
};
</script>

<style scoped></style>
