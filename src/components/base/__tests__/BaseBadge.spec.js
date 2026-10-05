import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseBadge from "../BaseBadge.vue";

const QBadgeStub = {
  props: ["label", "color"],
  template: `<span data-test="badge">{{ label }}</span>`,
};

const globalStubs = { global: { stubs: { "q-badge": QBadgeStub } } };

describe("BaseBadge", () => {
  it("should render the label", () => {
    const wrapper = mount(BaseBadge, {
      props: { label: "Archive" },
      ...globalStubs,
    });
    expect(wrapper.find('[data-test="badge"]').text()).toBe("Archive");
  });

  it("should be grey", () => {
    const wrapper = mount(BaseBadge, {
      props: { label: "Archive" },
      ...globalStubs,
    });
    expect(wrapper.findComponent(QBadgeStub).props("color")).toBe("grey-7");
  });
});
