import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseCheckbox from "../BaseCheckbox.vue";

describe("BaseCheckbox", () => {
  it("should render a checkbox input wrapped in a label", () => {
    const wrapper = mount(BaseCheckbox, { props: { label: "My label" } });
    expect(wrapper.element.tagName).toBe("LABEL");

    const input = wrapper.find('[data-test="checkbox-input"]');
    expect(input.exists()).toBe(true);
    expect(input.attributes("type")).toBe("checkbox");
  });

  it("should render the label prop as text", () => {
    const wrapper = mount(BaseCheckbox, { props: { label: "My label" } });
    expect(wrapper.text()).toContain("My label");
  });

  it("should reflect the modelValue prop in the checked state", async () => {
    const wrapper = mount(BaseCheckbox, {
      props: { label: "x", modelValue: true },
    });
    expect(wrapper.find('[data-test="checkbox-input"]').element.checked).toBe(
      true,
    );

    await wrapper.setProps({ modelValue: false });
    expect(wrapper.find('[data-test="checkbox-input"]').element.checked).toBe(
      false,
    );
  });

  it("should emit update:modelValue with the new checked state when toggled", async () => {
    const wrapper = mount(BaseCheckbox, {
      props: { label: "x", modelValue: false },
    });
    await wrapper.find('[data-test="checkbox-input"]').setValue(true);

    const events = wrapper.emitted("update:modelValue");
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual([true]);
  });

  it("should apply the disabled attribute to the input when disabled prop is true", () => {
    const wrapper = mount(BaseCheckbox, {
      props: { label: "x", disabled: true },
    });
    expect(
      wrapper.find('[data-test="checkbox-input"]').attributes("disabled"),
    ).toBeDefined();
  });

  it("should pass through fallthrough attributes to the root label", () => {
    const wrapper = mount(BaseCheckbox, {
      props: { label: "x" },
      attrs: { class: "ml-1" },
    });
    expect(wrapper.classes()).toContain("ml-1");
  });
});
