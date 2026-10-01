import { LatencyValue } from '@/components/latency/LatencyValue';
import { ProviderBadge } from '@/components/ui/ProviderBadge';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { findFastestRowPerProvider } from '../utils/results';

/** The fastest measured region of each provider. */
export function BestByProvider({ rows, onSelect }) {
  const bestRows = findFastestRowPerProvider(rows);
  if (bestRows.length === 0) return null;

  return (
    <section>
      <SectionLabel>Best per provider</SectionLabel>
      <ul className="mt-2 space-y-0.5">
        {bestRows.map(({ target, result }) => (
          <li key={target.provider}>
            <button
              type="button"
              onClick={() => onSelect(target.id)}
              className="-mx-1.5 flex w-[calc(100%+0.75rem)] items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-white/5"
            >
              <ProviderBadge providerId={target.provider} />
              <span className="min-w-0 truncate text-sm text-slate-200">{target.city}</span>
              <LatencyValue result={result} className="ml-auto" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
