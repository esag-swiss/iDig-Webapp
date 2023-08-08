import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import TheControlTrenches from "../TheControlTrenches.vue";
import { createPinia } from "pinia";
import { useDataStore } from "@/stores/data";

describe("TheControlTrenches", () => {
  it("renders properly", () => {
    const pinia = createPinia(); // Create Pinia instance
    useDataStore(pinia); // Use your data store

    const wrapper = mount(TheControlTrenches, {
      global: {
        plugins: [pinia], // Add Pinia as a plugin globally
      },
      props: { projectTrenchesNames: [] },
    });
    expect(wrapper.text()).toContain("Secteurs");
  });
});
