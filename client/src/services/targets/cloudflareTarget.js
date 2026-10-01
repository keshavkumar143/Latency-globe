import { EXTERNAL_URLS } from '@/constants/externalUrls';
import { PROVIDER_ID } from '@/constants/providers';

export const CLOUDFLARE_EDGE_TARGET_ID = `${PROVIDER_ID.CLOUDFLARE}:edge`;

/** Parses Cloudflare's key=value trace format into an object. */
function parseTrace(text) {
  return Object.fromEntries(
    text
      .trim()
      .split('\n')
      .map((line) => line.split('=')),
  );
}

/**
 * Cloudflare is anycast, so individual data centers can't be targeted. This finds the
 * user's nearest edge (the "colo", an airport code) and returns it as a single target.
 * @param {AbortSignal} [signal]
 * @returns {Promise<import('@/types/latency').Target>}
 */
export async function loadCloudflareEdgeTarget(signal) {
  const [traceResponse, { default: locations }] = await Promise.all([
    fetch(EXTERNAL_URLS.cloudflareTraceForLocation, { cache: 'no-store', signal }),
    import('@/data/cloudflareLocations.json'),
  ]);
  const { colo } = parseTrace(await traceResponse.text());
  const location = locations[colo];
  if (!location) throw new Error(`Unknown Cloudflare location: ${colo}`);

  return {
    id: CLOUDFLARE_EDGE_TARGET_ID,
    provider: PROVIDER_ID.CLOUDFLARE,
    code: colo,
    city: location.city,
    lat: location.lat,
    lng: location.lng,
    url: EXTERNAL_URLS.cloudflareTrace,
    isAnycastEdge: true,
  };
}
