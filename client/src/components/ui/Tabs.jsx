import { motion } from 'motion/react';
import { MOTION } from '@/constants/motion';

/**
 * Segmented tab switcher with a sliding highlight.
 * @param {{ tabs: { id: string, label: string, count?: number }[], activeId: string, onChange: (id: string) => void, layoutId: string }} props
 */
export function Tabs({ tabs, activeId, onChange, layoutId }) {
  return (
    <div role="tablist" className="flex gap-1 rounded-lg bg-white/[0.04] p-1">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                transition={MOTION.POP_IN}
                className="absolute inset-0 rounded-md bg-white/10 ring-1 ring-white/10"
              />
            )}
            <span className="relative">
              {tab.label}
              {tab.count !== undefined && <span className="ml-1.5 font-mono text-slate-500">{tab.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
