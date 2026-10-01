import { useCallback, useEffect, useState } from 'react';
import { LOCATION_ERROR, LOCATION_SOURCE, LOCATION_STATUS } from '@/constants/location';
import { getBrowserPosition, isGeolocationGranted } from '@/services/location/browserGeolocation';
import { getIpLocation } from '@/services/location/ipGeolocation';

/**
 * @typedef {Object} UserLocation
 * @property {number} lat
 * @property {number} lng
 * @property {string} source        A LOCATION_SOURCE value
 * @property {string} [city]        From IP lookup, so approximate even when source is PRECISE
 * @property {string} [country]
 * @property {string} [countryCode]
 */

/** Precise coordinates win; the IP lookup still supplies the city and country names. */
function combineLocations(precisePosition, ipLocation) {
  if (precisePosition) return { ...ipLocation, ...precisePosition, source: LOCATION_SOURCE.PRECISE };
  if (ipLocation) return { ...ipLocation, source: LOCATION_SOURCE.IP };
  return null;
}

/**
 * Where the user is. Uses the browser Geolocation API when permission is already granted,
 * otherwise falls back to IP geolocation without prompting. Prompting on page load is
 * blocked or penalized by browsers, so `requestPreciseLocation` asks only on a user action.
 */
export function useUserLocation() {
  /** @type {[UserLocation | null, Function]} */
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState(LOCATION_STATUS.LOADING);
  const [ipLocation, setIpLocation] = useState(null);
  const [preciseError, setPreciseError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    async function resolveLocation() {
      const ipLookup = getIpLocation().catch(() => null);
      const precisePosition = (await isGeolocationGranted()) ? await getBrowserPosition().catch(() => null) : null;
      const ipResult = await ipLookup;
      if (isCancelled) return;

      const resolved = combineLocations(precisePosition, ipResult);
      setIpLocation(ipResult);
      setLocation(resolved);
      setStatus(resolved ? LOCATION_STATUS.READY : LOCATION_STATUS.UNAVAILABLE);
    }

    resolveLocation();
    return () => {
      isCancelled = true;
    };
  }, []);

  const requestPreciseLocation = useCallback(async () => {
    setPreciseError(null);
    try {
      const precisePosition = await getBrowserPosition();
      setLocation(combineLocations(precisePosition, ipLocation));
      setStatus(LOCATION_STATUS.READY);
    } catch (error) {
      const isPermissionDenied = error instanceof GeolocationPositionError && error.code === error.PERMISSION_DENIED;
      setPreciseError(isPermissionDenied ? LOCATION_ERROR.PERMISSION_DENIED : LOCATION_ERROR.UNAVAILABLE);
    }
  }, [ipLocation]);

  return { location, status, preciseError, requestPreciseLocation };
}
