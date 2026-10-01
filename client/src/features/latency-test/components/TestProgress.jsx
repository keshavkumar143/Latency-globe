import { motion } from 'motion/react';
import { MOTION } from '@/constants/motion';
import { pluralize } from '@/utils/format';
import { countFinished, hasStoppedRows } from '../utils/results';

function describeProgress({ rows, isRunning, hasRun }) {
  if (isRunning) return 'Measuring…';
  if (!hasRun) return `Ready to test ${pluralize(rows.length, 'region')}`;
  if (hasStoppedRows(rows)) return 'Test stopped';
  return 'Test complete';
}

export function TestProgress({ rows, isRunning, hasRun }) {
  const finishedCount = countFinished(rows);
  const progressPercent = rows.length > 0 ? (finishedCount / rows.length) * 100 : 0;

  return (
    <section aria-live="polite">
      <div className="flex items-baseline justify-between text-xs">
        <span className={isRunning ? 'text-sky-300' : 'text-slate-400'}>
          {describeProgress({ rows, isRunning, hasRun })}
        </span>
        <span className="font-mono text-slate-500">
          {finishedCount}/{rows.length}
        </span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
          initial={false}
          animate={{ width: `${progressPercent}%` }}
          transition={MOTION.BAR_GROW}
        />
      </div>
    </section>
  );
}
