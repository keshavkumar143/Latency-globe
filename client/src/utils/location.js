import { LOCATION_SOURCE, LOCATION_SOURCE_DESCRIPTION } from '@/constants/location';
import { formatCoordinates } from '@/utils/geo';

/**
 * Display text for a user location. IP lookups give a city name; precise positions show
 * coordinates, because the IP-derived city can be far from the real position.
 * @param {import('@/features/location/hooks/useUserLocation').UserLocation} location
 * @returns {{ title: string, detail: string }}
 */
export function describeLocation(location) {
  const hasPlaceName = location.source === LOCATION_SOURCE.IP && location.city;
  const title = hasPlaceName
    ? [location.city, location.country].filter(Boolean).join(', ')
    : formatCoordinates(location.lat, location.lng);

  return { title, detail: LOCATION_SOURCE_DESCRIPTION[location.source] };
}
