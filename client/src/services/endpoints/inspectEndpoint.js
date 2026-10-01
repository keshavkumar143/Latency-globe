import { CDN_ORGANIZATION_PATTERN, IPV4_PATTERN, KNOWN_CDN_ASNS } from '@/constants/customEndpoints';
import { resolveHostname } from '@/services/network/dnsOverHttps';
import { lookupIp } from '@/services/network/ipInfo';

/**
 * @typedef {import('@/services/network/ipInfo').IpInfo & {
 *   ip: string,
 *   isLikelyCdn: boolean,
 * }} EndpointLookup
 */

/** Anycast CDNs answer from the edge nearest the user, wherever their IP says they are. */
function isLikelyCdn({ asn, organization }) {
  return KNOWN_CDN_ASNS.includes(asn) || CDN_ORGANIZATION_PATTERN.test(organization ?? '');
}

/**
 * Where an endpoint is hosted and who runs the network: DNS → IP → geolocation + owner.
 * Runs entirely in the browser; a server-side inspection (headers, TLS, provider region)
 * can replace this later behind the same shape.
 * @param {string} hostname
 * @param {AbortSignal} [signal]
 * @returns {Promise<EndpointLookup>}
 */
export async function inspectEndpoint(hostname, signal) {
  const ip = IPV4_PATTERN.test(hostname) ? hostname : await resolveHostname(hostname, signal);
  const info = await lookupIp(ip, signal);
  return { ip, ...info, isLikelyCdn: isLikelyCdn(info) };
}
