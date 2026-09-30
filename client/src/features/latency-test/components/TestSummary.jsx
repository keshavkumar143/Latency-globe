import { PROVIDERS } from '@/constants/providers';
import { formatMs, pluralize } from '@/utils/format';
import { countFinished, findFastestRow } from '../utils/results';

function Count({ children }) {
  return <span className="font-mono text-slate-200">{children}</span>;
}

export function TestSummary({ targets, results, isRunning, hasRun }) {
  const fastestRow = findFastestRow(targets, results);

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm text-slate-400" aria-live="polite">
      {hasRun ? (
        <p>
          Measured <Count>{countFinished(results)}</Count> of <Count>{targets.length}</Count> regions
          {isRunning && '…'}
        </p>
      ) : (
        <p>Press Run test to measure {pluralize(targets.length, 'region')}.</p>
      )}

      {fastestRow && (
        <p>
          Fastest: {PROVIDERS[fastestRow.target.provider].label} {fastestRow.target.city}{' '}
          <span className="font-mono font-semibold text-white">{formatMs(fastestRow.result.medianMs)}</span>
        </p>
      )}
    </div>
  );
}
