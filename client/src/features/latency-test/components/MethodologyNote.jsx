import { TIMED_REQUEST_COUNT, WARMUP_REQUEST_COUNT } from '@/constants/measurement';
import { pluralize } from '@/utils/format';

export function MethodologyNote() {
  return (
    <p className="text-xs leading-relaxed text-slate-500">
      Browsers can't send ICMP pings, so this measures HTTP round-trip time. Each region gets{' '}
      {pluralize(WARMUP_REQUEST_COUNT, 'warm-up request')} (DNS + TLS setup) followed by{' '}
      {pluralize(TIMED_REQUEST_COUNT, 'timed request')}; the median is shown. Select a result to see its cold connection
      time on the globe.
    </p>
  );
}
