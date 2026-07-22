import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseToggle from "../BaseToggle.vue";

const QBtnToggleStub = {
  props: ["modelValue", "options", "toggleColor", "textColor"],
  emits: ["update:modelValue"],
  template: `
    <div>
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        :data-test="'option-' + option.value"
        @click="$emit('update:modelValue', option.value)"
      >{{ option.label }}</button>
    </div>
  `,
};

const globalStubs = {
  global: { stubs: { "q-btn-toggle": QBtnToggleStub } },
};

const options = [
  { label: "Basic", value: "basic" },
  { label: "Expert", value: "expert" },
];

describe("BaseToggle", () => {
  it("should render a button for each option", () => {
    const wrapper = mount(BaseToggle, {
      props: { options, modelValue: "basic" },
      ...globalStubs,
    });
    expect(wrapper.find('[data-test="option-basic"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="option-expert"]').exists()).toBe(true);
  });

  it("should emit update:modelValue with the selected option's value", async () => {
    const wrapper = mount(BaseToggle, {
      props: { options, modelValue: "basic" },
      ...globalStubs,
    });
    await wrapper.find('[data-test="option-expert"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([["expert"]]);
  });

  it("should default toggleColor to primary", () => {
    const wrapper = mount(BaseToggle, {
      props: { options, modelValue: "basic" },
      ...globalStubs,
    });
    expect(
      wrapper.findComponent(QBtnToggleStub).props("toggleColor"),
    ).toBe("primary");
  });

  it("should pass a custom toggleColor through to q-btn-toggle", () => {
    const wrapper = mount(BaseToggle, {
      props: { options, modelValue: "basic", toggleColor: "secondary" },
      ...globalStubs,
    });
    expect(
      wrapper.findComponent(QBtnToggleStub).props("toggleColor"),
    ).toBe("secondary");
  });
});
