/**
 * Logo geometry and colors on a 64×64 grid. The static copies in client/public/favicon.svg and
 * brand/pingatlas-mark.svg use the same values; change them together.
 */
export const LOGO = Object.freeze({
  VIEWBOX_SIZE: 64,
  GLOBE: Object.freeze({ cx: 30, cy: 35, r: 21, meridianRx: 8.5 }),
  /** "You": where the arc starts, on the globe's lower-left face. */
  ORIGIN: Object.freeze({ x: 17, y: 44 }),
  /** The pinged region, just off the globe's upper-right rim. */
  DESTINATION: Object.freeze({ x: 51.5, y: 21.5 }),
  /** Quadratic control point that lifts the arc clear of the rim. */
  ARC_CONTROL: Object.freeze({ x: 24, y: -2 }),
  PING_RING_RADII: Object.freeze([6.5, 10]),
});

export const LOGO_COLORS = Object.freeze({
  rimFrom: '#7dd3fc',
  rimTo: '#2563eb',
  oceanCenter: '#1d4ed8',
  oceanEdge: '#040a1c',
  gridLines: '#60a5fa',
  arcFrom: '#e0f2fe',
  arcMid: '#22d3ee',
  arcTo: '#fbbf24',
  ping: '#fbbf24',
  pingHighlight: '#fff7d6',
  origin: '#f0f9ff',
  packet: '#ffffff',
});

export const LOGO_MOTION = Object.freeze({
  /** Seconds for a packet to travel the arc. */
  PACKET_TRIP_SECONDS: 2.4,
  /** Seconds for one ping ripple to expand and fade. */
  RIPPLE_SECONDS: 2.4,
});
