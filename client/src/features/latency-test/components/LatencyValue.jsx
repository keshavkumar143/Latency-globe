import { TEST_STATUS } from '@/constants/testStatus';
import { formatMs } from '@/utils/format';

/** Hover text with the cold connection time and raw samples behind a median. */
function buildMeasurementDetails({ medianMs, coldMs, samplesMs }) {
  const roundedSamples = samplesMs.map(Math.round).join(', ');
  return [
    `Median of ${samplesMs.length}: ${formatMs(medianMs)}`,
    `Cold (DNS + TLS): ${formatMs(coldMs)}`,
    `Samples: ${roundedSamples} ms`,
  ].join('\n');
}

export function LatencyValue({ result }) {
  switch (result.status) {
    case TEST_STATUS.DONE:
      return (
        <span title={buildMeasurementDetails(result)} className="font-mono tabular-nums text-slate-100">
          {Math.round(result.medianMs)}
          <span className="ml-1 text-slate-500">ms</span>
        </span>
      );
    case TEST_STATUS.RUNNING:
      return <span className="font-mono text-slate-400">…</span>;
    case TEST_STATUS.ERROR:
      return <span className="text-xs text-rose-400">{result.error}</span>;
    case TEST_STATUS.STOPPED:
      return <span className="text-xs text-slate-500">Stopped</span>;
    default:
      return <span className="font-mono text-slate-600">—</span>;
  }
}
