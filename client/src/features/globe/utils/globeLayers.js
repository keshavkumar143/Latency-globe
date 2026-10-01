import { ARC_KIND, GLOBE_ARCS, GLOBE_COLORS } from '@/constants/globe';
import { withAlpha } from '@/utils/color';
import { getLatencyColor } from '@/utils/latencyBand';
import { clamp, hashToUnitInterval } from '@/utils/math';

// Builders that turn app data into the arrays react-globe.gl renders. three-globe tracks
// layer objects by identity and animates any new object in from scratch, so both builders
// cache their output and hand back the same objects while nothing relevant has changed.

/**
 * Returns a function that maps `{ id, kind, lat, lng }` entries to marker objects, reusing
 * the previous object for an id whose kind and position are unchanged.
 */
export function createMarkerBuilder() {
  let cache = new Map();

  return function buildMarkers(entries) {
    const nextCache = new Map();
    const markers = entries.map((entry) => {
      const cached = cache.get(entry.id);
      const isUnchanged = cached?.kind === entry.kind && cached.lat === entry.lat && cached.lng === entry.lng;
      const marker = isUnchanged ? cached : { ...entry };
      nextCache.set(entry.id, marker);
      return marker;
    });
    cache = nextCache;
    return markers;
  };
}

/**
 * Multiplier for arc thickness at a camera altitude. Snapped to powers of two so zooming
 * rebuilds the arcs only a handful of times instead of every frame.
 */
export function getArcStrokeScale(altitude) {
  const scale = altitude / GLOBE_ARCS.FULL_STROKE_ALTITUDE;
  if (scale >= 1) return 1;
  return Math.max(GLOBE_ARCS.MIN_STROKE_SCALE, 2 ** Math.round(Math.log2(scale)));
}

/** How long a packet takes to cross its arc: slower routes, slower packets. */
function getPacketTripMs(medianMs) {
  return clamp(
    medianMs * GLOBE_ARCS.PACKET_MS_PER_LATENCY_MS,
    GLOBE_ARCS.PACKET_MIN_TRIP_MS,
    GLOBE_ARCS.PACKET_MAX_TRIP_MS,
  );
}

/** A faint trail from the user to the target, plus a packet travelling along it. */
function buildArcPair(origin, { id, lat, lng, result }) {
  const latencyColor = getLatencyColor(result.medianMs);
  const endpoints = { startLat: origin.lat, startLng: origin.lng, endLat: lat, endLng: lng };

  const trail = {
    ...endpoints,
    kind: ARC_KIND.TRAIL,
    colors: [
      withAlpha(GLOBE_COLORS.user, GLOBE_ARCS.TRAIL_START_OPACITY),
      withAlpha(latencyColor, GLOBE_ARCS.TRAIL_END_OPACITY),
    ],
    stroke: GLOBE_ARCS.TRAIL_STROKE,
    dashLength: 1,
    dashGap: 0,
    dashInitialGap: 0,
    dashAnimateMs: 0,
  };

  const packet = {
    ...endpoints,
    kind: ARC_KIND.PACKET,
    colors: [latencyColor, latencyColor],
    stroke: GLOBE_ARCS.PACKET_STROKE,
    dashLength: GLOBE_ARCS.PACKET_LENGTH,
    dashGap: 1 - GLOBE_ARCS.PACKET_LENGTH,
    // Stagger packets so they don't all move in lockstep.
    dashInitialGap: hashToUnitInterval(id),
    dashAnimateMs: getPacketTripMs(result.medianMs),
  };

  return [trail, packet];
}

/**
 * Returns a function that builds latency arcs from the user to every measured item
 * (`{ id, lat, lng, result }`), reusing arcs whose result, position and origin haven't
 * changed so only newly arrived results animate.
 */
export function createLatencyArcBuilder() {
  let cache = new Map();

  return function buildLatencyArcs(measuredItems, origin) {
    if (!origin) {
      cache = new Map();
      return [];
    }

    const originKey = `${origin.lat},${origin.lng}`;
    const nextCache = new Map();
    const arcs = [];

    for (const item of measuredItems) {
      const cached = cache.get(item.id);
      const canReuse =
        cached?.result === item.result &&
        cached.originKey === originKey &&
        cached.lat === item.lat &&
        cached.lng === item.lng;
      const entry = canReuse
        ? cached
        : { result: item.result, originKey, lat: item.lat, lng: item.lng, arcs: buildArcPair(origin, item) };

      nextCache.set(item.id, entry);
      arcs.push(...entry.arcs);
    }

    cache = nextCache;
    return arcs;
  };
}
