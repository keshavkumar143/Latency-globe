import { GLOBE_COLORS } from '@/constants/globe';
import { TEST_STATUS } from '@/constants/testStatus';
import { formatMs } from '@/utils/format';
import { getLatencyColor } from '@/utils/latencyBand';
import { ArrivalPulse, MarkerButton, MarkerLabel, MarkerShell, MeasuringPulse, SelectionRing } from './MarkerParts';

/** The user's own endpoint: a diamond with its domain always labelled. */
export function EndpointMarker({ pin, isSelected, onSelect }) {
  const { result } = pin;
  const isMeasured = result.status === TEST_STATUS.DONE;

  return (
    <MarkerShell>
      <MarkerButton onClick={() => onSelect(pin.id)} label={`Endpoint ${pin.hostname}`}>
        {result.status === TEST_STATUS.RUNNING && <MeasuringPulse color={GLOBE_COLORS.endpoint} />}
        {isMeasured && <ArrivalPulse color={getLatencyColor(result.medianMs)} />}
        {isSelected && <SelectionRing />}
        <span
          className="relative size-3 rotate-45 rounded-[3px] ring-2 ring-black/50"
          style={{ backgroundColor: GLOBE_COLORS.endpoint, boxShadow: `0 0 12px ${GLOBE_COLORS.endpoint}` }}
        />
      </MarkerButton>

      <MarkerLabel isPinned>
        <span className="font-medium" style={{ color: GLOBE_COLORS.endpoint }}>
          {pin.hostname}
        </span>
        {isMeasured && (
          <span className="font-mono" style={{ color: getLatencyColor(result.medianMs) }}>
            {formatMs(result.medianMs)}
          </span>
        )}
      </MarkerLabel>
    </MarkerShell>
  );
}
