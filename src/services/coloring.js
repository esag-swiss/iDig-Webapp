export const SurveyStatus = {
  Archive: 0,
  Undefined: 1,
  Attention: 2,
  AllDone: 3,
  WillLot: 4,
  Conservation: 5,
  WillProcess: 6,
  Closed: 7,
  Open: 8,
};

function rgba(r, g, b, a) {
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
    b * 255,
  )}, ${a})`;
}

export function selectionColor() {
  return rgba(0.0, 0.478, 1.0, 0.5);
}

export function archiveColor() {
  return rgba(0.5, 0.5, 0.6, 0.376);
}

export function colorByType(survey) {
  // if (survey.status === SurveyStatus.Archive) {
  //   return archiveColor();
  // }
  const alpha = 0.5;
  switch (survey) {
    case "Untyped":
    case "Other":
      return rgba(1, 0, 0, alpha);
    case "Feature":
      return rgba(0.761, 0.263, 0.431, alpha);
    case "Context":
      return rgba(0.878, 0.357, 0.094, alpha);
    case "Artifact":
      return rgba(0, 0, 1, alpha);
    case "Sample":
      return rgba(0.525, 0.682, 0.882, alpha);
    case "Section":
      return rgba(0.502, 0.353, 0.498, alpha + 0.1);
    case "Plan":
      return rgba(0.678, 0.71, 0.741, alpha);
    case "Image":
      return rgba(0.031, 0.408, 0.408, alpha);
    case "Group":
      return rgba(0.859, 0.667, 0.125, alpha);
    case "Partition":
      return rgba(0.753, 0.655, 0.502, alpha);
    case "Event":
      return rgba(0.42, 0.557, 0.137, alpha);
    case "Interface":
      return rgba(0.537, 0.329, 0.055, alpha);
    default:
      return rgba(1, 0, 0, alpha + 0.2);
  }
}

export function colorByStatus(survey) {
  switch (survey.status) {
    case SurveyStatus.Archive:
    case SurveyStatus.AllDone:
      return "transparent";
    case SurveyStatus.Undefined:
    case SurveyStatus.Attention:
      return rgba(1.0, 0.0, 0.0, 0.5);
    case SurveyStatus.WillLot:
      return rgba(0.5, 0.5, 0.5, 0.2);
    case SurveyStatus.Conservation:
      return rgba(1.0, 1.0, 0.0, 0.4);
    case SurveyStatus.WillProcess:
    case SurveyStatus.Closed:
      return rgba(0.0, 1.0, 0.0, 0.4);
    case SurveyStatus.Open:
      return rgba(1.0, 1.0, 0.0, 0.4);
    default:
      return "transparent";
  }
}

export function colorByChronology(survey) {
  let start = parseInt(
    survey.coverageEarliest || survey.coverageLatest || "",
    10,
  );
  let end = parseInt(
    survey.coverageLatest || survey.coverageEarliest || "",
    10,
  );
  if (isNaN(start) && isNaN(end)) {
    return rgba(0.9, 0.9, 0.9, 0.2);
  }
  if (isNaN(start)) {
    start = end;
  }
  if (isNaN(end)) {
    end = start;
  }
  if (start > end) {
    [start, end] = [end, start];
  }
  if (end <= -3500) {
    return rgba(0.824, 0.776, 0.676, 0.4);
  }
  if (end <= -2200) {
    return rgba(0.92, 0.86, 0.67, 0.191);
  }
  if (end <= -1600) {
    return rgba(0.6, 0.63, 0.55, 0.191);
  }
  if (end <= -1200) {
    return rgba(0.92, 0.64, 0.43, 0.191);
  }
  if (end <= -1050) {
    return rgba(0.92, 0.74, 0.41, 0.191);
  }
  if (end <= -700) {
    return rgba(0.863, 0.847, 0.465, 0.417);
  }
  if (end <= -600) {
    return rgba(0.469, 0.546, 0.192, 0.4);
  }
  if (end <= -500) {
    return rgba(0.074, 0.316, 0.089, 0.453);
  }
  if (end <= -400) {
    return rgba(0.166, 0.46, 0.046, 0.425);
  }
  if (end <= -300) {
    return rgba(0.563, 0.707, 0.589, 0.414);
  }
  if (end < -225) {
    return rgba(0.554, 0.648, 0.796, 0.4);
  }
  if (end < -150) {
    return rgba(0.146, 0.294, 0.644, 0.417);
  }
  if (end < 0) {
    return rgba(0.037, 0.122, 0.808, 0.476);
  }
  if (end <= 100) {
    return rgba(0.738, 0.037, 0.218, 0.433);
  }
  if (end <= 200) {
    return rgba(0.953, 0.014, 0.234, 0.492);
  }
  if (end <= 300) {
    return rgba(0.445, 0.189, 0.189, 0.4);
  }
  if (start >= 300 && end <= 400) {
    return rgba(0.921, 0.327, 0.19, 0.417);
  }
  if (start >= 500 && end <= 600) {
    return rgba(0.734, 0.4, 0.283, 0.4);
  }
  if (end <= 400) {
    return rgba(0.953, 0.014, 0.234, 0.492);
  }
  if (end <= 700) {
    return rgba(0.984, 0.286, 0.073, 0.5);
  }
  if (end <= 1100) {
    return rgba(0.539, 0.193, 0.025, 0.4);
  }
  if (end <= 1200) {
    return rgba(0.554, 0.477, 0.123, 0.4);
  }
  if (end <= 1300) {
    return rgba(0.857, 0.863, 0.08, 0.304);
  }
  if (end < 1800) {
    return rgba(0.492, 0.77, 0.906, 0.3);
  }

  // Modern fallback
  return rgba(0.746, 0.746, 0.746, 0.4);
}

export function colorForSurvey(survey, mode) {
  switch (mode) {
    case "type":
      return colorByType(survey);
    case "STATUS":
      return colorByStatus(survey);
    case "CHRONOLOGY":
      return colorByChronology(survey);
    case "GRAPHITE":
      return rgba(0.5, 0.5, 0.5, 0.1);
    default:
      return "red";
  }
}
