import { Button } from '@/components/ui/Button';

export function RunTestButton({ isRunning, hasRun, onStart, onStop }) {
  if (isRunning) {
    return (
      <Button variant="secondary" onClick={onStop}>
        Stop
      </Button>
    );
  }

  return <Button onClick={onStart}>{hasRun ? 'Run again' : 'Run test'}</Button>;
}
