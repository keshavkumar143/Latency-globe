import { ENDPOINTS } from '@/constants/endpoints';
import { PROVIDER_ID } from '@/constants/providers';
import regions from '@/data/regions.json';

/** @returns {import('@/types/latency').Target[]} */
export function buildAwsTargets() {
  return regions
    .filter((region) => region.provider === PROVIDER_ID.AWS)
    .map((region) => ({
      ...region,
      id: `${region.provider}:${region.code}`,
      url: ENDPOINTS.awsPing(region.code),
    }));
}
