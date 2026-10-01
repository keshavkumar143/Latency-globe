import { useCallback, useEffect } from 'react';
import { GLOBE_CAMERA } from '@/constants/globe';
import { clamp } from '@/utils/math';

/**
 * Drives the globe camera: slow auto-rotation that stops for good on the first
 * interaction, a fly-in to the user, zooming in on the focused marker, and the zoom/home
 * actions behind the map controls.
 *
 * @param {import('react').RefObject} globeRef
 * @param {{ isReady: boolean, userLocation: object | null, focus: { lat: number, lng: number } | null, allowAutoRotate: boolean }} options
 */
export function useGlobeCamera(globeRef, { isReady, userLocation, focus, allowAutoRotate }) {
  const stopAutoRotate = useCallback(() => {
    if (globeRef.current) globeRef.current.controls().autoRotate = false;
  }, [globeRef]);

  useEffect(() => {
    if (!isReady) return undefined;

    const globe = globeRef.current;
    const controls = globe.controls();
    controls.maxDistance = globe.getGlobeRadius() * (1 + GLOBE_CAMERA.MAX_ALTITUDE);
    controls.autoRotate = allowAutoRotate;
    controls.autoRotateSpeed = GLOBE_CAMERA.AUTO_ROTATE_SPEED;

    controls.addEventListener('start', stopAutoRotate);
    return () => controls.removeEventListener('start', stopAutoRotate);
  }, [globeRef, isReady, allowAutoRotate, stopAutoRotate]);

  const userLat = userLocation?.lat;
  const userLng = userLocation?.lng;

  const flyHome = useCallback(() => {
    if (!globeRef.current || userLat === undefined) return;
    globeRef.current.pointOfView(
      { lat: userLat, lng: userLng, altitude: GLOBE_CAMERA.HOME_ALTITUDE },
      GLOBE_CAMERA.FLY_TO_USER_MS,
    );
  }, [globeRef, userLat, userLng]);

  // Fly to the user once their location is known (and again if it becomes more precise).
  useEffect(() => {
    if (isReady) flyHome();
  }, [isReady, flyHome]);

  const focusLat = focus?.lat;
  const focusLng = focus?.lng;

  // Zoom in on the focused marker; keep the current zoom if already closer.
  useEffect(() => {
    if (!isReady || focusLat === undefined) return;
    const globe = globeRef.current;
    stopAutoRotate();
    const altitude = Math.min(globe.pointOfView().altitude, GLOBE_CAMERA.FOCUS_ALTITUDE);
    globe.pointOfView({ lat: focusLat, lng: focusLng, altitude }, GLOBE_CAMERA.FLY_TO_SELECTION_MS);
  }, [globeRef, isReady, focusLat, focusLng, stopAutoRotate]);

  const zoomBy = useCallback(
    (factor) => {
      const globe = globeRef.current;
      if (!globe) return;
      stopAutoRotate();
      const view = globe.pointOfView();
      const altitude = clamp(view.altitude * factor, GLOBE_CAMERA.MIN_BUTTON_ALTITUDE, GLOBE_CAMERA.MAX_ALTITUDE);
      globe.pointOfView({ ...view, altitude }, GLOBE_CAMERA.ZOOM_STEP_MS);
    },
    [globeRef, stopAutoRotate],
  );

  const zoomIn = useCallback(() => zoomBy(1 / GLOBE_CAMERA.ZOOM_STEP_FACTOR), [zoomBy]);
  const zoomOut = useCallback(() => zoomBy(GLOBE_CAMERA.ZOOM_STEP_FACTOR), [zoomBy]);
  const goHome = useCallback(() => {
    stopAutoRotate();
    flyHome();
  }, [stopAutoRotate, flyHome]);

  return { zoomIn, zoomOut, goHome };
}
