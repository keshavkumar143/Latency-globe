import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { TEST_STATUS } from '@/constants/testStatus';
import { formatMs } from '@/utils/format';
import { getLatencyColor } from '@/utils/latencyBand';

function StatusLine({ result }) {
  switch (result?.status) {
    case TEST_STATUS.RUNNING:
    case TEST_STATUS.QUEUED:
      return <p className="animate-pulse text-sm text-sky-300">Measuring…</p>;
    case TEST_STATUS.ERROR:
      return <p className="text-sm text-rose-400">{result.error}</p>;
    case TEST_STATUS.STOPPED:
      return <p className="text-sm text-slate-400">Stopped before finishing</p>;
    default:
      return <p className="text-sm text-slate-500">Not measured yet</p>;
  }
}

/** Big median latency with the cold connection time and raw samples underneath. */
/** @param {{ result: object, caption?: string }} props */
export function LatencyStat({ result, caption = 'ms median' }) {
  if (result?.status !== TEST_STATUS.DONE) return <StatusLine result={result} />;

  const color = getLatencyColor(result.medianMs);
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1" style={{ color, textShadow: `0 0 24px ${color}55` }}>
          <AnimatedNumber value={result.medianMs} className="font-mono text-4xl font-bold tabular-nums" />
          <span className="font-mono text-sm text-slate-400">{caption}</span>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm text-slate-200">{formatMs(result.coldMs)}</p>
          <p className="text-[11px] text-slate-500">cold (DNS + TLS)</p>
        </div>
      </div>
      <p className="mt-2 font-mono text-[11px] text-slate-500">
        samples {result.samplesMs.map((sampleMs) => Math.round(sampleMs)).join(' · ')} ms
      </p>
    </div>
  );
}
