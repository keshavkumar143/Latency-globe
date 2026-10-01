import { motion } from 'motion/react';
import { MOTION } from '@/constants/motion';
import { ALL_PROVIDERS, PROVIDERS } from '@/constants/providers';

const FILTER_OPTIONS = [{ id: ALL_PROVIDERS, label: 'All providers' }, ...Object.values(PROVIDERS)];

/** Chips that limit the list, the globe and the next test run to one provider. */
export function ProviderFilter({ value, onChange, counts }) {
  return (
    <div
      role="radiogroup"
      aria-label="Filter by provider"
      className="flex gap-1 overflow-x-auto [scrollbar-width:none]"
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.id)}
            className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="provider-filter-highlight"
                transition={MOTION.POP_IN}
                className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/15"
              />
            )}
            {option.color && (
              <span
                className="relative size-2 rounded-full"
                style={{ backgroundColor: option.color, boxShadow: `0 0 6px ${option.color}` }}
              />
            )}
            <span className="relative">{option.label}</span>
            <span className="relative font-mono text-[10px] text-slate-500">{counts[option.id] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}
