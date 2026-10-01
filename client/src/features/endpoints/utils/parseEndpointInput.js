import {
  ALLOWED_PROTOCOLS,
  DEFAULT_PROTOCOL,
  ENDPOINT_INPUT_ERROR,
  HOSTNAME_PATTERN,
  IPV4_PATTERN,
} from '@/constants/customEndpoints';

const HAS_PROTOCOL_PATTERN = /^[a-z][a-z\d+.-]*:\/\//i;

/**
 * Validates what the user typed and turns it into a full URL. Accepts http/https URLs and
 * plain domains or IPv4 addresses (https:// is added when no protocol is given).
 * @param {string} rawInput
 * @returns {{ ok: true, url: string, hostname: string } | { ok: false, error: string }}
 */
export function parseEndpointInput(rawInput) {
  const input = rawInput.trim();
  if (!input) return { ok: false, error: ENDPOINT_INPUT_ERROR.EMPTY };

  let url;
  try {
    url = new URL(HAS_PROTOCOL_PATTERN.test(input) ? input : `${DEFAULT_PROTOCOL}${input}`);
  } catch {
    return { ok: false, error: ENDPOINT_INPUT_ERROR.INVALID };
  }

  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) return { ok: false, error: ENDPOINT_INPUT_ERROR.PROTOCOL };
  if (url.username || url.password) return { ok: false, error: ENDPOINT_INPUT_ERROR.CREDENTIALS };

  const { hostname } = url;
  if (!HOSTNAME_PATTERN.test(hostname) && !IPV4_PATTERN.test(hostname)) {
    return { ok: false, error: ENDPOINT_INPUT_ERROR.INVALID };
  }

  return { ok: true, url: url.href, hostname };
}
