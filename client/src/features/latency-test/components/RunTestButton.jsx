import { Button } from '@/components/ui/Button';
import { PlayIcon, StopIcon } from '@/components/ui/icons';

export function RunTestButton({ isRunning, hasRun, targetCount, onStart, onStop }) {
  if (isRunning) {
    return (
      <Button variant="danger" onClick={onStop}>
        <StopIcon className="size-3.5" />
        Stop
      </Button>
    );
  }

  return (
    <Button onClick={onStart} disabled={targetCount === 0}>
      <PlayIcon className="size-3.5" />
      {hasRun ? 'Run again' : 'Run test'}
      <span className="rounded bg-space-950/20 px-1 font-mono text-[11px]">{targetCount}</span>
    </Button>
  );
}
