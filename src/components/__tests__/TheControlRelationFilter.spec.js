import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { useDataStore } from "@/stores/data";
import TheControlRelationFilter from "@/components/TheControlRelationFilter.vue";

function mountComponent() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const wrapper = mount(TheControlRelationFilter, {
    global: {
      plugins: [pinia],
      mocks: { $t: (key) => key },
      stubs: { "q-input": true, "q-tooltip": true },
    },
  });
  return { wrapper, store: useDataStore() };
}

describe("TheControlRelationFilter", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("should dispatch a relation filter when all fields are set", () => {
    const { wrapper, store } = mountComponent();
    wrapper.vm.relation = "RelationBelongsToUUID";
    wrapper.vm.property = "Phase";
    wrapper.vm.value = "Use";
    wrapper.vm.emitFilter();
    expect(store.relationFilter).toEqual({
      relation: "RelationBelongsToUUID",
      property: "Phase",
      value: "Use",
    });
  });

  it("should dispatch null when the value is empty", () => {
    const { wrapper, store } = mountComponent();
    wrapper.vm.relation = "RelationBelongsToUUID";
    wrapper.vm.property = "Phase";
    wrapper.vm.value = "";
    wrapper.vm.emitFilter();
    expect(store.relationFilter).toBeNull();
  });

  it("should dispatch null when clearing the value", () => {
    const { wrapper, store } = mountComponent();
    wrapper.vm.relation = "RelationBelongsToUUID";
    wrapper.vm.property = "Phase";
    wrapper.vm.value = "Use";
    wrapper.vm.emitFilter();
    wrapper.vm.clearValue();
    expect(wrapper.vm.value).toBe("");
    expect(store.relationFilter).toBeNull();
  });
});
