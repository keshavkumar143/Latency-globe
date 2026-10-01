import { motion, useReducedMotion } from 'motion/react';
import { useId } from 'react';
import { LOGO, LOGO_COLORS, LOGO_MOTION } from '@/constants/brand';

const { GLOBE, ORIGIN, DESTINATION, ARC_CONTROL } = LOGO;
const ARC_PATH = `M${ORIGIN.x} ${ORIGIN.y}Q${ARC_CONTROL.x} ${ARC_CONTROL.y} ${DESTINATION.x} ${DESTINATION.y}`;

/** Ripple that expands from the pinged region and fades out, on a loop. */
function PingRipple({ delaySeconds }) {
  return (
    <motion.circle
      cx={DESTINATION.x}
      cy={DESTINATION.y}
      r={LOGO.PING_RING_RADII.at(-1)}
      stroke={LOGO_COLORS.ping}
      strokeWidth="1.5"
      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      initial={{ scale: 0.3, opacity: 0.9 }}
      animate={{ scale: 1, opacity: 0 }}
      transition={{ duration: LOGO_MOTION.RIPPLE_SECONDS, delay: delaySeconds, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

/**
 * The PingAtlas mark: a globe with an arc hopping from "you" to a pinged region. A packet
 * travels the arc and the destination pings; with reduced motion it's the static logo.
 */
export function LogoMark({ className = 'size-9' }) {
  const id = useId();
  const shouldReduceMotion = useReducedMotion();
  const gradientId = (name) => `${id}-${name}`;

  return (
    <svg viewBox={`0 0 ${LOGO.VIEWBOX_SIZE} ${LOGO.VIEWBOX_SIZE}`} fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId('rim')} x1="12" y1="14" x2="50" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={LOGO_COLORS.rimFrom} />
          <stop offset="1" stopColor={LOGO_COLORS.rimTo} />
        </linearGradient>
        <radialGradient id={gradientId('ocean')} cx="23" cy="27" r="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={LOGO_COLORS.oceanCenter} />
          <stop offset="1" stopColor={LOGO_COLORS.oceanEdge} />
        </radialGradient>
        <linearGradient
          id={gradientId('arc')}
          x1={ORIGIN.x}
          y1={ORIGIN.y}
          x2={DESTINATION.x}
          y2={DESTINATION.y}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={LOGO_COLORS.arcFrom} />
          <stop offset=".5" stopColor={LOGO_COLORS.arcMid} />
          <stop offset="1" stopColor={LOGO_COLORS.arcTo} />
        </linearGradient>
      </defs>

      {/* Globe */}
      <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} fill={`url(#${gradientId('ocean')})`} />
      <ellipse
        cx={GLOBE.cx}
        cy={GLOBE.cy}
        rx={GLOBE.meridianRx}
        ry={GLOBE.r}
        stroke={LOGO_COLORS.gridLines}
        strokeOpacity=".45"
        strokeWidth="2"
      />
      <path
        d={`M${GLOBE.cx - GLOBE.r} ${GLOBE.cy}h${GLOBE.r * 2}`}
        stroke={LOGO_COLORS.gridLines}
        strokeOpacity=".45"
        strokeWidth="2"
      />
      <circle cx={GLOBE.cx} cy={GLOBE.cy} r={GLOBE.r} stroke={`url(#${gradientId('rim')})`} strokeWidth="3.5" />

      {/* Ping at the destination */}
      {shouldReduceMotion ? (
        LOGO.PING_RING_RADII.map((radius, index) => (
          <circle
            key={radius}
            cx={DESTINATION.x}
            cy={DESTINATION.y}
            r={radius}
            stroke={LOGO_COLORS.ping}
            strokeOpacity={index === 0 ? 0.6 : 0.3}
            strokeWidth="1.5"
          />
        ))
      ) : (
        <>
          <PingRipple delaySeconds={0} />
          <PingRipple delaySeconds={LOGO_MOTION.RIPPLE_SECONDS / 2} />
        </>
      )}

      {/* Arc from you to the destination; the dark under-stroke separates it from the rim */}
      <path d={ARC_PATH} stroke={LOGO_COLORS.oceanEdge} strokeWidth="6.5" strokeLinecap="round" />
      <path d={ARC_PATH} stroke={`url(#${gradientId('arc')})`} strokeWidth="3.5" strokeLinecap="round" />
      {!shouldReduceMotion && (
        <circle r="2" fill={LOGO_COLORS.packet}>
          <animateMotion dur={`${LOGO_MOTION.PACKET_TRIP_SECONDS}s`} repeatCount="indefinite" path={ARC_PATH} />
        </circle>
      )}

      <circle
        cx={ORIGIN.x}
        cy={ORIGIN.y}
        r="3.6"
        fill={LOGO_COLORS.origin}
        stroke={LOGO_COLORS.oceanEdge}
        strokeWidth="1.5"
      />
      <circle
        cx={DESTINATION.x}
        cy={DESTINATION.y}
        r="4.2"
        fill={LOGO_COLORS.ping}
        stroke={LOGO_COLORS.pingHighlight}
        strokeWidth="1.5"
      />
    </svg>
  );
}
