/**
 * Converts a 6-digit hex color to rgba() at the given alpha (0–1). The output works in
 * both CSS and three.js, unlike color-mix().
 * @param {string} hexColor e.g. "#ff9900"
 * @param {number} alpha
 */
export function withAlpha(hexColor, alpha) {
  const hex = hexColor.replace('#', '');
  const [red, green, blue] = [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
