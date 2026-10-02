import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseSelect from "../BaseSelect.vue";

const QSelectStub = {
  props: ["modelValue", "options", "multiple", "useInput", "label"],
  emits: ["update:modelValue", "filter"],
  template: `<div data-test="select" />`,
};

const globalStubs = { global: { stubs: { "q-select": QSelectStub } } };

function mountSelect(props) {
  const wrapper = mount(BaseSelect, {
    props: { modelValue: null, ...props },
    ...globalStubs,
  });
  return { wrapper, select: wrapper.findComponent(QSelectStub) };
}

async function filter(select, value) {
  select.vm.$emit("filter", value, (callback) => callback());
  await select.vm.$nextTick();
}

describe("BaseSelect", () => {
  it("should turn plain values into label/value options", () => {
    const { select } = mountSelect({ options: ["Arial", "Georgia"] });
    expect(select.props("options")).toEqual([
      { label: "Arial", value: "Arial" },
      { label: "Georgia", value: "Georgia" },
    ]);
  });

  it("should keep label/value options as they are", () => {
    const options = [{ label: "Portrait", value: "portrait" }];
    const { select } = mountSelect({ options });
    expect(select.props("options")).toEqual(options);
  });

  it("should emit update:modelValue when the selection changes", async () => {
    const { wrapper, select } = mountSelect({ options: ["a", "b"] });
    select.vm.$emit("update:modelValue", "b");
    expect(wrapper.emitted("update:modelValue")).toEqual([["b"]]);
  });

  it("should filter options by label, ignoring case and accents", async () => {
    const { select } = mountSelect({
      filterable: true,
      options: [
        { label: "Début", value: "DateEarliest" },
        { label: "Titre", value: "Title" },
      ],
    });
    expect(select.props("useInput")).toBe(true);

    await filter(select, "DEB");
    expect(select.props("options")).toEqual([
      { label: "Début", value: "DateEarliest" },
    ]);

    await filter(select, "");
    expect(select.props("options")).toHaveLength(2);
  });

  it("should forward multiple and label to q-select", () => {
    const { select } = mountSelect({
      options: [],
      multiple: true,
      label: "Fields",
      modelValue: [],
    });
    expect(select.props("multiple")).toBe(true);
    expect(select.props("label")).toBe("Fields");
  });
});
