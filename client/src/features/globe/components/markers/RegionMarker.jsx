import { PROVIDERS } from '@/constants/providers';
import { TEST_STATUS } from '@/constants/testStatus';
import { formatMs } from '@/utils/format';
import { getLatencyColor } from '@/utils/latencyBand';
import { ArrivalPulse, MarkerButton, MarkerLabel, MarkerShell, MeasuringPulse, SelectionRing } from './MarkerParts';

export function RegionMarker({ target, result, isSelected, onSelect }) {
  const provider = PROVIDERS[target.provider];
  const isMeasured = result.status === TEST_STATUS.DONE;
  const latencyColor = isMeasured ? getLatencyColor(result.medianMs) : null;

  return (
    <MarkerShell>
      <MarkerButton onClick={() => onSelect(target.id)} label={`${provider.label} ${target.city} (${target.code})`}>
        {result.status === TEST_STATUS.RUNNING && <MeasuringPulse color={provider.color} />}
        {isMeasured && <ArrivalPulse color={latencyColor} />}
        {isSelected && <SelectionRing />}
        <span
          className="relative size-2.5 rounded-full ring-2 ring-black/50"
          style={{ backgroundColor: provider.color, boxShadow: `0 0 10px ${provider.color}` }}
        />
      </MarkerButton>

      <MarkerLabel isPinned={isSelected}>
        {isSelected && <span style={{ color: provider.color }}>{provider.label}</span>}
        <span>{target.city}</span>
        {isSelected && <span className="font-mono text-slate-400">{target.code}</span>}
        {isMeasured && (
          <span className="font-mono" style={{ color: latencyColor }}>
            {formatMs(result.medianMs)}
          </span>
        )}
      </MarkerLabel>
    </MarkerShell>
  );
}
