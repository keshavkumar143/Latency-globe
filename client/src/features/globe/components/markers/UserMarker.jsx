import { USER_MARKER_ID } from '@/constants/globe';
import { MarkerButton, MarkerLabel, MarkerShell, SelectionRing } from './MarkerParts';

export function UserMarker({ isSelected, onSelect }) {
  return (
    <MarkerShell>
      <MarkerButton onClick={() => onSelect(USER_MARKER_ID)} label="Your location">
        <span className="absolute inset-0.5 animate-ping rounded-full bg-white/50" />
        {isSelected && <SelectionRing />}
        <span className="relative size-3 rounded-full bg-white ring-2 ring-sky-400/60 shadow-[0_0_14px_4px_rgba(255,255,255,0.55)]" />
      </MarkerButton>
      <MarkerLabel isPinned>
        <span className="font-semibold">You</span>
      </MarkerLabel>
    </MarkerShell>
  );
}
