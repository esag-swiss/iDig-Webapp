import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseSelect from "@/components/base/BaseSelect.vue";

const options = [
  { value: "", label: "Choose", disabled: true },
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("BaseSelect", () => {
  it("should render one option per entry", () => {
    const wrapper = mount(BaseSelect, { props: { options } });
    expect(wrapper.findAll("option")).toHaveLength(3);
  });

  it("should disable options flagged as disabled", () => {
    const wrapper = mount(BaseSelect, { props: { options } });
    expect(wrapper.find("option[value='']").attributes("disabled")).toBe("");
  });

  it("should reflect modelValue as the selected value", () => {
    const wrapper = mount(BaseSelect, {
      props: { options, modelValue: "b" },
    });
    expect(wrapper.element.value).toBe("b");
  });

  it("should emit update:modelValue when the selection changes", async () => {
    const wrapper = mount(BaseSelect, { props: { options } });
    await wrapper.find("select").setValue("a");
    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["a"]);
  });
});
