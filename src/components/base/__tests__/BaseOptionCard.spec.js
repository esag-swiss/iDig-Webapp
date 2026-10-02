import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseOptionCard from "../BaseOptionCard.vue";

const globalStubs = { global: { stubs: { "q-icon": true } } };

describe("BaseOptionCard", () => {
  it("should render a native button with the label and description", () => {
    const wrapper = mount(BaseOptionCard, {
      props: { label: "Word (.docx)", description: "Formatted catalogue" },
      ...globalStubs,
    });
    expect(wrapper.element.tagName).toBe("BUTTON");
    expect(wrapper.attributes("type")).toBe("button");
    expect(wrapper.find('[data-test="option-card-label"]').text()).toBe(
      "Word (.docx)",
    );
    expect(wrapper.find('[data-test="option-card-description"]').text()).toBe(
      "Formatted catalogue",
    );
  });

  it("should render the icon only when provided", () => {
    const withoutIcon = mount(BaseOptionCard, {
      props: { label: "x" },
      ...globalStubs,
    });
    expect(withoutIcon.find('[data-test="option-card-icon"]').exists()).toBe(
      false,
    );

    const withIcon = mount(BaseOptionCard, {
      props: { label: "x", icon: "description" },
      ...globalStubs,
    });
    expect(withIcon.find('[data-test="option-card-icon"]').exists()).toBe(true);
  });

  it("should not render the description when empty", () => {
    const wrapper = mount(BaseOptionCard, {
      props: { label: "x" },
      ...globalStubs,
    });
    expect(wrapper.find('[data-test="option-card-description"]').exists()).toBe(
      false,
    );
  });

  it("should reflect the selected state", () => {
    const wrapper = mount(BaseOptionCard, {
      props: { label: "x", selected: true },
      ...globalStubs,
    });
    expect(wrapper.classes()).toContain("base-option-card--selected");
    expect(wrapper.attributes("aria-pressed")).toBe("true");
  });

  it("should emit select when clicked", async () => {
    const wrapper = mount(BaseOptionCard, {
      props: { label: "x" },
      ...globalStubs,
    });
    await wrapper.trigger("click");
    expect(wrapper.emitted("select")).toHaveLength(1);
  });
});
