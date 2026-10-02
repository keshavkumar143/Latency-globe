import { motion } from 'motion/react';
import { LatencyBar } from '@/components/latency/LatencyBar';
import { LatencyValue } from '@/components/latency/LatencyValue';
import { MeasurementToggle } from '@/components/latency/MeasurementToggle';
import { ProviderBadge } from '@/components/ui/ProviderBadge';
import { MOTION } from '@/constants/motion';
import { IN_PROGRESS_STATUSES, TEST_STATUS } from '@/constants/testStatus';

export function ResultListItem({ target, result, maxMs, isSelected, onSelect, onStop, onTest }) {
  return (
    <motion.li layout="position" transition={MOTION.LIST_REORDER} className="group relative">
      <button
        type="button"
        onClick={() => onSelect(target.id)}
        aria-pressed={isSelected}
        className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-2.5 gap-y-2 rounded-lg py-2 pl-3 pr-11 text-left transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-sky-400 ${
          isSelected ? 'bg-white/10 ring-1 ring-white/15' : ''
        }`}
      >
        <ProviderBadge providerId={target.provider} />
        <span className="min-w-0 truncate text-sm text-slate-100">
          {target.city}
          <span className="ml-2 font-mono text-[11px] text-slate-500">{target.code}</span>
        </span>
        <LatencyValue result={result} />
        <span className="col-span-3">
          <LatencyBar result={result} maxMs={maxMs} />
        </span>
      </button>
      <MeasurementToggle
        isMeasuring={IN_PROGRESS_STATUSES.includes(result.status)}
        hasResult={result.status !== TEST_STATUS.IDLE}
        name={target.city}
        onStop={() => onStop(target.id)}
        onTest={() => onTest(target)}
        className="absolute right-2 top-1.5"
      />
    </motion.li>
  );
}
