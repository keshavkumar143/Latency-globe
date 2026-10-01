import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_CONCURRENT_TARGETS } from '@/constants/measurement';
import { TEST_STATUS } from '@/constants/testStatus';
import { describeMeasurementError, measureLatency } from '@/services/latency/measureLatency';
import { runWithConcurrency } from '@/utils/concurrency';
import { createQueuedResults, markInProgressAsStopped } from '../utils/results';

/**
 * Measures targets with limited concurrency and writes each result to state as soon as
 * it's ready, so the UI updates live. Results for targets outside a run are kept.
 */
export function useLatencyTest() {
  /** @type {[Record<string, import('@/types/latency').TestResult>, Function]} */
  const [results, setResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const abortControllerRef = useRef(null);

  const stopTest = useCallback(() => abortControllerRef.current?.abort(), []);

  // Abort in-flight requests if the component unmounts mid-test.
  useEffect(() => stopTest, [stopTest]);

  /** @param {import('@/types/latency').Target[]} targets */
  const startTest = useCallback(async (targets) => {
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
    setResults((previous) => ({ ...previous, ...createQueuedResults(targets) }));
    await runWithConcurrency(targets, MAX_CONCURRENT_TARGETS, measureTarget, signal);

    const wasReplacedByNewerTest = abortControllerRef.current !== abortController;
    if (wasReplacedByNewerTest) return;

    abortControllerRef.current = null;
    setIsRunning(false);
    if (signal.aborted) setResults((previous) => markInProgressAsStopped(previous));
  }, []);

  const hasRun = Object.keys(results).length > 0;

  return { results, isRunning, hasRun, startTest, stopTest };
}
