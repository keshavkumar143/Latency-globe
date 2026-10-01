export const LOCATION_SOURCE = Object.freeze({
  /** Browser Geolocation API: GPS / Wi-Fi accurate. */
  PRECISE: 'precise',
  /** Approximate city from the user's IP address. */
  IP: 'ip',
});

export const LOCATION_STATUS = Object.freeze({
  LOADING: 'loading',
  READY: 'ready',
  UNAVAILABLE: 'unavailable',
});

export const GEOLOCATION_OPTIONS = Object.freeze({
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 10 * 60_000,
});

export const IP_LOOKUP_TIMEOUT_MS = 5000;

export const LOCATION_ERROR = Object.freeze({
  PERMISSION_DENIED: 'Location permission denied',
  UNAVAILABLE: 'Precise location unavailable',
});

export const LOCATION_SOURCE_DESCRIPTION = Object.freeze({
  [LOCATION_SOURCE.PRECISE]: 'Precise, from your browser',
  [LOCATION_SOURCE.IP]: 'Approximate, based on your IP address',
});
