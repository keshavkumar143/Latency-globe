/**
 * Returns a CSS color at the given opacity (0–1). Works with any CSS color format.
 * @param {string} color
 * @param {number} opacity
 */
export function withOpacity(color, opacity) {
  return `color-mix(in srgb, ${color} ${opacity * 100}%, transparent)`;
}
