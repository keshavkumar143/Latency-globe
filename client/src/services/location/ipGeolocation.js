import { EXTERNAL_URLS } from '@/constants/externalUrls';
import { IP_LOOKUP_TIMEOUT_MS } from '@/constants/location';
import { hasValidCoordinates } from '@/utils/geo';

/**
 * @typedef {Object} IpLocation
 * @property {number} lat
 * @property {number} lng
 * @property {string} city
 * @property {string} country
 * @property {string} countryCode  ISO 3166-1 alpha-2
 */

/** Each service has its own response shape; `parse` maps it to an IpLocation. */
const IP_LOOKUP_SERVICES = [
  {
    url: EXTERNAL_URLS.geojsIpLookup,
    parse: (data) => ({
      lat: Number(data.latitude),
      lng: Number(data.longitude),
      city: data.city,
      country: data.country,
      countryCode: data.country_code,
    }),
  },
  {
    url: EXTERNAL_URLS.ipwhoisIpLookup,
    parse: (data) => ({
      lat: Number(data.latitude),
      lng: Number(data.longitude),
      city: data.city,
      country: data.country,
      countryCode: data.country_code,
    }),
  },
];

/**
 * Approximate location from the user's IP address. Tries each service in order.
 * @returns {Promise<IpLocation>}
 */
export async function getIpLocation() {
  for (const service of IP_LOOKUP_SERVICES) {
    try {
      const response = await fetch(service.url, { signal: AbortSignal.timeout(IP_LOOKUP_TIMEOUT_MS) });
      if (!response.ok) continue;

      const location = service.parse(await response.json());
      if (hasValidCoordinates(location)) return location;
    } catch {
      // Try the next service.
    }
  }
  throw new Error('IP geolocation is unavailable');
}
