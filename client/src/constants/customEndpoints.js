/** Saved custom endpoints beyond this drop the oldest. */
export const MAX_SAVED_ENDPOINTS = 8;

export const SAVED_ENDPOINTS_STORAGE_KEY = 'pingatlas:endpoints';

export const ALLOWED_PROTOCOLS = Object.freeze(['http:', 'https:']);
export const DEFAULT_PROTOCOL = 'https://';

/** Hostname: dot-separated labels of letters, digits and hyphens, ending in a letter-only TLD. */
export const HOSTNAME_PATTERN = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
export const IPV4_PATTERN = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

export const ENDPOINT_INPUT_ERROR = Object.freeze({
  EMPTY: 'Enter a URL or domain, e.g. api.example.com',
  INVALID: "That doesn't look like a URL or domain",
  PROTOCOL: 'Only http:// and https:// URLs can be tested',
  CREDENTIALS: "URLs with a username or password aren't supported",
});

export const ENDPOINT_LOOKUP_ERROR = Object.freeze({
  NOT_FOUND: 'Domain not found',
  NO_ADDRESS: 'Domain has no IP address',
  PRIVATE_ADDRESS: 'Private or reserved IP address',
  UNAVAILABLE: 'Location lookup unavailable',
});

export const LOOKUP_STATUS = Object.freeze({
  LOADING: 'loading',
  DONE: 'done',
  ERROR: 'error',
});

export const DNS_RECORD_TYPE = Object.freeze({ A: 1, AAAA: 28 });
export const DNS_RESPONSE_STATUS = Object.freeze({ NO_ERROR: 0, NAME_ERROR: 3 });

/** Networks that serve from anycast edges: the IP's location is the company, not the server you reach. */
export const KNOWN_CDN_ASNS = Object.freeze([13335, 54113, 20940, 16625, 15133, 60068]);
export const CDN_ORGANIZATION_PATTERN =
  /cloudflare|fastly|akamai|cloudfront|edgecast|edgio|bunny|cdn77|stackpath|imperva|incapsula/i;

/** Only suggest moving closer when the fastest region would save at least this much. */
export const COMPARISON_MIN_SAVINGS_MS = 10;
