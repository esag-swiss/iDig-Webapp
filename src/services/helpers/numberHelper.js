function clamp({ value, min, max }) {
  return Math.min(Math.max(value, min), max);
}

function progressBetween({ value, start, end }) {
  return (value - start) / (end - start);
}

function interpolate({ from, to, progress }) {
  return from + progress * (to - from);
}

export { clamp, interpolate, progressBetween };
