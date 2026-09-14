<template>
  <div class="map-layer-modal-content">
    <div class="px-1 pt-1">
      <input
        v-model="planSearchText"
        type="search"
        class="form-control form-control-sm map-layer-modal-content__search"
        :placeholder="$t('app.search_plans_placeholder')"
      />
    </div>

    <div
      class="px-1 pt-1 d-flex align-items-center map-layer-modal-content__groupby"
    >
      <span class="mr-2">{{ $t("app.group_by") }}:</span>
      <label
        v-for="option in groupByOptions"
        :key="option.value"
        class="mb-0 d-inline-flex align-items-center mr-2 cursor-pointer non-selectable"
      >
        <input
          v-model="groupBy"
          type="radio"
          name="plansGroupBy"
          class="mr-1"
          :value="option.value"
        />
        {{ option.label }}
      </label>
    </div>

    <div class="px-1 pt-1 pb-1 map-layer-modal-content__lists">
      <div v-if="filteredPlans.length === 0" class="text-muted small py-2">
        {{ $t("app.no_plans_found") }}
      </div>

      <MapLayerList
        v-if="favoritePlans.length > 0"
        :plans="favoritePlans"
        :visible-plan-ids="visiblePlanIds"
        :favorite-plan-ids="favoritePlanIds"
        :initial-open="true"
        :toggle-aria-label="$t('app.toggle_favorites')"
        @toggle-visible="toggleVisible"
        @toggle-favorite="toggleFavorite"
      >
        <template #title>
          <BaseIcon
            name="star"
            size="xs"
            class="mr-1 map-layer-modal-content__star"
          />
          {{ $t("app.favorites") }} ({{ favoritePlans.length }})
        </template>
      </MapLayerList>

      <template v-if="groupBy === 'flat'">
        <div v-for="plan in filteredPlans" :key="plan.id">
          <MapLayerListItem
            :plan="plan"
            :checked="isPlanVisible(plan)"
            :favorite="isFavorite(plan)"
            @toggle-visible="toggleVisible(plan)"
            @toggle-favorite="toggleFavorite(plan)"
          />
        </div>
      </template>
      <template v-else>
        <MapLayerList
          v-for="group in groupedPlans"
          :key="group.name"
          :plans="group.plans"
          :visible-plan-ids="visiblePlanIds"
          :favorite-plan-ids="favoritePlanIds"
          :checkbox-label="`${group.name} (${group.plans.length})`"
          :initial-open="groupedPlans.length === 1"
          :toggle-aria-label="$t('app.toggle_group', { name: group.name })"
          @toggle-visible="toggleVisible"
          @toggle-favorite="toggleFavorite"
          @toggle-group="(checked) => toggleGroup(group.plans, checked)"
        />
      </template>
    </div>
  </div>
</template>

<script>
import BaseIcon from "@/components/base/BaseIcon.vue";
import MapLayerList from "@/components/MapLayerList.vue";
import MapLayerListItem from "@/components/MapLayerListItem.vue";
import {
  lsLoadFavoritePlans,
  lsStoreFavoritePlans,
  lsLoadPlansGroupBy,
  lsStorePlansGroupBy,
} from "@/services/localStorageManager";
import { normalizeForSearch } from "@/services/helpers/textHelper";

export default {
  name: "TheMapLayerModalContent",
  components: { BaseIcon, MapLayerList, MapLayerListItem },
  props: {
    plans: { type: Array, required: true },
    visiblePlanIds: { type: Array, required: true },
  },
  emits: ["toggle-visible"],
  data() {
    return {
      planSearchText: "",
      groupBy: lsLoadPlansGroupBy(),
      favoritePlanIds: lsLoadFavoritePlans(),
      groupByOptions: [
        { value: "trench", label: this.$t("app.group_by_trench") },
        { value: "date", label: this.$t("app.group_by_date") },
        { value: "flat", label: this.$t("app.group_by_flat") },
      ],
    };
  },
  computed: {
    filteredPlans() {
      const searchText = normalizeForSearch(this.planSearchText.trim());
      if (searchText === "") {
        return this.plans;
      }
      return this.plans.filter(
        (plan) =>
          normalizeForSearch(plan.title).includes(searchText) ||
          normalizeForSearch(plan.trench).includes(searchText),
      );
    },
    favoritePlans() {
      return this.filteredPlans.filter((plan) => this.isFavorite(plan));
    },
    groupedPlans() {
      const groups = {};

      for (const plan of this.filteredPlans) {
        const groupName = this.groupNameFor(plan);
        if (!groups[groupName]) {
          groups[groupName] = { name: groupName, plans: [] };
        }
        groups[groupName].plans.push(plan);
      }

      return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
    },
  },
  watch: {
    groupBy(newGroupBy) {
      lsStorePlansGroupBy(newGroupBy);
    },
  },
  methods: {
    groupNameFor(plan) {
      if (this.groupBy === "date") {
        return plan.dateEarliest
          ? plan.dateEarliest.slice(0, 10)
          : this.$t("app.no_date");
      }
      // default: group by trench
      return plan.trench || this.$t("app.no_trench");
    },
    isPlanVisible(plan) {
      return this.visiblePlanIds.includes(plan.id);
    },
    isFavorite(plan) {
      return this.favoritePlanIds.includes(plan.id);
    },
    toggleVisible(plan) {
      this.$emit("toggle-visible", plan);
    },
    toggleGroup(groupPlans, checked) {
      groupPlans
        .filter((plan) => this.isPlanVisible(plan) !== checked)
        .forEach((plan) => this.toggleVisible(plan));
    },
    toggleFavorite(plan) {
      const favoriteSet = new Set(this.favoritePlanIds);
      if (favoriteSet.has(plan.id)) {
        favoriteSet.delete(plan.id);
      } else {
        favoriteSet.add(plan.id);
      }
      this.favoritePlanIds = [...favoriteSet];
      lsStoreFavoritePlans(this.favoritePlanIds);
    },
  },
};
</script>

<style scoped>
.map-layer-modal-content {
  width: 280px;
  max-height: 70vh;
  overflow-y: auto;
  background: white;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
}
.map-layer-modal-content__search {
  width: 100%;
}
.map-layer-modal-content__groupby {
  font-size: 0.85rem;
  flex-wrap: wrap;
}
.map-layer-modal-content__star {
  color: #f5b301;
}
</style>
