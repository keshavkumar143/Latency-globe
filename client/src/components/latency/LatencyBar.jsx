import { motion } from 'motion/react';
import { MOTION } from '@/constants/motion';
import { TEST_STATUS } from '@/constants/testStatus';
import { LATENCY_BAR_MIN_WIDTH_PERCENT } from '@/constants/ui';
import { getLatencyColor } from '@/utils/latencyBand';

const TRACK_CLASSES = 'h-1 w-full overflow-hidden rounded-full bg-white/5';

/** Bar whose width is this result's latency relative to `maxMs`. */
export function LatencyBar({ result, maxMs }) {
  if (result?.status === TEST_STATUS.RUNNING) {
    return (
      <div className={TRACK_CLASSES}>
        <div className="h-full w-1/3 animate-shimmer rounded-full bg-sky-400/50" />
      </div>
    );
  }

  if (result?.status !== TEST_STATUS.DONE || !maxMs) {
    return <div className={TRACK_CLASSES} />;
  }

  const widthPercent = Math.max(LATENCY_BAR_MIN_WIDTH_PERCENT, Math.min(100, (result.medianMs / maxMs) * 100));
  const color = getLatencyColor(result.medianMs);

  return (
    <div className={TRACK_CLASSES}>
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${widthPercent}%` }}
        transition={MOTION.BAR_GROW}
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
      />
    </div>
  );
}
