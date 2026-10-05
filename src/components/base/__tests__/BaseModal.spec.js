import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseModal from "../BaseModal.vue";

const QDialogStub = {
  props: ["modelValue", "persistent"],
  template: `<div v-if="modelValue" data-test="dialog"><slot /></div>`,
};
const passThrough = { template: "<div><slot /></div>" };

const globalStubs = {
  global: {
    stubs: {
      "q-dialog": QDialogStub,
      "q-card": passThrough,
      "q-card-section": passThrough,
      "q-card-actions": passThrough,
      "q-space": true,
      "q-icon": true,
    },
  },
};

describe("BaseModal", () => {
  it("should render the title and the body slot when open", () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true, title: "Export" },
      slots: { default: "<p data-test='content'>Body</p>" },
      ...globalStubs,
    });
    expect(wrapper.find('[data-test="modal-title"]').text()).toBe("Export");
    expect(wrapper.find('[data-test="content"]').exists()).toBe(true);
  });

  it("should render nothing when closed", () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: false, title: "Export" },
      ...globalStubs,
    });
    expect(wrapper.find('[data-test="dialog"]').exists()).toBe(false);
  });

  it("should emit update:modelValue false when the close button is clicked", async () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true, title: "Export" },
      ...globalStubs,
    });
    await wrapper.find('[data-test="modal-close"]').trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
  });

  it("should render the actions slot only when provided", () => {
    const withoutActions = mount(BaseModal, {
      props: { modelValue: true, title: "Export" },
      ...globalStubs,
    });
    expect(withoutActions.find('[data-test="modal-actions"]').exists()).toBe(
      false,
    );

    const withActions = mount(BaseModal, {
      props: { modelValue: true, title: "Export" },
      slots: { actions: "<button data-test='ok'>OK</button>" },
      ...globalStubs,
    });
    expect(withActions.find('[data-test="ok"]').exists()).toBe(true);
  });

  it("should forward persistent to q-dialog", () => {
    const wrapper = mount(BaseModal, {
      props: { modelValue: true, title: "Export", persistent: true },
      ...globalStubs,
    });
    expect(wrapper.findComponent(QDialogStub).props("persistent")).toBe(true);
  });
});
