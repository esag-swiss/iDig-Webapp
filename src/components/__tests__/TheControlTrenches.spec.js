import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import TheControlTrenches from "../TheControlTrenches.vue";

describe("TheControlTrenches", () => {
  it("renders properly", () => {
    const wrapper = mount(TheControlTrenches, { props: { allTrenches: [] } });
    expect(wrapper.text()).toContain("Secteurs");
  });
});
