import { ENDPOINT_LOOKUP_ERROR } from '@/constants/customEndpoints';
import { EXTERNAL_URLS } from '@/constants/externalUrls';
import { hasValidCoordinates } from '@/utils/geo';

/**
 * @typedef {Object} IpInfo
 * @property {number} lat
 * @property {number} lng
 * @property {string} city
 * @property {string} country
 * @property {string} countryCode
 * @property {number} [asn]           Autonomous system number of the network owner
 * @property {string} [organization]  Network owner, e.g. "Cloudflare, Inc."
 */

/**
 * Location and network owner of an IP address. Reserved ranges (private, loopback, …)
 * have no location and are rejected.
 * @returns {Promise<IpInfo>}
 */
export async function lookupIp(ip, signal) {
  const response = await fetch(EXTERNAL_URLS.ipwhoisLookup(ip), { signal });
  if (!response.ok) throw new Error(ENDPOINT_LOOKUP_ERROR.UNAVAILABLE);

  const data = await response.json();
  if (!data.success) {
    const isReserved = /reserved|private|bogon/i.test(data.message ?? '');
    throw new Error(isReserved ? ENDPOINT_LOOKUP_ERROR.PRIVATE_ADDRESS : ENDPOINT_LOOKUP_ERROR.UNAVAILABLE);
  }

  const info = {
    lat: data.latitude,
    lng: data.longitude,
    city: data.city,
    country: data.country,
    countryCode: data.country_code,
    asn: data.connection?.asn,
    organization: data.connection?.org || data.connection?.isp,
  };
  if (!hasValidCoordinates(info)) throw new Error(ENDPOINT_LOOKUP_ERROR.UNAVAILABLE);
  return info;
}
