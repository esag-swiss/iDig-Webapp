import { describe, it, expect } from "vitest";
import {
  trenchCampaign,
  sortCampaignsNewestFirst,
} from "@/services/helpers/trenchHelper";

describe("trenchHelper", () => {
  describe("trenchCampaign", () => {
    it("should keep the first five characters of the trench name", () => {
      expect(trenchCampaign("AMA24_S22C")).toBe("AMA24");
    });

    it("should return an empty string when the trench name is missing", () => {
      expect(trenchCampaign(null)).toBe("");
    });
  });

  describe("sortCampaignsNewestFirst", () => {
    it("should sort campaigns in reverse alphabetical order", () => {
      expect(sortCampaignsNewestFirst(["AMA22", "AMA24", "AMA23"])).toEqual([
        "AMA24",
        "AMA23",
        "AMA22",
      ]);
    });
  });
});
