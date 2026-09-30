import {
  CACHE_BUST_PARAM,
  MEASUREMENT_ERROR,
  PING_FETCH_OPTIONS,
  REQUEST_TIMEOUT_MS,
  TIMED_REQUEST_COUNT,
  WARMUP_REQUEST_COUNT,
} from '@/constants/measurement';
import { median } from '@/utils/statistics';
import { addCacheBuster } from '@/utils/url';

// Browsers can't send ICMP pings, so latency here means the HTTP round-trip time of a
// tiny request: from sending it until the response headers arrive.

/**
 * Times a single request in milliseconds. Rejects on network error, timeout, or abort.
 * @param {string} url
 * @param {{ timeoutMs: number, signal?: AbortSignal }} options
 */
async function timeSingleRequest(url, { timeoutMs, signal }) {
  const abortSignals = [AbortSignal.timeout(timeoutMs)];
  if (signal) abortSignals.push(signal);

  const startedAt = performance.now();
  await fetch(addCacheBuster(url, CACHE_BUST_PARAM), {
    ...PING_FETCH_OPTIONS,
    signal: AbortSignal.any(abortSignals),
  });
  return performance.now() - startedAt;
}

/**
 * Measures latency to `url`. Warm-up requests open the connection (DNS + TCP + TLS);
 * the first one is reported as `coldMs` and left out of the median. The timed requests
 * then reuse that connection. A failed timed request is skipped, but a failed warm-up
 * or all timed requests failing rejects the promise.
 *
 * @param {string} url
 * @param {{ warmupCount?: number, timedCount?: number, timeoutMs?: number, signal?: AbortSignal }} [options]
 * @returns {Promise<import('@/types/latency').LatencyMeasurement>}
 */
export async function measureLatency(url, options = {}) {
  const {
    warmupCount = WARMUP_REQUEST_COUNT,
    timedCount = TIMED_REQUEST_COUNT,
    timeoutMs = REQUEST_TIMEOUT_MS,
    signal,
  } = options;
  const requestOptions = { timeoutMs, signal };

  let coldMs = null;
  for (let i = 0; i < warmupCount; i += 1) {
    const elapsedMs = await timeSingleRequest(url, requestOptions);
    coldMs ??= elapsedMs;
  }

  const samplesMs = [];
  for (let i = 0; i < timedCount; i += 1) {
    try {
      samplesMs.push(await timeSingleRequest(url, requestOptions));
    } catch (error) {
      if (signal?.aborted) throw error;
    }
  }

  if (samplesMs.length === 0) throw new Error(MEASUREMENT_ERROR.ALL_SAMPLES_FAILED);

  return { medianMs: median(samplesMs), coldMs, samplesMs };
}

/**
 * Maps an error thrown by measureLatency() to a short user-facing message.
 * @param {unknown} error
 */
export function describeMeasurementError(error) {
  if (error?.name === 'TimeoutError') return MEASUREMENT_ERROR.TIMEOUT;
  if (error?.name === 'AbortError') return MEASUREMENT_ERROR.STOPPED;
  return MEASUREMENT_ERROR.UNREACHABLE;
}
