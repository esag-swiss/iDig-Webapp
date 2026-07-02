import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BaseImageGallery from "@/components/base/BaseImageGallery.vue";

const globalStubs = { global: { stubs: { "q-icon": true } } };

const mountGallery = (images) =>
  mount(BaseImageGallery, { props: { images }, ...globalStubs });

describe("BaseImageGallery", () => {
  it("should render a thumbnail button per image", () => {
    const wrapper = mountGallery(["blob:a", "blob:b", "blob:c"]);
    const thumbs = wrapper.findAll('[data-test="gallery-thumb"]');
    expect(thumbs).toHaveLength(3);
    expect(thumbs[0].element.tagName).toBe("BUTTON");
    expect(thumbs[0].find("img").attributes("src")).toBe("blob:a");
  });

  it("should not show the overlay by default", () => {
    const wrapper = mountGallery(["blob:a"]);
    expect(wrapper.find('[data-test="gallery-overlay"]').exists()).toBe(false);
  });

  it("should open the overlay on the clicked image", async () => {
    const wrapper = mountGallery(["blob:a", "blob:b"]);

    await wrapper.findAll('[data-test="gallery-thumb"]')[1].trigger("click");

    expect(wrapper.find('[data-test="gallery-overlay"]').exists()).toBe(true);
    expect(
      wrapper.find('[data-test="gallery-full-image"]').attributes("src"),
    ).toBe("blob:b");
  });

  it("should cycle to the next and previous image with wrap-around", async () => {
    const wrapper = mountGallery(["blob:a", "blob:b"]);
    await wrapper.findAll('[data-test="gallery-thumb"]')[0].trigger("click");

    await wrapper.find('[data-test="gallery-next"]').trigger("click");
    expect(
      wrapper.find('[data-test="gallery-full-image"]').attributes("src"),
    ).toBe("blob:b");

    await wrapper.find('[data-test="gallery-next"]').trigger("click");
    expect(
      wrapper.find('[data-test="gallery-full-image"]').attributes("src"),
    ).toBe("blob:a");

    await wrapper.find('[data-test="gallery-prev"]').trigger("click");
    expect(
      wrapper.find('[data-test="gallery-full-image"]').attributes("src"),
    ).toBe("blob:b");
  });

  it("should close the overlay when it is clicked", async () => {
    const wrapper = mountGallery(["blob:a"]);
    await wrapper.findAll('[data-test="gallery-thumb"]')[0].trigger("click");
    expect(wrapper.find('[data-test="gallery-overlay"]').exists()).toBe(true);

    await wrapper.find('[data-test="gallery-overlay"]').trigger("click");
    expect(wrapper.find('[data-test="gallery-overlay"]').exists()).toBe(false);
  });

  it("should render nothing when there is no image", () => {
    const wrapper = mountGallery([]);
    expect(wrapper.find('[data-test="gallery-grid"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="gallery-overlay"]').exists()).toBe(false);
  });
});
