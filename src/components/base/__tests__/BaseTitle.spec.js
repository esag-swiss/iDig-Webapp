import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseTitle from "@/components/base/BaseTitle.vue";

describe("BaseTitle", () => {
  it("should render as an h3 element", () => {
    const wrapper = mount(BaseTitle, { props: { label: "Title" } });
    expect(wrapper.element.tagName).toBe("H3");
  });

  it("should render the label text", () => {
    const wrapper = mount(BaseTitle, { props: { label: "My title" } });
    expect(wrapper.text()).toContain("My title");
  });

  it("should render slot content alongside the label", () => {
    const wrapper = mount(BaseTitle, {
      props: { label: "My title" },
      slots: { default: "<span>extra</span>" },
    });
    expect(wrapper.html()).toContain("extra");
  });
});
