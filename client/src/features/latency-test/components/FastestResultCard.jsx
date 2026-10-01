import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { ProviderBadge } from '@/components/ui/ProviderBadge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { getLatencyColor } from '@/utils/latencyBand';
import { findFastestRow } from '../utils/results';

export function FastestResultCard({ title, rows, onSelect }) {
  const fastestRow = findFastestRow(rows);

  if (!fastestRow) {
    return (
      <section>
        <SectionLabel>{title}</SectionLabel>
        <p className="mt-2 font-mono text-5xl font-bold text-slate-700">—</p>
        <p className="mt-2 text-sm text-slate-400">Run the test to find the fastest region from where you are.</p>
      </section>
    );
  }

  const { target, result } = fastestRow;
  const color = getLatencyColor(result.medianMs);

  return (
    <section>
      <SectionLabel>{title}</SectionLabel>
      <div className="mt-1 flex items-baseline gap-1.5" style={{ color, textShadow: `0 0 28px ${color}66` }}>
        <AnimatedNumber value={result.medianMs} className="font-mono text-5xl font-bold tabular-nums" />
        <span className="font-mono text-lg text-slate-400">ms</span>
      </div>
      <button
        type="button"
        onClick={() => onSelect(target.id)}
        className="mt-2 flex max-w-full items-center gap-2 rounded text-left text-sm text-slate-200 hover:text-white"
      >
        <ProviderBadge providerId={target.provider} />
        <span className="truncate">{target.city}</span>
        <span className="font-mono text-xs text-slate-500">{target.code}</span>
      </button>
    </section>
  );
}
