/**
 * @param {number} lat
 * @param {number} lng
 * @returns {string} e.g. "28.59° N, 76.27° E"
 */
export function formatCoordinates(lat, lng) {
  const latitude = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}`;
  const longitude = `${Math.abs(lng).toFixed(2)}° ${lng >= 0 ? 'E' : 'W'}`;
  return `${latitude}, ${longitude}`;
}

/** @param {{ lat: unknown, lng: unknown }} point */
export function hasValidCoordinates({ lat, lng }) {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}
