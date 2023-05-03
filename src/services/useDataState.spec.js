import { describe, it, expect, beforeEach } from "vitest";

import { useDataState } from "./useDataState.js";

describe("setProjectTrenchesNames", () => {
  beforeEach(() => {
    const { resetDataState } = useDataState();
    resetDataState();
  });

  it("initialized with null", () => {
    const { projectTrenchesNames } = useDataState();

    expect(projectTrenchesNames.value).toBe(null);
  });

  it("set correctly its value", () => {
    const { setProjectTrenchesNames, projectTrenchesNames } = useDataState();
    const currentAllTrenches = ["AMA21-S24", "AMA_Kokalas"];

    setProjectTrenchesNames(currentAllTrenches);

    expect(projectTrenchesNames.value).toStrictEqual([
      "AMA21-S24",
      "AMA_Kokalas",
    ]);
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

  it("return undefined if projectTrenchesNames is not set", () => {
    const { firstTrench } = useDataState();

    expect(firstTrench.value).toBe(undefined);
  });

  it.each([
    { projectTrenchesNames: null, expected: undefined },
    { projectTrenchesNames: [], expected: undefined },
    { projectTrenchesNames: ["AMA21-S24"], expected: "AMA21-S24" },
    {
      projectTrenchesNames: ["AMA21-S24", "AMA_Kokalas"],
      expected: "AMA21-S24",
    },
    {
      projectTrenchesNames: ["AMA21-S24", "AMA_Kokalas", "AMA07"],
      expected: "AMA21-S24",
    },
  ])("return expected value", ({ projectTrenchesNames, expected }) => {
    const { firstTrench, setProjectTrenchesNames } = useDataState();

    setProjectTrenchesNames(projectTrenchesNames);

    expect(firstTrench.value).toBe(expected);
  });
});
