import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseInput from "@/components/base/BaseInput.vue";

const qInputStub = {
  name: "q-input",
  props: ["modelValue", "placeholder"],
  emits: ["update:model-value"],
  template: `<input
    :value="modelValue"
    :placeholder="placeholder"
    @input="$emit('update:model-value', $event.target.value)"
  />`,
};

const mountOptions = (props = {}) => ({
  props,
  global: { stubs: { "q-input": qInputStub } },
});

describe("BaseInput", () => {
  it("should pass the placeholder down to q-input", () => {
    const wrapper = mount(
      BaseInput,
      mountOptions({ placeholder: "Search…" }),
    );
    expect(wrapper.find("input").attributes("placeholder")).toBe("Search…");
  });

  it("should pass modelValue down to q-input", () => {
    const wrapper = mount(BaseInput, mountOptions({ modelValue: "hello" }));
    expect(wrapper.find("input").element.value).toBe("hello");
  });

  it("should emit update:modelValue when the input changes", async () => {
    const wrapper = mount(BaseInput, mountOptions());
    await wrapper.find("input").setValue("abc");
    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["abc"]);
  });

  it("should forward null when the input is cleared", async () => {
    const wrapper = mount(BaseInput, mountOptions());
    wrapper.findComponent(qInputStub).vm.$emit("update:model-value", null);
    expect(wrapper.emitted("update:modelValue")[0]).toEqual([null]);
  });
});
