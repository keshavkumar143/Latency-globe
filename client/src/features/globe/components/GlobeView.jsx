import { useReducedMotion } from 'motion/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Globe from 'react-globe.gl';
import {
  ARC_KIND,
  GLOBE_ARCS,
  GLOBE_CAMERA,
  GLOBE_COLORS,
  GLOBE_SURFACE,
  MARKER_KIND,
  USER_MARKER_ID,
} from '@/constants/globe';
import { DEFAULT_MAP_STYLE_ID, MAP_STYLE_STORAGE_KEY, MAP_STYLES } from '@/constants/mapStyles';
import { TEST_STATUS } from '@/constants/testStatus';
import { useElementSize } from '@/hooks/useElementSize';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useGlobeCamera } from '../hooks/useGlobeCamera';
import { createLatencyArcBuilder, createMarkerBuilder, getArcStrokeScale } from '../utils/globeLayers';
import { createMarkerHostRegistry, setMarkerVisibility } from '../utils/markerHosts';
import { createBaseMaterial, createStarfieldTexture } from '../utils/sceneAssets';
import { MapStyleSwitcher, ZoomControls } from './MapControls';
import { EndpointMarker } from './markers/EndpointMarker';
import { RegionMarker } from './markers/RegionMarker';
import { UserMarker } from './markers/UserMarker';

const MAP_STYLE_STORAGE_OPTIONS = { isValid: (styleId) => Object.hasOwn(MAP_STYLES, styleId) };

const isMeasured = ({ result }) => result.status === TEST_STATUS.DONE;

/**
 * Interactive 3D globe with real map tiles that sharpen as you zoom, a marker for every
 * region and custom endpoint, and a latency-colored arc from the user to each measured one.
 *
 * @param {{
 *   regionRows: { target: import('@/types/latency').Target, result: import('@/types/latency').TestResult }[],
 *   endpointPins: { id: string, hostname: string, lat: number, lng: number, result: import('@/types/latency').TestResult }[],
 *   userLocation: { lat: number, lng: number } | null,
 *   selectedId: string | null,
 *   onSelect: (markerId: string | null) => void,
 * }} props
 */
export function GlobeView({ regionRows, endpointPins, userLocation, selectedId, onSelect }) {
  const globeRef = useRef(null);
  const wrapperRef = useRef(null);
  const [observeSize, { width, height }] = useElementSize();
  const [isReady, setIsReady] = useState(false);
  const [arcStrokeScale, setArcStrokeScale] = useState(1);
  const shouldReduceMotion = useReducedMotion();

  const [mapStyleId, setMapStyleId] = usePersistentState(
    MAP_STYLE_STORAGE_KEY,
    DEFAULT_MAP_STYLE_ID,
    MAP_STYLE_STORAGE_OPTIONS,
  );
  const mapStyle = MAP_STYLES[mapStyleId];

  // Created once per mount; see each factory for why it caches.
  const [baseMaterial] = useState(createBaseMaterial);
  const [starfieldUrl] = useState(createStarfieldTexture);
  const [buildMarkers] = useState(createMarkerBuilder);
  const [buildLatencyArcs] = useState(createLatencyArcBuilder);
  const [getMarkerHost] = useState(createMarkerHostRegistry);

  const markers = useMemo(
    () =>
      buildMarkers([
        ...regionRows.map(({ target }) => ({
          id: target.id,
          kind: MARKER_KIND.REGION,
          lat: target.lat,
          lng: target.lng,
        })),
        ...endpointPins.map((pin) => ({ id: pin.id, kind: MARKER_KIND.ENDPOINT, lat: pin.lat, lng: pin.lng })),
        ...(userLocation
          ? [{ id: USER_MARKER_ID, kind: MARKER_KIND.USER, lat: userLocation.lat, lng: userLocation.lng }]
          : []),
      ]),
    [buildMarkers, regionRows, endpointPins, userLocation],
  );

  const arcs = useMemo(() => {
    const measuredItems = [
      ...regionRows.filter(isMeasured).map(({ target, result }) => ({ ...target, result })),
      ...endpointPins.filter(isMeasured),
    ];
    const allArcs = buildLatencyArcs(measuredItems, userLocation);
    return shouldReduceMotion ? allArcs.filter((arc) => arc.kind === ARC_KIND.TRAIL) : allArcs;
  }, [buildLatencyArcs, regionRows, endpointPins, userLocation, shouldReduceMotion]);

  const regionRowsById = useMemo(() => new Map(regionRows.map((row) => [row.target.id, row])), [regionRows]);
  const endpointPinsById = useMemo(() => new Map(endpointPins.map((pin) => [pin.id, pin])), [endpointPins]);

  const focusedMarker = markers.find((marker) => marker.id === selectedId) ?? null;
  const { zoomIn, zoomOut, goHome } = useGlobeCamera(globeRef, {
    isReady,
    userLocation,
    focus: focusedMarker,
    allowAutoRotate: !shouldReduceMotion,
  });

  const setWrapperElement = useCallback(
    (element) => {
      wrapperRef.current = element;
      observeSize(element);
    },
    [observeSize],
  );

  const handleGlobeReady = useCallback(() => {
    globeRef.current.pointOfView(GLOBE_CAMERA.INITIAL_VIEW, 0);
    setIsReady(true);
  }, []);

  const handleZoom = useCallback(({ altitude }) => {
    // Written straight to the DOM so zooming doesn't re-render React on every frame.
    if (wrapperRef.current) wrapperRef.current.dataset.labels = altitude < GLOBE_CAMERA.LABELS_ALTITUDE ? 'on' : 'off';
    // Re-renders only when the snapped scale actually changes.
    setArcStrokeScale(getArcStrokeScale(altitude));
  }, []);

  const getArcStroke = useCallback((arc) => arc.stroke * arcStrokeScale, [arcStrokeScale]);

  const handleMapStyleChange = useCallback(
    (styleId) => {
      setMapStyleId(styleId);
      globeRef.current?.globeTileEngineClearCache();
    },
    [setMapStyleId],
  );

  const getMarkerElement = useCallback((marker) => getMarkerHost(marker.id), [getMarkerHost]);
  const clearSelection = useCallback(() => onSelect(null), [onSelect]);

  function renderMarker(marker) {
    const isSelected = marker.id === selectedId;
    switch (marker.kind) {
      case MARKER_KIND.REGION: {
        const { target, result } = regionRowsById.get(marker.id);
        return <RegionMarker target={target} result={result} isSelected={isSelected} onSelect={onSelect} />;
      }
      case MARKER_KIND.ENDPOINT:
        return <EndpointMarker pin={endpointPinsById.get(marker.id)} isSelected={isSelected} onSelect={onSelect} />;
      default:
        return <UserMarker isSelected={isSelected} onSelect={onSelect} />;
    }
  }

  return (
    // `isolate` keeps the z-indexes the globe gives each marker from stacking above the panels.
    <div ref={setWrapperElement} className="group/globe absolute inset-0 isolate">
      {width > 0 && height > 0 && (
        <Globe
          ref={globeRef}
          width={width}
          height={height}
          animateIn={!shouldReduceMotion}
          onGlobeReady={handleGlobeReady}
          onGlobeClick={clearSelection}
          onZoom={handleZoom}
          // Scene
          backgroundColor={GLOBE_COLORS.space}
          backgroundImageUrl={starfieldUrl}
          globeMaterial={baseMaterial}
          globeTileEngineUrl={mapStyle.tileUrl}
          globeTileEngineMaxLevel={mapStyle.maxLevel}
          showAtmosphere
          atmosphereColor={mapStyle.atmosphereColor}
          atmosphereAltitude={GLOBE_SURFACE.ATMOSPHERE_ALTITUDE}
          // Markers (HTML, so they stay the same size at every zoom level)
          htmlElementsData={markers}
          htmlElement={getMarkerElement}
          htmlElementVisibilityModifier={setMarkerVisibility}
          htmlTransitionDuration={0}
          // Latency arcs
          arcsData={arcs}
          arcColor="colors"
          arcStroke={getArcStroke}
          arcDashLength="dashLength"
          arcDashGap="dashGap"
          arcDashInitialGap="dashInitialGap"
          arcDashAnimateTime="dashAnimateMs"
          arcsTransitionDuration={shouldReduceMotion ? 0 : GLOBE_ARCS.RISE_MS}
        />
      )}

      {markers.map((marker) => createPortal(renderMarker(marker), getMarkerHost(marker.id), marker.id))}

      {/* Mobile: style switcher top-right, zoom bottom-right. Desktop: stacked in the bottom-right corner. */}
      <div className="pointer-events-none absolute inset-3 flex flex-col items-end justify-between lg:inset-auto lg:bottom-6 lg:right-6 lg:justify-end lg:gap-2 [&>*]:pointer-events-auto">
        <MapStyleSwitcher activeStyleId={mapStyle.id} onChange={handleMapStyleChange} />
        <div className="flex flex-col items-end gap-2">
          <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onHome={goHome} />
          <p className="max-w-56 text-right text-[10px] leading-snug text-white/50 [text-shadow:0_1px_2px_black] lg:max-w-64">
            {mapStyle.attribution}
          </p>
        </div>
      </div>
    </div>
  );
}
