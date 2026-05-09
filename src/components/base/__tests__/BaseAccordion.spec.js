import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseAccordion from "@/components/base/BaseAccordion.vue";

const globalStubs = { global: { stubs: { "q-icon": true } } };

describe("BaseAccordion", () => {
  it("should render the title slot", () => {
    const wrapper = mount(BaseAccordion, {
      slots: { title: "<span>Title content</span>" },
      ...globalStubs,
    });
    expect(wrapper.text()).toContain("Title content");
  });

  it("should not render the content slot when closed by default", () => {
    const wrapper = mount(BaseAccordion, {
      slots: { content: "<span>Content body</span>" },
      ...globalStubs,
    });
    expect(wrapper.text()).not.toContain("Content body");
  });

  it("should render the content slot when initialOpen is true", () => {
    const wrapper = mount(BaseAccordion, {
      props: { initialOpen: true },
      slots: { content: "<span>Content body</span>" },
      ...globalStubs,
    });
    expect(wrapper.text()).toContain("Content body");
  });

  it("should toggle the content visibility when the chevron button is clicked", async () => {
    const wrapper = mount(BaseAccordion, {
      slots: { content: "<span>Content body</span>" },
      ...globalStubs,
    });
    expect(wrapper.text()).not.toContain("Content body");

    await wrapper.find("button").trigger("click");
    expect(wrapper.text()).toContain("Content body");

    await wrapper.find("button").trigger("click");
    expect(wrapper.text()).not.toContain("Content body");
  });

  it("should expose a button element for the toggle (keyboard accessible)", () => {
    const wrapper = mount(BaseAccordion, globalStubs);
    const button = wrapper.find("button");
    expect(button.exists()).toBe(true);
    expect(button.attributes("type")).toBe("button");
  });
});
