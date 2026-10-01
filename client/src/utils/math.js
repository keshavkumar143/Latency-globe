/** @param {number} value @param {number} min @param {number} max */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Deterministic number in [0, 1) derived from a string: the same input always gives the
 * same output. Useful for stable "random" variation, such as staggering animations.
 * @param {string} text
 */
export function hashToUnitInterval(text) {
  let hash = 0;
  for (const character of text) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return hash / 2 ** 32;
}
