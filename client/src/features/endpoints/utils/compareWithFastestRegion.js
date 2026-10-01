import { COMPARISON_MIN_SAVINGS_MS } from '@/constants/customEndpoints';
import { TEST_STATUS } from '@/constants/testStatus';

/**
 * How an endpoint's latency compares with the fastest cloud region measured from here.
 * Null until both have been measured.
 */
export function compareWithFastestRegion(endpointResult, fastestRegionRow) {
  if (endpointResult?.status !== TEST_STATUS.DONE || !fastestRegionRow) return null;

  const savingsMs = endpointResult.medianMs - fastestRegionRow.result.medianMs;
  return {
    endpointMs: endpointResult.medianMs,
    region: fastestRegionRow.target,
    regionMs: fastestRegionRow.result.medianMs,
    savingsMs,
    isWorthMoving: savingsMs >= COMPARISON_MIN_SAVINGS_MS,
  };
}
