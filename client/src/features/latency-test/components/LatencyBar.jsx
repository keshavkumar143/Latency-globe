import { TEST_STATUS } from '@/constants/testStatus';
import { LATENCY_BAR_MIN_WIDTH_PERCENT } from '@/constants/ui';
import { getLatencyColor } from '@/utils/latencyBand';

const TRACK_CLASSES = 'h-1.5 w-full rounded-full bg-space-800';

/**
 * Horizontal bar whose width is this result's latency relative to the slowest
 * measured result.
 */
export function LatencyBar({ result, slowestMedianMs }) {
  if (result.status === TEST_STATUS.RUNNING) {
    return <div className="h-1.5 w-1/3 animate-pulse rounded-full bg-slate-500/40" />;
  }

  if (result.status !== TEST_STATUS.DONE) {
    return <div className={TRACK_CLASSES} />;
  }

  const widthPercent = Math.max(LATENCY_BAR_MIN_WIDTH_PERCENT, (result.medianMs / slowestMedianMs) * 100);

  return (
    <div className={TRACK_CLASSES}>
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${widthPercent}%`, backgroundColor: getLatencyColor(result.medianMs) }}
      />
    </div>
  );
}
