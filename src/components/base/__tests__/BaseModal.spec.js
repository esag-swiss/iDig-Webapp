import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseModal from "@/components/base/BaseModal.vue";

const QDialogStub = {
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template: `<div v-if="modelValue"><slot /></div>`,
};

const PassthroughStub = { template: `<div><slot /></div>` };

const globalStubs = {
  global: {
    stubs: {
      "q-dialog": QDialogStub,
      "q-card": PassthroughStub,
      "q-card-section": PassthroughStub,
      "q-icon": true,
    },
  },
};

describe("BaseModal", () => {
  it("should not render its content when modelValue is false", () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: false },
      slots: { content: "<span>Modal body</span>" },
      ...globalStubs,
    });
    expect(wrapper.text()).not.toContain("Modal body");
  });

  it("should render the title and content slots when modelValue is true", () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true },
      slots: {
        title: "<span>Modal title</span>",
        content: "<span>Modal body</span>",
      },
      ...globalStubs,
    });
    expect(wrapper.text()).toContain("Modal title");
    expect(wrapper.text()).toContain("Modal body");
  });

  it("should emit update:modelValue with false when the close button is clicked", async () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true },
      ...globalStubs,
    });
    await wrapper.find('[data-test="base-modal-close"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
  });
});
