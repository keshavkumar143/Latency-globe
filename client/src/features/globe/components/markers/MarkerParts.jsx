import { motion } from 'motion/react';
import { MOTION } from '@/constants/motion';

/** Wrapper that lets a marker's label react to hovering its dot. Sits exactly on the point. */
export function MarkerShell({ children }) {
  return <div className="group/marker relative">{children}</div>;
}

/** Clickable hit area centered on the point. */
export function MarkerButton({ onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute left-0 top-0 grid size-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-sky-400"
    >
      {children}
    </button>
  );
}

/**
 * Text beside a marker. Region labels appear on hover, on selection, or once the globe is
 * zoomed in (the globe wrapper sets data-labels="on").
 */
export function MarkerLabel({ isPinned, children }) {
  const visibility = isPinned
    ? 'opacity-100'
    : 'opacity-0 group-hover/marker:opacity-100 group-data-[labels=on]/globe:opacity-100';

  return (
    <span
      className={`pointer-events-none absolute left-3.5 top-0 flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-md border border-white/10 bg-space-950/85 px-1.5 py-0.5 text-[11px] leading-tight text-slate-100 shadow-lg shadow-black/40 backdrop-blur-sm transition-opacity duration-200 ${visibility}`}
    >
      {children}
    </span>
  );
}

/** Ripple that plays once when a marker's result arrives. */
export function ArrivalPulse({ color }) {
  return (
    <motion.span
      className="absolute inset-0 rounded-full border-2"
      style={{ borderColor: color }}
      initial={{ scale: 0.4, opacity: 1 }}
      animate={{ scale: MOTION.MARKER_ARRIVAL_SCALE, opacity: 0 }}
      transition={MOTION.MARKER_ARRIVAL}
    />
  );
}

/** Continuous pulse while a marker is being measured. */
export function MeasuringPulse({ color }) {
  return <span className="absolute inset-1 animate-ping rounded-full opacity-60" style={{ backgroundColor: color }} />;
}

/** Ring drawn around the selected marker. */
export function SelectionRing() {
  return (
    <span className="absolute -inset-0.5 animate-[spin_6s_linear_infinite] rounded-full border border-dashed border-white/80" />
  );
}
