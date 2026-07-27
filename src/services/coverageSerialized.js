const COORDINATE_KEYS = ["x", "y", "z"];
const POINT_SEPARATOR = "\n\n";

function utcTimestamp() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function trimTrailingZeros(value) {
  return value.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

function formatProjectNumber(value) {
  if (!Number.isFinite(value)) {
    return "";
  }

  return trimTrailingZeros(Number(value.toPrecision(12)).toString());
}

export function hexFloatToDecimal(hex) {
  if (typeof hex !== "string") {
    return null;
  }

  const value = hex.trim();
  const decimal = Number(value);
  if (Number.isFinite(decimal)) {
    return decimal;
  }

  const match =
    /^([+-]?)0X([0-9A-Fa-f]+)(?:\.([0-9A-Fa-f]*))?P([+-]?\d+)$/i.exec(value);

  if (!match) {
    return null;
  }

  const [, sign, integerPart, fractionalPart = "", exponent] = match;
  let result = parseInt(integerPart, 16);

  for (let i = 0; i < fractionalPart.length; i++) {
    result += parseInt(fractionalPart[i], 16) * 16 ** -(i + 1);
  }

  result *= 2 ** Number(exponent);
  return sign === "-" ? -result : result;
}

export function decimalToHexFloat(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new TypeError(`Invalid coordinate value: ${value}`);
  }

  const sign = number < 0 ? "-" : "";
  const [integerPart, fractionalPart = "0"] = Math.abs(number)
    .toString(16)
    .split(".");

  return `${sign}0X${integerPart.toUpperCase()}.${fractionalPart.toUpperCase()}P0`;
}

function parseCoveragePoint(block) {
  const point = {};

  block.split(/\r?\n/).forEach((row) => {
    const [rawKey, rawValue] = row.split("=");
    const key = rawKey?.trim().toLowerCase();

    if (!COORDINATE_KEYS.includes(key)) {
      if (key === "p") {
        point.p = rawValue;
      }
      return;
    }

    const value = hexFloatToDecimal(rawValue);
    if (value !== null) {
      point[key] = value;
    }
  });

  return point;
}

export function coverageSerializedToProjectText(coverageSerialized) {
  if (!coverageSerialized || typeof coverageSerialized !== "string") {
    return "";
  }

  return coverageSerialized
    .split(/\n{2,}/)
    .map((block) => parseCoveragePoint(block))
    .filter((point) => point.x !== undefined && point.y !== undefined)
    .map((point) => {
      const coordinates = COORDINATE_KEYS.filter(
        (key) => point[key] !== undefined,
      )
        .map((key) => formatProjectNumber(point[key]))
        .join("\t");

      return point.p ? `${point.p}\t${coordinates}` : coordinates;
    })
    .join("\n");
}

function parseProjectNumber(token) {
  const cleaned = token?.trim().replace(/^["']|["']$/g, "");
  if (!cleaned) {
    return null;
  }

  const normalized = cleaned.replace(",", ".");
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(normalized)) {
    return null;
  }

  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function splitColumns(row) {
  const trimmed = row.trim();

  if (/[;\t]/.test(trimmed)) {
    return trimmed.split(/[;\t]+/).map((token) => token.trim());
  }

  const commaColumns = trimmed.split(/\s*,\s*/);
  if (commaColumns.length >= 3) {
    return commaColumns;
  }

  return trimmed.split(/\s+/);
}

function headerIndex(columns, candidates) {
  return columns.findIndex((column) =>
    candidates.includes(column.trim().toLowerCase()),
  );
}

function detectHeader(rows) {
  if (rows.length < 2) {
    return null;
  }

  const columns = splitColumns(rows[0]);
  const x = headerIndex(columns, ["x", "e", "east", "easting"]);
  const y = headerIndex(columns, ["y", "n", "north", "northing"]);
  const z = headerIndex(columns, ["z", "h", "alt", "height", "elevation"]);
  const p = headerIndex(columns, ["p", "id", "name", "code", "point"]);

  return x !== -1 && y !== -1 ? { p, x, y, z } : null;
}

function parsePointRow(row, header) {
  const columns = splitColumns(row);

  if (header) {
    const x = parseProjectNumber(columns[header.x]);
    const y = parseProjectNumber(columns[header.y]);
    const z = header.z === -1 ? null : parseProjectNumber(columns[header.z]);
    const p = header.p === -1 ? null : columns[header.p]?.trim();

    if (x === null || y === null) {
      return null;
    }

    return {
      p: p || null,
      values: z === null ? [x, y] : [x, y, z],
    };
  }

  const parsedColumns = columns.map((column) => ({
    raw: column,
    value: parseProjectNumber(column),
  }));
  const numbers = parsedColumns
    .map((column) => column.value)
    .filter((number) => number !== null);

  if (numbers.length < 2) {
    return null;
  }

  let p = null;
  if (numbers.length === 2 || numbers.length === 3) {
    const firstColumn = parsedColumns[0];
    if (firstColumn.value === null && columns.length > numbers.length) {
      p = firstColumn.raw;
    }

    return { p, values: numbers };
  }

  const firstColumn = parsedColumns[0];
  if (firstColumn.raw) {
    p = firstColumn.raw;
  }

  return { p, values: numbers.slice(-3) };
}

function splitCoverageBlocks(coverageSerialized) {
  if (!coverageSerialized || typeof coverageSerialized !== "string") {
    return [];
  }

  return coverageSerialized.split(/\r?\n(?:\r?\n)+/).filter(Boolean);
}

function splitCoverageParts(coverageSerialized) {
  return {
    blocks: splitCoverageBlocks(coverageSerialized),
    separators:
      typeof coverageSerialized === "string"
        ? Array.from(
            coverageSerialized.matchAll(/\r?\n(?:\r?\n)+/g),
            (match) => match[0],
          )
        : [],
  };
}

function joinCoverageBlocks(blocks, separators) {
  return blocks
    .map((block, index) =>
      index < blocks.length - 1
        ? `${block}${separators[index] || POINT_SEPARATOR}`
        : block,
    )
    .join("");
}

function setBlockValue(lines, key, value) {
  const index = lines.findIndex((line) => line.startsWith(`${key}=`));
  const row = `${key}=${value}`;

  if (index === -1) {
    lines.push(row);
  } else {
    lines[index] = row;
  }
}

function buildDefaultBlock(point) {
  const lines = [`d=${utcTimestamp()}`, "n=point"];

  point.values.forEach((value, index) => {
    lines.push(`${COORDINATE_KEYS[index]}=${decimalToHexFloat(value)}`);
  });

  if (point.p) {
    lines.push(`p=${point.p}`);
  }

  lines.push("tp=YES", "re=YES");
  return lines.join("\n");
}

function pointToCoverageBlock(point, templateBlock) {
  if (!templateBlock) {
    return buildDefaultBlock(point);
  }

  const lines = templateBlock.split(/\r?\n/).filter(Boolean);

  point.values.forEach((value, index) => {
    setBlockValue(lines, COORDINATE_KEYS[index], decimalToHexFloat(value));
  });

  if (point.p) {
    setBlockValue(lines, "p", point.p);
  }

  return lines.join("\n");
}

function pointToCoordinatesOnlyBlock(point) {
  return point.values
    .map(
      (value, index) => `${COORDINATE_KEYS[index]}=${decimalToHexFloat(value)}`,
    )
    .join("\n");
}

export function projectTextToCoverageSerialized(
  text,
  previousCoverageSerialized,
) {
  if (!text || !text.trim()) {
    return { ok: true, value: "" };
  }

  const rows = text
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);
  const header = detectHeader(rows);
  const pointRows = header ? rows.slice(1) : rows;
  const points = [];
  const { blocks: templates, separators } = splitCoverageParts(
    previousCoverageSerialized,
  );

  for (let i = 0; i < pointRows.length; i++) {
    const point = parsePointRow(pointRows[i], header);
    if (!point) {
      return {
        ok: false,
        error: `Ligne ${header ? i + 2 : i + 1}: coordonnees non reconnues.`,
      };
    }
    points.push(point);
  }

  const blocks = points.map((point, index) =>
    previousCoverageSerialized === undefined
      ? pointToCoordinatesOnlyBlock(point)
      : pointToCoverageBlock(point, templates[index]),
  );

  return {
    ok: true,
    value:
      previousCoverageSerialized === undefined
        ? blocks.join(POINT_SEPARATOR)
        : joinCoverageBlocks(blocks, separators),
  };
}
