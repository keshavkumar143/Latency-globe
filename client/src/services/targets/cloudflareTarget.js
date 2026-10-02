import { EXTERNAL_URLS } from '@/constants/externalUrls';
import { CLOUDFLARE_UNLOCATED_EDGE, PROVIDER_ID } from '@/constants/providers';
import { getCloudflareMeta } from '@/services/network/cloudflareMeta';

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

async function findEdgeFromMeta() {
  const { edge } = await getCloudflareMeta();
  if (!edge) throw new Error('Cloudflare meta has no edge');
  return edge;
}

async function findEdgeFromTrace(signal) {
  const [traceResponse, { default: locations }] = await Promise.all([
    fetch(EXTERNAL_URLS.cloudflareTrace, { cache: 'no-store', signal }),
    import('@/data/cloudflareLocations.json'),
  ]);
  const { colo } = parseTrace(await traceResponse.text());
  const location = locations[colo];
  if (!location) throw new Error(`Unknown Cloudflare location: ${colo}`);
  return { code: colo, city: location.city, lat: location.lat, lng: location.lng };
}

/**
 * Cloudflare is anycast, so individual data centers can't be targeted: this is a single
 * target for whichever edge serves the user. It never fails because of the lookup: if the
 * edge can't be identified (privacy extensions block some Cloudflare endpoints), it's
 * returned without coordinates, so it's still measured and listed, just not mapped.
 * @param {AbortSignal} [signal]
 * @returns {Promise<import('@/types/latency').Target>}
 */
export async function loadCloudflareEdgeTarget(signal) {
  let edge = { ...CLOUDFLARE_UNLOCATED_EDGE, lat: null, lng: null };
  for (const findEdge of [findEdgeFromMeta, findEdgeFromTrace]) {
    try {
      edge = await findEdge(signal);
      break;
    } catch {
      signal?.throwIfAborted();
    }
  }

  return {
    id: CLOUDFLARE_EDGE_TARGET_ID,
    provider: PROVIDER_ID.CLOUDFLARE,
    ...edge,
    url: EXTERNAL_URLS.cloudflareEdgePing,
    isAnycastEdge: true,
  };
}
