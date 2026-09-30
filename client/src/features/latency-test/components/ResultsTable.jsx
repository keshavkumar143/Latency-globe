import { buildSortedRows, findSlowestMedianMs } from '../utils/results';
import { ResultRow } from './ResultRow';

const HEADER_CELL_CLASSES = 'px-3 py-3 font-medium sm:px-4';

export function ResultsTable({ targets, results }) {
  const rows = buildSortedRows(targets, results);
  const slowestMedianMs = findSlowestMedianMs(rows);

  return (
    <div className="overflow-hidden rounded-xl border border-space-700 bg-space-900">
      <table className="w-full text-sm">
        <thead className="border-b border-space-700 text-left text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className={HEADER_CELL_CLASSES}>Provider</th>
            <th className={HEADER_CELL_CLASSES}>City</th>
            <th className={`${HEADER_CELL_CLASSES} hidden sm:table-cell`}>Region</th>
            <th className={`${HEADER_CELL_CLASSES} w-1/3`}>
              <span className="sr-only">Latency bar</span>
            </th>
            <th className={`${HEADER_CELL_CLASSES} text-right`}>Latency</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-space-800">
          {rows.map(({ target, result }) => (
            <ResultRow key={target.id} target={target} result={result} slowestMedianMs={slowestMedianMs} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
