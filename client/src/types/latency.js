/**
 * Shared data shapes, documented with JSDoc so editors can offer autocomplete.
 * Import in a JSDoc comment: @param {import('@/types/latency').Target} target
 */

/**
 * Something to measure: a cloud region now, a custom endpoint later.
 * @typedef {Object} Target
 * @property {string} id        Unique key, e.g. "aws:us-east-1"
 * @property {string} provider  A PROVIDER_ID value
 * @property {string} code      Region code, e.g. "us-east-1"
 * @property {string} city      Display name, e.g. "N. Virginia"
 * @property {number} lat
 * @property {number} lng
 * @property {string} url       The URL that gets timed
 */

/**
 * Output of measureLatency().
 * @typedef {Object} LatencyMeasurement
 * @property {number}      medianMs   Median of the timed requests
 * @property {number|null} coldMs     First warm-up request (includes DNS + TCP + TLS), or null with no warm-up
 * @property {number[]}    samplesMs  Every successful timed request
 */

/**
 * A target's state within a test run. Holds the LatencyMeasurement fields once status is DONE.
 * @typedef {Object} TestResult
 * @property {string}   status      A TEST_STATUS value
 * @property {number}   [medianMs]
 * @property {number}   [coldMs]
 * @property {number[]} [samplesMs]
 * @property {string}   [error]     A MEASUREMENT_ERROR value when status is ERROR
 */

export {};
