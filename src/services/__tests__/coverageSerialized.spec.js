import { describe, expect, it } from "vitest";
import {
  coverageSerializedToProjectText,
  decimalToHexFloat,
  hexFloatToDecimal,
  projectTextToCoverageSerialized,
} from "@/services/coverageSerialized";

describe("coverageSerialized coordinate formatting", () => {
  it("round-trips decimal coordinates through iDig hexadecimal floats", () => {
    const values = [0, 123.456, -12.5, 421315.789];

    values.forEach((value) => {
      expect(hexFloatToDecimal(decimalToHexFloat(value))).toBeCloseTo(
        value,
        10,
      );
    });
  });

  it("formats CoverageSerialized as project CRS coordinate rows", () => {
    const coverageSerialized = [
      `x=${decimalToHexFloat(100)}`,
      `y=${decimalToHexFloat(200.5)}`,
      `z=${decimalToHexFloat(12.345)}`,
      "",
      `x=${decimalToHexFloat(101)}`,
      `y=${decimalToHexFloat(201.5)}`,
      `z=${decimalToHexFloat(13.345)}`,
    ].join("\n");

    expect(coverageSerializedToProjectText(coverageSerialized)).toBe(
      "100\t200.5\t12.345\n101\t201.5\t13.345",
    );
  });

  it("keeps the station point id visible when CoverageSerialized has p", () => {
    const coverageSerialized = [
      "d=2021-08-06T06:29:32Z",
      "n=find-spot",
      `x=${decimalToHexFloat(100)}`,
      `y=${decimalToHexFloat(200)}`,
      `z=${decimalToHexFloat(12.3)}`,
      "h=0X1.4CCCCCCCCCCCDP+0",
      "re=YES",
      "p=S28_0419",
    ].join("\n");

    expect(coverageSerializedToProjectText(coverageSerialized)).toBe(
      "S28_0419\t100\t200\t12.3",
    );
  });
});

describe("projectTextToCoverageSerialized", () => {
  it("accepts one XYZ coordinate row per line", () => {
    const result = projectTextToCoverageSerialized(
      "100 200 12.3\n101 201 12.4",
    );

    expect(result.ok).toBe(true);
    expect(coverageSerializedToProjectText(result.value)).toBe(
      "100\t200\t12.3\n101\t201\t12.4",
    );
  });

  it("uses the last three numeric columns for station exports with point ids", () => {
    const result = projectTextToCoverageSerialized(
      "P1 100.1 200.2 12.3\nP2 101.1 201.2 12.4",
    );

    expect(result.ok).toBe(true);
    expect(coverageSerializedToProjectText(result.value)).toBe(
      "100.1\t200.2\t12.3\n101.1\t201.2\t12.4",
    );
  });

  it("accepts semicolon-separated rows with decimal commas", () => {
    const result = projectTextToCoverageSerialized("P1;100,1;200,2;12,3");

    expect(result.ok).toBe(true);
    expect(coverageSerializedToProjectText(result.value)).toBe(
      "100.1\t200.2\t12.3",
    );
  });

  it("uses X/Y/Z headers when present", () => {
    const result = projectTextToCoverageSerialized(
      "code;Y;X;Z\nP1;200;100;12.3",
    );

    expect(result.ok).toBe(true);
    expect(coverageSerializedToProjectText(result.value)).toBe(
      "100\t200\t12.3",
    );
  });

  it("returns a validation error for unrecognized rows", () => {
    const result = projectTextToCoverageSerialized("P1 north east high");

    expect(result.ok).toBe(false);
    expect(result.error).toContain("Ligne 1");
  });

  it("preserves existing iDig metadata while replacing coordinates", () => {
    const previous = [
      "d=2021-08-06T06:29:32Z",
      "n=find-spot",
      `x=${decimalToHexFloat(100)}`,
      `y=${decimalToHexFloat(200)}`,
      `z=${decimalToHexFloat(12.3)}`,
      "h=0X1.4CCCCCCCCCCCDP+0",
      "re=YES",
      "p=S28_0419",
    ].join("\n");
    const result = projectTextToCoverageSerialized(
      "S28_9999 101 201 13.4",
      previous,
    );

    expect(result.ok).toBe(true);
    expect(result.value).toContain("d=2021-08-06T06:29:32Z");
    expect(result.value).toContain("n=find-spot");
    expect(result.value).toContain("h=0X1.4CCCCCCCCCCCDP+0");
    expect(result.value).toContain("re=YES");
    expect(result.value).toContain("p=S28_9999");
    expect(coverageSerializedToProjectText(result.value)).toBe(
      "S28_9999\t101\t201\t13.4",
    );
  });

  it("creates iDig-style point blocks for new pasted coordinates", () => {
    const result = projectTextToCoverageSerialized("P1 100 200 12.3", "");

    expect(result.ok).toBe(true);
    expect(result.value).toContain("d=");
    expect(result.value).toContain("n=point");
    expect(result.value).toContain("p=P1");
    expect(result.value).toContain("tp=YES");
    expect(result.value).toContain("re=YES");
  });
});
