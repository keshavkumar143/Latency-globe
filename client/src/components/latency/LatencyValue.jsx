import { TEST_STATUS } from '@/constants/testStatus';
import { getLatencyColor } from '@/utils/latencyBand';

/** A result's median in ms, or its status while not measured. */
export function LatencyValue({ result, className = '' }) {
  switch (result?.status) {
    case TEST_STATUS.DONE:
      return (
        <span className={`font-mono text-sm tabular-nums ${className}`}>
          <span style={{ color: getLatencyColor(result.medianMs) }}>{Math.round(result.medianMs)}</span>
          <span className="ml-0.5 text-[11px] text-slate-500">ms</span>
        </span>
      );
    case TEST_STATUS.RUNNING:
    case TEST_STATUS.QUEUED:
      return <span className="font-mono text-xs text-sky-300/80">testing</span>;
    case TEST_STATUS.ERROR:
      return <span className="text-xs text-rose-400">{result.error}</span>;
    case TEST_STATUS.STOPPED:
      return <span className="text-xs text-slate-500">stopped</span>;
    default:
      return <span className="font-mono text-xs text-slate-600">—</span>;
  }
}
