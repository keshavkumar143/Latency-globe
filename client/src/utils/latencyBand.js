import { LATENCY_BANDS, LATENCY_THRESHOLDS_MS } from '@/constants/latency';

/**
 * @param {number} latencyMs
 * @returns {(typeof LATENCY_BANDS)[keyof typeof LATENCY_BANDS]}
 */
export function getLatencyBand(latencyMs) {
  if (latencyMs < LATENCY_THRESHOLDS_MS.FAST_BELOW) return LATENCY_BANDS.FAST;
  if (latencyMs <= LATENCY_THRESHOLDS_MS.SLOW_ABOVE) return LATENCY_BANDS.MODERATE;
  return LATENCY_BANDS.SLOW;
}

/** @param {number} latencyMs */
export function getLatencyColor(latencyMs) {
  return getLatencyBand(latencyMs).color;
}
