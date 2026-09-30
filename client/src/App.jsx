import { AppHeader } from '@/components/layout/AppHeader';
import { MethodologyNote } from '@/features/latency-test/components/MethodologyNote';
import { ResultsTable } from '@/features/latency-test/components/ResultsTable';
import { RunTestButton } from '@/features/latency-test/components/RunTestButton';
import { TestSummary } from '@/features/latency-test/components/TestSummary';
import { useLatencyTest } from '@/features/latency-test/hooks/useLatencyTest';
import { buildAllTargets } from '@/services/targets';

const TARGETS = buildAllTargets();

export function App() {
  const { results, isRunning, hasRun, startTest, stopTest } = useLatencyTest(TARGETS);

  return (
    <div className="min-h-dvh">
      <AppHeader
        actions={<RunTestButton isRunning={isRunning} hasRun={hasRun} onStart={startTest} onStop={stopTest} />}
      />

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <TestSummary targets={TARGETS} results={results} isRunning={isRunning} hasRun={hasRun} />
        <ResultsTable targets={TARGETS} results={results} />
        <MethodologyNote />
      </main>
    </div>
  );
}
