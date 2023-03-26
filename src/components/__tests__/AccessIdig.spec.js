import { describe, it, expect } from "vitest";

import { mount } from "@vue/test-utils";
import AccessIdig from "../AccessIdig.vue";

describe("AccessIdig", () => {
  it("renders properly", () => {
    const wrapper = mount(AccessIdig, { props: { allTrenches: [] } });
    expect(wrapper.text()).toContain("Secteurs");
  });
});