import { ProviderBadge } from '@/components/ui/ProviderBadge';
import { LatencyBar } from './LatencyBar';
import { LatencyValue } from './LatencyValue';

const CELL_CLASSES = 'px-3 py-2.5 sm:px-4';

export function ResultRow({ target, result, slowestMedianMs }) {
  return (
    <tr className="hover:bg-space-800/50">
      <td className={CELL_CLASSES}>
        <ProviderBadge providerId={target.provider} />
      </td>
      <td className={CELL_CLASSES}>
        <div className="text-slate-100">{target.city}</div>
        <div className="whitespace-nowrap font-mono text-xs text-slate-500 sm:hidden">{target.code}</div>
      </td>
      <td className={`${CELL_CLASSES} hidden whitespace-nowrap font-mono text-xs text-slate-400 sm:table-cell`}>
        {target.code}
      </td>
      <td className={CELL_CLASSES}>
        <LatencyBar result={result} slowestMedianMs={slowestMedianMs} />
      </td>
      <td className={`${CELL_CLASSES} whitespace-nowrap text-right`}>
        <LatencyValue result={result} />
      </td>
    </tr>
  );
}
