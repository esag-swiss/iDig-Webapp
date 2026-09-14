import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseButton from "@/components/base/BaseButton.vue";

const globalStubs = { global: { stubs: { "q-icon": true } } };

describe("BaseButton", () => {
  it("should render a native button element with type button", () => {
    const wrapper = mount(
      BaseButton,
      { props: { label: "Click" }, ...globalStubs },
    );
    expect(wrapper.element.tagName).toBe("BUTTON");
    expect(wrapper.attributes("type")).toBe("button");
  });

  it("should render the label as text when label prop is provided", () => {
    const wrapper = mount(
      BaseButton,
      { props: { label: "Click me" }, ...globalStubs },
    );
    expect(wrapper.text()).toContain("Click me");
  });

  it("should render an icon when icon prop is provided", () => {
    const wrapper = mount(
      BaseButton,
      { props: { icon: "home", ariaLabel: "Home" }, ...globalStubs },
    );
    expect(wrapper.find('[data-test="base-button-icon"]').exists()).toBe(true);
  });

  it("should render both label and icon when both are provided", () => {
    const wrapper = mount(
      BaseButton,
      { props: { label: "Home", icon: "home" }, ...globalStubs },
    );
    expect(wrapper.text()).toContain("Home");
    expect(wrapper.find('[data-test="base-button-icon"]').exists()).toBe(true);
  });

  it("should emit click when the button is clicked", async () => {
    const wrapper = mount(
      BaseButton,
      { props: { label: "Click" }, ...globalStubs },
    );
    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toHaveLength(1);
  });

  it("should apply the disabled attribute when disabled prop is true", () => {
    const wrapper = mount(
      BaseButton,
      { props: { label: "x", disabled: true }, ...globalStubs },
    );
    expect(wrapper.attributes("disabled")).toBeDefined();
  });

  it("should set aria-label from prop for icon-only buttons", () => {
    const wrapper = mount(
      BaseButton,
      { props: { icon: "home", ariaLabel: "Go home" }, ...globalStubs },
    );
    expect(wrapper.attributes("aria-label")).toBe("Go home");
  });

  it("should not render aria-label attribute when no ariaLabel is provided", () => {
    const wrapper = mount(
      BaseButton,
      { props: { label: "Click" }, ...globalStubs },
    );
    expect(wrapper.attributes("aria-label")).toBeUndefined();
  });
});
