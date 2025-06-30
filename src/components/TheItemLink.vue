<template>
  <q-chip
    v-for="item in itemsInChips(currentItem[field.field])"
    clickable
    @click="setSelectedItem(item.fullItem)"
    :key="item"
    color="primary"
    text-color="white"
    class="q-chip"
  >
    {{ item.chipText }}
  </q-chip>
</template>

<script>
import { useDataStore } from "@/stores/data";
import { mapActions, mapState } from "pinia";

export default {
  name: "TheItemLink",
  inheritAttrs: false,
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
  computed: {
    ...mapState(useDataStore, [
      "checkedTrenchesData",
      "projectPreferencesTypesTranslation",
      "selectedItem",
    ]),
  },

  methods: {
    ...mapActions(useDataStore, ["setSelectedItem"]),
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
            (this.projectPreferencesTypesTranslation[item.Subtype] ??
              this.projectPreferencesTypesTranslation[item.Type]) +
            " " +
            item.Identifier +
            " : " +
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

<style scoped>
.q-chip {
  /* max-width: 200px; Limite la largeur */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Affiche des points de suspension si le texte est trop long */
}
</style>
