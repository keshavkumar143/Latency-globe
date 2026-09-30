/** Untimed requests sent first to absorb DNS + TCP + TLS setup. */
export const WARMUP_REQUEST_COUNT = 1;

/** Timed requests per target. The reported latency is their median. */
export const TIMED_REQUEST_COUNT = 4;

/** A single request slower than this is abandoned. */
export const REQUEST_TIMEOUT_MS = 5000;

/** Targets measured in parallel. */
export const MAX_CONCURRENT_TARGETS = 4;

/** Query param that makes every request URL unique, so nothing is served from a cache. */
export const CACHE_BUST_PARAM = '_lg';

/**
 * fetch() options for timing requests. "no-cors" returns an opaque response we can't
 * read (we only need the timing), and "no-store" bypasses the HTTP cache.
 */
export const PING_FETCH_OPTIONS = Object.freeze({
  mode: 'no-cors',
  cache: 'no-store',
  credentials: 'omit',
});

export const MEASUREMENT_ERROR = Object.freeze({
  TIMEOUT: 'Timed out',
  STOPPED: 'Stopped',
  UNREACHABLE: 'Unreachable',
  ALL_SAMPLES_FAILED: 'All timed requests failed',
});
