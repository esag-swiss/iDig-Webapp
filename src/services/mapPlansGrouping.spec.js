import { describe, it, expect } from "vitest";
import { sortPlansNewestFirst, groupPlans } from "@/services/mapPlansGrouping";

const FALLBACK_NAME = "None";

function plan({ id, trench = "", dateEarliest = null }) {
  return { id, title: id, trench, dateEarliest };
}

function idsOf(plans) {
  return plans.map((p) => p.id);
}

describe("mapPlansGrouping", () => {
  describe("sortPlansNewestFirst", () => {
    it("should put the most recent plan first", () => {
      const plans = [
        plan({ id: "old", dateEarliest: "2023-04-18T10:00:00Z" }),
        plan({ id: "new", dateEarliest: "2024-07-02T10:00:00Z" }),
      ];

      expect(idsOf(sortPlansNewestFirst(plans))).toEqual(["new", "old"]);
    });

    it("should put plans without date last", () => {
      const plans = [
        plan({ id: "undated" }),
        plan({ id: "dated", dateEarliest: "2023-04-18T10:00:00Z" }),
      ];

      expect(idsOf(sortPlansNewestFirst(plans))).toEqual(["dated", "undated"]);
    });

    it("should not modify the given list", () => {
      const plans = [
        plan({ id: "old", dateEarliest: "2023-04-18T10:00:00Z" }),
        plan({ id: "new", dateEarliest: "2024-07-02T10:00:00Z" }),
      ];

      sortPlansNewestFirst(plans);

      expect(idsOf(plans)).toEqual(["old", "new"]);
    });
  });

  describe("groupPlans", () => {
    describe("when grouping by trench", () => {
      const plans = [
        plan({ id: "a", trench: "AMA22_S1" }),
        plan({ id: "b", trench: "AMA24_S22C" }),
        plan({ id: "c" }),
        plan({ id: "d", trench: "AMA24_S3" }),
      ];

      it("should group plans by campaign, newest campaign first, without trench last", () => {
        const groups = groupPlans({
          plans,
          groupBy: "trench",
          fallbackName: FALLBACK_NAME,
        });

        expect(groups.map((group) => group.name)).toEqual([
          "AMA24",
          "AMA22",
          FALLBACK_NAME,
        ]);
      });

      it("should keep every plan of a campaign in its group", () => {
        const groups = groupPlans({
          plans,
          groupBy: "trench",
          fallbackName: FALLBACK_NAME,
        });

        expect(idsOf(groups[0].plans).sort()).toEqual(["b", "d"]);
      });
    });

    describe("when grouping by date", () => {
      const plans = [
        plan({ id: "a", dateEarliest: "2023-04-18T10:00:00Z" }),
        plan({ id: "b" }),
        plan({ id: "c", dateEarliest: "2023-07-11T08:00:00Z" }),
        plan({ id: "d", dateEarliest: "2023-07-11T15:00:00Z" }),
      ];

      it("should group plans by day, most recent day first, without date last", () => {
        const groups = groupPlans({
          plans,
          groupBy: "date",
          fallbackName: FALLBACK_NAME,
        });

        expect(groups.map((group) => group.name)).toEqual([
          "2023-07-11",
          "2023-04-18",
          FALLBACK_NAME,
        ]);
      });

      it("should sort the plans of a day newest first", () => {
        const groups = groupPlans({
          plans,
          groupBy: "date",
          fallbackName: FALLBACK_NAME,
        });

        expect(idsOf(groups[0].plans)).toEqual(["d", "c"]);
      });
    });
  });
});
