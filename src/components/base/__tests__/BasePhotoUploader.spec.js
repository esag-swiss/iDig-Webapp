import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BasePhotoUploader from "@/components/base/BasePhotoUploader.vue";

const qFileStub = {
  name: "q-file",
  props: ["modelValue", "label", "accept", "multiple"],
  emits: ["update:model-value"],
  template: `<button
    type="button"
    @click="$emit('update:model-value', [{ name: 'p.jpg' }])"
  >{{ label }}</button>`,
};

const mountOptions = (props = {}) => ({
  props,
  global: { stubs: { "q-icon": true, "q-file": qFileStub } },
});

describe("BasePhotoUploader", () => {
  it("should pass the label down to the file picker", () => {
    const wrapper = mount(
      BasePhotoUploader,
      mountOptions({ label: "Add photos" }),
    );
    expect(wrapper.find('[data-test="photo-file-input"]').text()).toContain(
      "Add photos",
    );
  });

  it("should render a thumbnail per photo", () => {
    const wrapper = mount(
      BasePhotoUploader,
      mountOptions({
        photos: [
          { name: "a.jpg", url: "blob:a" },
          { name: "b.jpg", url: "blob:b" },
        ],
      }),
    );
    const images = wrapper.findAll('[data-test="photo-thumb"]');
    expect(images).toHaveLength(2);
    expect(images[0].attributes("src")).toBe("blob:a");
    expect(images[0].attributes("alt")).toBe("a.jpg");
  });

  it("should not render the grid when there is no photo", () => {
    const wrapper = mount(BasePhotoUploader, mountOptions());
    expect(wrapper.find('[data-test="photo-grid"]').exists()).toBe(false);
  });

  it("should emit add with the selected files when a selection is made", async () => {
    const wrapper = mount(BasePhotoUploader, mountOptions());

    await wrapper.find('[data-test="photo-file-input"]').trigger("click");

    expect(wrapper.emitted("add")).toBeTruthy();
    expect(wrapper.emitted("add")[0][0]).toEqual([{ name: "p.jpg" }]);
  });

  it("should emit remove with the photo name when the remove button is clicked", async () => {
    const wrapper = mount(
      BasePhotoUploader,
      mountOptions({ photos: [{ name: "a.jpg", url: "blob:a" }] }),
    );

    await wrapper.find('[data-test="photo-remove"]').trigger("click");

    expect(wrapper.emitted("remove")).toBeTruthy();
    expect(wrapper.emitted("remove")[0][0]).toBe("a.jpg");
  });

  it("should expose an accessible remove button referencing the photo", () => {
    const wrapper = mount(
      BasePhotoUploader,
      mountOptions({ photos: [{ name: "a.jpg", url: "blob:a" }] }),
    );
    const button = wrapper.find('[data-test="photo-remove"]');
    expect(button.element.tagName).toBe("BUTTON");
    expect(button.attributes("aria-label")).toBe("Remove a.jpg");
  });
});
