import { describe, it, expect, beforeEach } from "vitest";

import { useDataState } from "./useDataState.js";

describe("setAllTrenches", () => {
  beforeEach(() => {
    const { resetDataState } = useDataState();
    resetDataState();
  });

  it("initialized with null", () => {
    const { allTrenches } = useDataState();

    expect(allTrenches.value).toBe(null);
  });

  it("set correctly its value", () => {
    const { setAllTrenches, allTrenches } = useDataState();
    const currentAllTrenches = ["AMA21-S24", "AMA_Kokalas"];

    setAllTrenches(currentAllTrenches);

    expect(allTrenches.value).toStrictEqual(["AMA21-S24", "AMA_Kokalas"]);
  });
});

describe("setAllTypes", () => {
  beforeEach(() => {
    const { resetDataState } = useDataState();
    resetDataState();
  });

  it("initialized with null", () => {
    const { allTypes } = useDataState();

    expect(allTypes.value).toBe(null);
  });

  it("set correctly its value", () => {
    const { setAllTypes, allTypes } = useDataState();

    const currentAllTypes = [
      {
        type: "Context",
        label: "Contexte",
        labels: {},
        plurals: {},
        relations: [],
      },
      { type: "Feature" },
    ];

    setAllTypes(currentAllTypes);

    expect(allTypes.value).toStrictEqual(currentAllTypes);
  });
});

describe("setAllFields", () => {
  beforeEach(() => {
    const { resetDataState } = useDataState();
    resetDataState();
  });

  it("initialized with null", () => {
    const { allFields } = useDataState();

    expect(allFields.value).toBe(null);
  });

  it("set correctly its value", () => {
    const { setAllFields, allFields } = useDataState();

    const currentAllFields = [
      {
        field: "Category",
        labels: {},
        tips: {},
      },
      {},
    ];

    setAllFields(currentAllFields);

    expect(allFields.value).toStrictEqual(currentAllFields);
  });
});

describe("firstTrench", () => {
  beforeEach(() => {
    const { resetDataState } = useDataState();
    resetDataState();
  });

  it("return undefined if allTrenches is not set", () => {
    const { firstTrench } = useDataState();

    expect(firstTrench.value).toBe(undefined);
  });

  it.each([
    { allTrenches: null, expected: undefined },
    { allTrenches: [], expected: undefined },
    { allTrenches: ["AMA21-S24"], expected: "AMA21-S24" },
    { allTrenches: ["AMA21-S24", "AMA_Kokalas"], expected: "AMA21-S24" },
    {
      allTrenches: ["AMA21-S24", "AMA_Kokalas", "AMA07"],
      expected: "AMA21-S24",
    },
  ])("return expected value", ({ allTrenches, expected }) => {
    const { firstTrench, setAllTrenches } = useDataState();

    setAllTrenches(allTrenches);

    expect(firstTrench.value).toBe(expected);
  });
});
