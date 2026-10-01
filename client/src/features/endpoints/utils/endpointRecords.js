import { LOOKUP_STATUS, MAX_SAVED_ENDPOINTS } from '@/constants/customEndpoints';
import { TEST_STATUS } from '@/constants/testStatus';

/**
 * @typedef {Object} EndpointLookupState
 * @property {string} status  A LOOKUP_STATUS value
 * @property {import('@/services/endpoints/inspectEndpoint').EndpointLookup} [data]
 * @property {string} [error]
 */

/**
 * @typedef {Object} CustomEndpoint
 * @property {string} id
 * @property {string} url
 * @property {string} hostname
 * @property {number} addedAt
 * @property {import('@/types/latency').TestResult} result
 * @property {EndpointLookupState} [lookup]
 */

const ENDPOINT_ID_PREFIX = 'endpoint:';
const IDLE_RESULT = Object.freeze({ status: TEST_STATUS.IDLE });

/** @param {string} url */
export function getEndpointId(url) {
  return `${ENDPOINT_ID_PREFIX}${url}`;
}

/** @param {string | null} id */
export function isEndpointId(id) {
  return Boolean(id?.startsWith(ENDPOINT_ID_PREFIX));
}

/** Adds or refreshes an endpoint at the top of the list, capped at MAX_SAVED_ENDPOINTS. */
export function upsertEndpoint(endpoints, endpoint) {
  const others = endpoints.filter((existing) => existing.id !== endpoint.id);
  return [endpoint, ...others].slice(0, MAX_SAVED_ENDPOINTS);
}

/** Only finished data is saved; anything mid-flight would be stale after a reload. */
export function toStoredEndpoint({ id, url, hostname, addedAt, result, lookup }) {
  return {
    id,
    url,
    hostname,
    addedAt,
    result: result?.status === TEST_STATUS.DONE ? result : IDLE_RESULT,
    lookup: lookup?.status === LOOKUP_STATUS.DONE ? lookup : undefined,
  };
}

/** @param {unknown} stored */
export function isValidStoredEndpoints(stored) {
  return Array.isArray(stored) && stored.every((endpoint) => endpoint?.id && endpoint?.url && endpoint?.hostname);
}

/** @param {CustomEndpoint} endpoint */
export function hasLocation(endpoint) {
  return endpoint.lookup?.status === LOOKUP_STATUS.DONE;
}
