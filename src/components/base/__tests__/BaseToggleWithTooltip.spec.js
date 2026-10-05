import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseToggleWithTooltip from "../BaseToggleWithTooltip.vue";

const QToggleStub = {
  props: ["modelValue", "size", "color", "icon", "disable"],
  emits: ["update:modelValue"],
  template: `<label><input type="checkbox" data-test="toggle-input" :checked="modelValue" @change="$emit('update:modelValue', $event.target.checked)" /><slot /></label>`,
};

const globalStubs = {
  global: { stubs: { "q-toggle": QToggleStub, "q-tooltip": true } },
};

describe("BaseToggleWithTooltip", () => {
  it("should reflect the modelValue prop in the toggle state", () => {
    const wrapper = mount(BaseToggleWithTooltip, {
      props: { modelValue: true, tooltip: "x" },
      ...globalStubs,
    });
    expect(wrapper.find('[data-test="toggle-input"]').element.checked).toBe(
      true,
    );
  });

  it("should emit update:modelValue when toggled", async () => {
    const wrapper = mount(BaseToggleWithTooltip, {
      props: { modelValue: false, tooltip: "x" },
      ...globalStubs,
    });
    await wrapper.find('[data-test="toggle-input"]').setValue(true);
    expect(wrapper.emitted("update:modelValue")).toEqual([[true]]);
  });

  it("should default color to secondary", () => {
    const wrapper = mount(BaseToggleWithTooltip, {
      props: { modelValue: false, tooltip: "x" },
      ...globalStubs,
    });
    expect(wrapper.findComponent(QToggleStub).props("color")).toBe("secondary");
  });

  it("should pass a custom color through to q-toggle", () => {
    const wrapper = mount(BaseToggleWithTooltip, {
      props: { modelValue: false, tooltip: "x", color: "red" },
      ...globalStubs,
    });
    expect(wrapper.findComponent(QToggleStub).props("color")).toBe("red");
  });

  it("should render the label only on wide screens", () => {
    const wrapper = mount(BaseToggleWithTooltip, {
      props: { modelValue: false, tooltip: "x", label: "Thumbnails" },
      ...globalStubs,
    });
    const label = wrapper.find('[data-test="toggle-label"]');
    expect(label.text()).toBe("Thumbnails");
    expect(label.classes()).toContain("gt-sm");
  });

  it("should pass disable through to q-toggle, enabled by default", () => {
    const enabled = mount(BaseToggleWithTooltip, {
      props: { modelValue: false, tooltip: "x" },
      ...globalStubs,
    });
    expect(enabled.findComponent(QToggleStub).props("disable")).toBe(false);

    const disabled = mount(BaseToggleWithTooltip, {
      props: { modelValue: false, tooltip: "x", disable: true },
      ...globalStubs,
    });
    expect(disabled.findComponent(QToggleStub).props("disable")).toBe(true);
  });

  it("should not render a label when none is given", () => {
    const wrapper = mount(BaseToggleWithTooltip, {
      props: { modelValue: false, tooltip: "x" },
      ...globalStubs,
    });
    expect(wrapper.find('[data-test="toggle-label"]').exists()).toBe(false);
  });
});
