import { EXTERNAL_URLS } from '@/constants/externalUrls';
import { IP_LOOKUP_TIMEOUT_MS } from '@/constants/location';
import { getCloudflareMeta } from '@/services/network/cloudflareMeta';
import { hasValidCoordinates } from '@/utils/geo';

/**
 * @typedef {Object} IpLocation
 * @property {number} lat
 * @property {number} lng
 * @property {string} city
 * @property {string} country
 * @property {string} countryCode  ISO 3166-1 alpha-2
 */

async function fetchJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(IP_LOOKUP_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

/** geojs.io and ipwho.is return the same field names. */
function parseGeoResponse(data) {
  return {
    lat: Number(data.latitude),
    lng: Number(data.longitude),
    city: data.city,
    country: data.country,
    countryCode: data.country_code,
  };
}

/**
 * Lookups tried in order. Cloudflare's comes first: it's typically the most accurate, and
 * its request is shared with finding the user's nearest Cloudflare edge.
 */
const IP_LOOKUPS = [
  async () => (await getCloudflareMeta()).visitor,
  async () => parseGeoResponse(await fetchJson(EXTERNAL_URLS.geojsIpLookup)),
  async () => parseGeoResponse(await fetchJson(EXTERNAL_URLS.ipwhoisIpLookup)),
];

/**
 * Approximate location from the user's IP address.
 * @returns {Promise<IpLocation>}
 */
export async function getIpLocation() {
  for (const lookup of IP_LOOKUPS) {
    try {
      const location = await lookup();
      if (location && hasValidCoordinates(location)) return location;
    } catch {
      // Try the next service.
    }
  }
  throw new Error('IP geolocation is unavailable');
}
