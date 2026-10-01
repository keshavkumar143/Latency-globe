import { SectionLabel } from '@/components/ui/SectionLabel';
import { LOCATION_SOURCE, LOCATION_STATUS } from '@/constants/location';
import { describeLocation } from '@/utils/location';

function PulsingDot() {
  return (
    <span className="relative mt-1.5 flex size-2.5 shrink-0">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/60" />
      <span className="relative inline-flex size-2.5 rounded-full bg-white" />
    </span>
  );
}

function describeStatus(location, status) {
  if (location) return describeLocation(location);
  if (status === LOCATION_STATUS.LOADING) return { title: 'Finding your location…', detail: '' };
  return { title: 'Location unavailable', detail: 'Arcs need a starting point on the globe.' };
}

export function UserLocationCard({ location, status, preciseError, onRequestPrecise }) {
  const { title, detail } = describeStatus(location, status);
  const canImprove = location?.source !== LOCATION_SOURCE.PRECISE && status !== LOCATION_STATUS.LOADING;

  return (
    <section>
      <SectionLabel>Your location</SectionLabel>
      <div className="mt-2 flex gap-3">
        <PulsingDot />
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-100">{title}</p>
          {detail && <p className="text-xs text-slate-500">{detail}</p>}
          {canImprove && (
            <button type="button" onClick={onRequestPrecise} className="mt-1 text-xs text-sky-400 hover:text-sky-300">
              Use precise location
            </button>
          )}
          {preciseError && <p className="mt-1 text-xs text-rose-400">{preciseError}</p>}
        </div>
      </div>
    </section>
  );
}
