import { DNS_RECORD_TYPE, DNS_RESPONSE_STATUS, ENDPOINT_LOOKUP_ERROR } from '@/constants/customEndpoints';
import { EXTERNAL_URLS } from '@/constants/externalUrls';

async function queryDns(hostname, recordType, signal) {
  const url = new URL(EXTERNAL_URLS.dnsOverHttps);
  url.searchParams.set('name', hostname);
  url.searchParams.set('type', String(recordType));

  const response = await fetch(url, { headers: { accept: 'application/dns-json' }, signal });
  if (!response.ok) throw new Error(ENDPOINT_LOOKUP_ERROR.UNAVAILABLE);
  return response.json();
}

/**
 * Resolves a hostname to its first IP address via DNS-over-HTTPS (browsers have no DNS API).
 * Tries IPv4 first, then IPv6. CNAME chains are followed by the resolver.
 * @returns {Promise<string>}
 */
export async function resolveHostname(hostname, signal) {
  for (const recordType of [DNS_RECORD_TYPE.A, DNS_RECORD_TYPE.AAAA]) {
    const answer = await queryDns(hostname, recordType, signal);
    if (answer.Status === DNS_RESPONSE_STATUS.NAME_ERROR) throw new Error(ENDPOINT_LOOKUP_ERROR.NOT_FOUND);

    const address = answer.Answer?.find((record) => record.type === recordType)?.data;
    if (address) return address;
  }
  throw new Error(ENDPOINT_LOOKUP_ERROR.NO_ADDRESS);
}
