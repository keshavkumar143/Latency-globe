export const LATENCY_THRESHOLDS_MS = Object.freeze({
  FAST_BELOW: 80,
  SLOW_ABOVE: 200,
});

export const LATENCY_BANDS = Object.freeze({
  FAST: {
    id: 'fast',
    label: `Under ${LATENCY_THRESHOLDS_MS.FAST_BELOW} ms`,
    color: '#4c9dff',
  },
  MODERATE: {
    id: 'moderate',
    label: `${LATENCY_THRESHOLDS_MS.FAST_BELOW}–${LATENCY_THRESHOLDS_MS.SLOW_ABOVE} ms`,
    color: '#fbbf24',
  },
  SLOW: {
    id: 'slow',
    label: `Over ${LATENCY_THRESHOLDS_MS.SLOW_ABOVE} ms`,
    color: '#ff5a36',
  },
});
