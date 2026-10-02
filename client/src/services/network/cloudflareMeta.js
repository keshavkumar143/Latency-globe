import { EXTERNAL_URLS } from '@/constants/externalUrls';
import { IP_LOOKUP_TIMEOUT_MS } from '@/constants/location';
import { countryNameFromCode, hasValidCoordinates } from '@/utils/geo';

/**
 * @typedef {Object} CloudflareMeta
 * @property {import('@/services/location/ipGeolocation').IpLocation | null} visitor  Cloudflare's IP geolocation of the user
 * @property {{ code: string, city: string, lat: number, lng: number } | null} edge  The user's nearest Cloudflare data center
 */

let pendingMeta = null;

async function fetchCloudflareMeta() {
  const response = await fetch(EXTERNAL_URLS.cloudflareMeta, { signal: AbortSignal.timeout(IP_LOOKUP_TIMEOUT_MS) });
  if (!response.ok) throw new Error(`Cloudflare meta unavailable (HTTP ${response.status})`);
  const data = await response.json();

  const visitor = {
    lat: Number(data.latitude),
    lng: Number(data.longitude),
    city: data.city,
    country: countryNameFromCode(data.country),
    countryCode: data.country,
  };
  const edge = data.colo?.iata
    ? { code: data.colo.iata, city: data.colo.city, lat: Number(data.colo.lat), lng: Number(data.colo.lon) }
    : null;

  return {
    visitor: hasValidCoordinates(visitor) ? visitor : null,
    edge: edge && hasValidCoordinates(edge) ? edge : null,
  };
}

/**
 * Cloudflare's view of the user: where their IP is, and which edge serves them. The user's
 * location and the Cloudflare target both need it, so they share one request. Failures
 * aren't cached, so a later call retries.
 * @returns {Promise<CloudflareMeta>}
 */
export function getCloudflareMeta() {
  pendingMeta ??= fetchCloudflareMeta().catch((error) => {
    pendingMeta = null;
    throw error;
  });
  return pendingMeta;
}
