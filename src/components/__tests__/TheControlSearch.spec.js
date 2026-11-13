import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import TheControlSearch from "@/components/TheControlSearch.vue";
import { useDataStore } from "@/stores/data";

function mountComponent() {
  const pinia = createPinia();
  setActivePinia(pinia);
  const store = useDataStore(pinia);
  const wrapper = mount(TheControlSearch, {
    global: {
      plugins: [pinia],
      mocks: { $t: (key) => key },
      stubs: {
        "q-btn-toggle": true,
        "q-input": true,
        "q-tooltip": true,
      },
    },
  });
  return { wrapper, store };
}

describe("TheControlSearch", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should default to basic mode", () => {
    const { store } = mountComponent();
    expect(store.searchMode).toBe("basic");
  });

  it("should switch to expert mode and reset the query on toggle", () => {
    const { wrapper, store } = mountComponent();
    const setSearchText = vi.spyOn(store, "setSearchText");
    wrapper.vm.onModeChange("expert");
    expect(store.searchMode).toBe("expert");
    expect(setSearchText).toHaveBeenCalledWith("");
  });

  it("should show an inline error and not commit an invalid expert expression", () => {
    const { wrapper, store } = mountComponent();
    store.setSearchMode("expert");
    const setSearchText = vi.spyOn(store, "setSearchText");
    wrapper.vm.onInput("[?RightsStatus==]");
    expect(wrapper.vm.expertError).toBeTruthy();
    expect(setSearchText).not.toHaveBeenCalled();
  });

  it("should commit a valid expert expression and clear the error", () => {
    const { wrapper, store } = mountComponent();
    store.setSearchMode("expert");
    const setSearchText = vi.spyOn(store, "setSearchText");
    wrapper.vm.onInput("[?Type=='Context']");
    expect(wrapper.vm.expertError).toBeNull();
    expect(setSearchText).toHaveBeenCalledWith("[?Type=='Context']");
  });

  it("should commit the raw text in basic mode without validation", () => {
    const { wrapper, store } = mountComponent();
    const setSearchText = vi.spyOn(store, "setSearchText");
    wrapper.vm.onInput("[?RightsStatus==]");
    expect(wrapper.vm.expertError).toBeNull();
    expect(setSearchText).toHaveBeenCalledWith("[?RightsStatus==]");
  });
});
