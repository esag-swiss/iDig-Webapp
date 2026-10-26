import { trenchCampaign } from "@/services/helpers/trenchHelper";

const DATE_LENGTH = "YYYY-MM-DD".length;

function sortPlansNewestFirst(plans) {
  return [...plans].sort((planA, planB) =>
    (planB.dateEarliest ?? "").localeCompare(planA.dateEarliest ?? ""),
  );
}

function planGroupName({ plan, groupBy }) {
  if (groupBy === "date") {
    return plan.dateEarliest?.slice(0, DATE_LENGTH) ?? "";
  }
  return trenchCampaign(plan.trench);
}

function compareGroupsNewestFirst({ groupA, groupB, fallbackName }) {
  if (groupA.name === fallbackName) {
    return 1;
  }
  if (groupB.name === fallbackName) {
    return -1;
  }
  return groupB.name.localeCompare(groupA.name);
}

function groupPlans({ plans, groupBy, fallbackName }) {
  const groups = new Map();

  for (const plan of sortPlansNewestFirst(plans)) {
    const name = planGroupName({ plan, groupBy }) || fallbackName;
    if (!groups.has(name)) {
      groups.set(name, { name, plans: [] });
    }
    groups.get(name).plans.push(plan);
  }

  return [...groups.values()].sort((groupA, groupB) =>
    compareGroupsNewestFirst({ groupA, groupB, fallbackName }),
  );
}

export { sortPlansNewestFirst, groupPlans };
