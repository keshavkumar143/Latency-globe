import { motion } from 'motion/react';
import { LatencyBar } from '@/components/latency/LatencyBar';
import { LatencyValue } from '@/components/latency/LatencyValue';
import { MeasurementToggle } from '@/components/latency/MeasurementToggle';
import { Button } from '@/components/ui/Button';
import { CloseIcon } from '@/components/ui/icons';
import { ProviderBadge } from '@/components/ui/ProviderBadge';
import { GLOBE_COLORS } from '@/constants/globe';
import { LOOKUP_STATUS } from '@/constants/customEndpoints';
import { MOTION } from '@/constants/motion';
import { TEST_STATUS } from '@/constants/testStatus';

function describePlace(lookup) {
  if (lookup?.status === LOOKUP_STATUS.DONE)
    return [lookup.data.city, lookup.data.countryCode].filter(Boolean).join(', ');
  if (lookup?.status === LOOKUP_STATUS.LOADING) return 'Locating…';
  return lookup?.error ?? '';
}

function EndpointRow({ endpoint, maxMs, isSelected, isTesting, onSelect, onStop, onRetest, onRemove }) {
  return (
    <motion.li layout="position" transition={MOTION.LIST_REORDER} className="group relative">
      <button
        type="button"
        onClick={() => onSelect(endpoint.id)}
        aria-pressed={isSelected}
        className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-2.5 gap-y-2 rounded-lg py-2.5 pl-3 pr-[4.25rem] text-left transition-colors hover:bg-white/5 ${
          isSelected ? 'bg-white/10 ring-1 ring-white/15' : ''
        }`}
      >
        <span className="size-2.5 rotate-45 rounded-[2px]" style={{ backgroundColor: GLOBE_COLORS.endpoint }} />
        <span className="min-w-0">
          <span className="block truncate text-sm text-slate-100">{endpoint.hostname}</span>
          <span className="block truncate text-[11px] text-slate-500">{describePlace(endpoint.lookup)}</span>
        </span>
        <LatencyValue result={endpoint.result} />
        <span className="col-span-3">
          <LatencyBar result={endpoint.result} maxMs={maxMs} />
        </span>
      </button>
      <div className="absolute right-1.5 top-1.5 flex">
        <MeasurementToggle
          isMeasuring={isTesting}
          hasResult
          name={endpoint.hostname}
          onStop={() => onStop(endpoint.id)}
          onTest={() => onRetest(endpoint)}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(endpoint.id)}
          aria-label={`Remove ${endpoint.hostname}`}
          title="Remove"
          className="size-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
        >
          <CloseIcon className="size-3.5" />
        </Button>
      </div>
    </motion.li>
  );
}

/** The fastest cloud region, shown above the endpoints as the bar to beat. */
function ReferenceRow({ row, maxMs }) {
  return (
    <div className="mx-1.5 mb-1 rounded-lg border border-dashed border-white/10 px-3 py-2">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Best region</span>
        <ProviderBadge providerId={row.target.provider} />
        <span className="truncate text-slate-200">{row.target.city}</span>
        <LatencyValue result={row.result} className="ml-auto" />
      </div>
      <div className="mt-2">
        <LatencyBar result={row.result} maxMs={maxMs} />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-10 text-center">
      <span
        className="mx-auto mb-3 block size-3 rotate-45 rounded-[3px]"
        style={{ backgroundColor: GLOBE_COLORS.endpoint }}
      />
      <p className="text-sm text-slate-200">No endpoints yet</p>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Enter a URL or domain in the search bar to measure it, see where it's hosted, and compare it with cloud regions.
      </p>
    </div>
  );
}

/** Saved custom endpoints, compared side by side against the fastest region. */
export function EndpointList({
  endpoints,
  testingIds,
  fastestRegionRow,
  selectedId,
  onSelect,
  onStop,
  onRetest,
  onRemove,
}) {
  if (endpoints.length === 0) return <EmptyState />;

  const measuredMs = endpoints
    .filter((endpoint) => endpoint.result.status === TEST_STATUS.DONE)
    .map((endpoint) => endpoint.result.medianMs);
  if (fastestRegionRow) measuredMs.push(fastestRegionRow.result.medianMs);
  const maxMs = measuredMs.length > 0 ? Math.max(...measuredMs) : null;

  return (
    <div className="min-h-0 flex-1 overflow-y-auto pb-2">
      {fastestRegionRow && <ReferenceRow row={fastestRegionRow} maxMs={maxMs} />}
      <ol className="space-y-0.5 px-1.5">
        {endpoints.map((endpoint) => (
          <EndpointRow
            key={endpoint.id}
            endpoint={endpoint}
            maxMs={maxMs}
            isSelected={endpoint.id === selectedId}
            isTesting={testingIds.includes(endpoint.id)}
            onSelect={onSelect}
            onStop={onStop}
            onRetest={onRetest}
            onRemove={onRemove}
          />
        ))}
      </ol>
    </div>
  );
}
