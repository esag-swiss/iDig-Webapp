import { describe, it, expect } from "vitest";
import {
  clamp,
  interpolate,
  progressBetween,
} from "@/services/helpers/numberHelper";

describe("numberHelper", () => {
  describe("clamp", () => {
    it("should keep a value that is within the limits", () => {
      expect(clamp({ value: 0.5, min: 0, max: 1 })).toBe(0.5);
    });

    it("should bring a value below the minimum back to it", () => {
      expect(clamp({ value: -2, min: 0, max: 1 })).toBe(0);
    });

    it("should bring a value above the maximum back to it", () => {
      expect(clamp({ value: 3, min: 0, max: 1 })).toBe(1);
    });
  });

  describe("progressBetween", () => {
    it("should locate a value between two bounds", () => {
      expect(progressBetween({ value: 15, start: 10, end: 20 })).toBe(0.5);
    });
  });

  describe("interpolate", () => {
    it("should return the start value at zero progress", () => {
      expect(interpolate({ from: 7, to: 4, progress: 0 })).toBe(7);
    });

    it("should return the intermediate value at partial progress", () => {
      expect(interpolate({ from: 7, to: 4, progress: 0.5 })).toBe(5.5);
    });

    it("should return the end value at full progress", () => {
      expect(interpolate({ from: 7, to: 4, progress: 1 })).toBe(4);
    });
  });
});
