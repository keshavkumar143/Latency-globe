import { EXTERNAL_URLS } from '@/constants/externalUrls';
import { PROVIDER_ID } from '@/constants/providers';
import gcpPingUrls from '@/data/gcpPingUrls.json';
import regions from '@/data/regions.json';
import { toRegionTarget } from './regionTarget';

/**
 * GCP regions, timed against gcping.com's per-region Cloud Run services. The URL list is a
 * snapshot of https://global.gcping.com/api/endpoints, which can't be fetched from a browser
 * (no CORS headers).
 * @returns {import('@/types/latency').Target[]}
 */
export function buildGcpTargets() {
  return regions
    .filter((region) => region.provider === PROVIDER_ID.GCP && gcpPingUrls[region.code])
    .map((region) => toRegionTarget(region, `${gcpPingUrls[region.code]}${EXTERNAL_URLS.gcpPingPath}`));
}
