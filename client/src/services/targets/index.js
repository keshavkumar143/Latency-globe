import { buildAwsTargets } from './awsTargets';
import { buildAzureTargets } from './azureTargets';
import { buildGcpTargets } from './gcpTargets';

export { loadCloudflareEdgeTarget } from './cloudflareTarget';

/**
 * Every fixed region target across providers. Cloudflare's edge depends on where the
 * user is, so it's loaded separately with loadCloudflareEdgeTarget().
 * @returns {import('@/types/latency').Target[]}
 */
export function buildRegionTargets() {
  return [...buildAwsTargets(), ...buildGcpTargets(), ...buildAzureTargets()];
}
