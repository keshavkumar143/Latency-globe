// Look and behavior of the 3D globe. Colors here go to three.js, so use hex or rgba(),
// never CSS-only syntax such as color-mix().

export const GLOBE_COLORS = Object.freeze({
  /** Shown under the map tiles while they load. */
  baseSurface: '#0b1733',
  space: '#02040a',
  user: '#ffffff',
  endpoint: '#e879f9',
});

export const GLOBE_SURFACE = Object.freeze({
  ATMOSPHERE_ALTITUDE: 0.18,
});

/** Camera distances are "altitude": height above the surface in globe radii (1 ≈ 6,371 km). */
export const GLOBE_CAMERA = Object.freeze({
  INITIAL_VIEW: Object.freeze({ lat: 20, lng: 20, altitude: 3 }),
  HOME_ALTITUDE: 2,
  /** Selecting a marker zooms in to at least this close. */
  FOCUS_ALTITUDE: 0.7,
  MAX_ALTITUDE: 4.5,
  /** Each zoom-button press multiplies or divides the altitude by this. */
  ZOOM_STEP_FACTOR: 2,
  /** The closest the zoom buttons go (≈ 1 km above the ground). Scroll/pinch can go closer still. */
  MIN_BUTTON_ALTITUDE: 0.00015,
  FLY_TO_USER_MS: 2000,
  FLY_TO_SELECTION_MS: 1200,
  ZOOM_STEP_MS: 600,
  AUTO_ROTATE_SPEED: 0.3,
  /** Below this altitude every region shows its name; above it, only on hover or selection. */
  LABELS_ALTITUDE: 0.45,
});

export const MARKER_KIND = Object.freeze({
  REGION: 'region',
  ENDPOINT: 'endpoint',
  USER: 'user',
});

export const USER_MARKER_ID = 'user';

export const ARC_KIND = Object.freeze({
  /** Faint solid line from the user to the target. */
  TRAIL: 'trail',
  /** Short bright dash that travels along the trail like a packet. */
  PACKET: 'packet',
});

export const GLOBE_ARCS = Object.freeze({
  /** New arcs rise from the ground over this long. */
  RISE_MS: 900,
  TRAIL_STROKE: 0.25,
  TRAIL_START_OPACITY: 0.15,
  TRAIL_END_OPACITY: 0.75,
  PACKET_STROKE: 0.55,
  /** Packet length as a fraction of the arc. The rest is gap, so one packet is in flight at a time. */
  PACKET_LENGTH: 0.08,
  /** Packets on slower routes travel slower: trip time = latency × this, clamped below. */
  PACKET_MS_PER_LATENCY_MS: 16,
  PACKET_MIN_TRIP_MS: 900,
  PACKET_MAX_TRIP_MS: 6000,
  /** Arc thickness is in world units, so it's scaled down below this altitude to stay thin up close. */
  FULL_STROKE_ALTITUDE: 1.5,
  MIN_STROKE_SCALE: 0.01,
});

/** Procedural star texture painted on the sky sphere behind the globe. */
export const STARFIELD = Object.freeze({
  WIDTH: 4096,
  HEIGHT: 2048,
  STAR_COUNT: 3500,
  MIN_RADIUS: 0.4,
  MAX_EXTRA_RADIUS: 1.6,
  MIN_OPACITY: 0.2,
  BACKGROUND: GLOBE_COLORS.space,
  /** RGB tints, picked at random per star. */
  TINTS: Object.freeze(['255, 255, 255', '200, 220, 255', '255, 235, 210']),
});
