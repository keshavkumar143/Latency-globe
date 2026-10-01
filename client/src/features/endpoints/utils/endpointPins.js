import { hasLocation } from './endpointRecords';

/**
 * Located endpoints in the shape the globe draws.
 * @param {import('./endpointRecords').CustomEndpoint[]} endpoints
 */
export function toGlobePins(endpoints) {
  return endpoints.filter(hasLocation).map(({ id, hostname, lookup, result }) => ({
    id,
    hostname,
    lat: lookup.data.lat,
    lng: lookup.data.lng,
    result,
  }));
}
