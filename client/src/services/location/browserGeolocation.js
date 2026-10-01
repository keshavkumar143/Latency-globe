import { GEOLOCATION_OPTIONS } from '@/constants/location';

/**
 * The user's coordinates from the browser Geolocation API. Shows a permission prompt if
 * the user hasn't decided yet, so call it from a user action unless permission is
 * already granted.
 * @returns {Promise<{ lat: number, lng: number }>}
 */
export function getBrowserPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ lat: coords.latitude, lng: coords.longitude }),
      reject,
      GEOLOCATION_OPTIONS,
    );
  });
}

/** True when location access is already granted, so getBrowserPosition() won't prompt. */
export async function isGeolocationGranted() {
  try {
    const permission = await navigator.permissions?.query({ name: 'geolocation' });
    return permission?.state === 'granted';
  } catch {
    return false;
  }
}
