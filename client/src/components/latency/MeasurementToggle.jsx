import { Button } from '@/components/ui/Button';
import { RefreshIcon, StopIcon } from '@/components/ui/icons';

/**
 * Row action for a single measurement: Stop while it's in progress, otherwise Test /
 * Re-test. Stop is always visible; Test appears on hover or focus (always on touch screens).
 * Separate keys keep the two from sharing a DOM element, so one never animates into the other.
 */
export function MeasurementToggle({ isMeasuring, hasResult, name, onStop, onTest, className = '' }) {
  if (isMeasuring) {
    return (
      <Button
        key="stop"
        variant="ghost"
        size="icon"
        onClick={onStop}
        aria-label={`Stop measuring ${name}`}
        title="Stop"
        className={`size-7 hover:bg-rose-500/15 ${className}`}
      >
        <StopIcon className="size-3 text-rose-400" />
      </Button>
    );
  }

  return (
    <Button
      key="test"
      variant="ghost"
      size="icon"
      onClick={onTest}
      aria-label={`${hasResult ? 'Re-test' : 'Test'} ${name}`}
      title={hasResult ? 'Re-test' : 'Test'}
      className={`size-7 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100 ${className}`}
    >
      <RefreshIcon className="size-3.5" />
    </Button>
  );
}
