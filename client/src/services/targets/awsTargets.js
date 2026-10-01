import { EXTERNAL_URLS } from '@/constants/externalUrls';
import { PROVIDER_ID } from '@/constants/providers';
import regions from '@/data/regions.json';
import { toRegionTarget } from './regionTarget';

/** @returns {import('@/types/latency').Target[]} */
export function buildAwsTargets() {
  return regions
    .filter((region) => region.provider === PROVIDER_ID.AWS)
    .map((region) => toRegionTarget(region, EXTERNAL_URLS.awsPing(region.code)));
}
