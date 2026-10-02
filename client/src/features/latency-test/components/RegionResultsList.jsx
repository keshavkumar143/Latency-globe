import { useState } from 'react';
import { SearchField } from '@/components/ui/SearchField';
import { filterRowsByQuery, findSlowestMedianMs } from '../utils/results';
import { ResultListItem } from './ResultListItem';

/** Every region's result, fastest first, with a text filter. Rows glide into place as results arrive. */
export function RegionResultsList({ rows, selectedId, onSelect, onStop, onTest }) {
  const [query, setQuery] = useState('');
  const matchingRows = filterRowsByQuery(rows, query);
  const slowestMedianMs = findSlowestMedianMs(rows);

  return (
    <>
      <div className="px-3 pb-2">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Filter by city, code or provider"
          label="Filter regions"
        />
      </div>
      <ol className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-1.5 pb-2">
        {matchingRows.map(({ target, result }) => (
          <ResultListItem
            key={target.id}
            target={target}
            result={result}
            maxMs={slowestMedianMs}
            isSelected={target.id === selectedId}
            onSelect={onSelect}
            onStop={onStop}
            onTest={onTest}
          />
        ))}
        {matchingRows.length === 0 && (
          <li className="px-3 py-8 text-center text-xs text-slate-500">No regions match “{query}”</li>
        )}
      </ol>
    </>
  );
}
