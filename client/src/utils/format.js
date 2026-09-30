/** @param {number} ms */
export function formatMs(ms) {
  return `${Math.round(ms)} ms`;
}

/**
 * Formats a count with a noun, e.g. pluralize(1, 'request') → "1 request",
 * pluralize(4, 'request') → "4 requests".
 */
export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
