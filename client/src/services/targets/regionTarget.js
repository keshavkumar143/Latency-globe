/**
 * Turns a regions.json entry into a measurable Target.
 * @param {{ provider: string, code: string, city: string, lat: number, lng: number }} region
 * @param {string} url
 * @returns {import('@/types/latency').Target}
 */
export function toRegionTarget(region, url) {
  return { ...region, id: `${region.provider}:${region.code}`, url };
}
