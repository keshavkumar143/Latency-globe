import { AZURE_ENDPOINT_OVERRIDES } from '@/config/azureEndpoints';
import { EXTERNAL_URLS } from '@/constants/externalUrls';
import { PROVIDER_ID } from '@/constants/providers';
import regions from '@/data/regions.json';
import { toRegionTarget } from './regionTarget';

/** @returns {import('@/types/latency').Target[]} */
export function buildAzureTargets() {
  return regions
    .filter((region) => region.provider === PROVIDER_ID.AZURE)
    .map((region) =>
      toRegionTarget(region, AZURE_ENDPOINT_OVERRIDES[region.code] ?? EXTERNAL_URLS.azurePing(region.code)),
    );
}
