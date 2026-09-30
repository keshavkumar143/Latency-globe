import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_CONCURRENT_TARGETS } from '@/constants/measurement';
import { TEST_STATUS } from '@/constants/testStatus';
import { describeMeasurementError, measureLatency } from '@/services/latency/measureLatency';
import { runWithConcurrency } from '@/utils/concurrency';
import { createQueuedResults, markInProgressAsStopped } from '../utils/results';

/**
 * Measures every target with limited concurrency and writes each result to state as
 * soon as it's ready, so the UI updates live.
 *
 * @param {import('@/types/latency').Target[]} targets
 */
export function useLatencyTest(targets) {
  /** @type {[Record<string, import('@/types/latency').TestResult>, Function]} */
  const [results, setResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const abortControllerRef = useRef(null);

  const stopTest = useCallback(() => abortControllerRef.current?.abort(), []);

  // Abort in-flight requests if the component unmounts mid-test.
  useEffect(() => stopTest, [stopTest]);

  const startTest = useCallback(async () => {
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const { signal } = abortController;

    const setTargetResult = (targetId, result) => {
      if (signal.aborted) return;
      setResults((previous) => ({ ...previous, [targetId]: result }));
    };

    const measureTarget = async (target) => {
      setTargetResult(target.id, { status: TEST_STATUS.RUNNING });
      try {
        const measurement = await measureLatency(target.url, { signal });
        setTargetResult(target.id, { status: TEST_STATUS.DONE, ...measurement });
      } catch (error) {
        setTargetResult(target.id, { status: TEST_STATUS.ERROR, error: describeMeasurementError(error) });
      }
    };

    setIsRunning(true);
    setResults(createQueuedResults(targets));
    await runWithConcurrency(targets, MAX_CONCURRENT_TARGETS, measureTarget, signal);

    const wasReplacedByNewerTest = abortControllerRef.current !== abortController;
    if (wasReplacedByNewerTest) return;

    abortControllerRef.current = null;
    setIsRunning(false);
    if (signal.aborted) setResults((previous) => markInProgressAsStopped(previous));
  }, [targets]);

  const hasRun = Object.keys(results).length > 0;

  return { results, isRunning, hasRun, startTest, stopTest };
}
