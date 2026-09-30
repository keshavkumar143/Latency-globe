/**
 * Median of a list of numbers, or null for an empty list.
 * @param {number[]} values
 * @returns {number|null}
 */
export function median(values) {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const isOddLength = sorted.length % 2 === 1;

  return isOddLength ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
