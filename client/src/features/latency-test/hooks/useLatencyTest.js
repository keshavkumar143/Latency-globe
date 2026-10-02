import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_CONCURRENT_TARGETS } from '@/constants/measurement';
import { IN_PROGRESS_STATUSES, TEST_STATUS } from '@/constants/testStatus';
import { describeMeasurementError, measureLatency } from '@/services/latency/measureLatency';
import { runWithConcurrency } from '@/utils/concurrency';
import { createQueuedResults, markQueuedAsStopped } from '../utils/results';

const STOPPED_RESULT = Object.freeze({ status: TEST_STATUS.STOPPED });

/**
 * Measures targets and writes each result to state as soon as it's ready, so the UI
 * updates live. A full run measures several targets with limited concurrency; any single
 * target can also be tested or stopped on its own at any time. Results for targets outside
 * a run are kept.
 */
export function useLatencyTest() {
  /** @type {[Record<string, import('@/types/latency').TestResult>, Function]} */
  const [results, setResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  /** The current full run: its abort controller, its targets, and queued targets the user skipped. */
  const runRef = useRef(null);
  /**
   * One controller per target being measured right now. Only the registered controller
   * may write that target's result, so a stopped or replaced measurement can't overwrite
   * a newer one.
   */
  const measurementsRef = useRef(new Map());

  const setResult = useCallback(
    (targetId, result) => setResults((previous) => ({ ...previous, [targetId]: result })),
    [],
  );

  const measureTarget = useCallback(
    async (target, runSignal) => {
      const measurements = measurementsRef.current;
      measurements.get(target.id)?.abort();
      const controller = new AbortController();
      measurements.set(target.id, controller);
      const isCurrent = () => measurements.get(target.id) === controller;
      const signal = runSignal ? AbortSignal.any([runSignal, controller.signal]) : controller.signal;

      setResult(target.id, { status: TEST_STATUS.RUNNING });
      try {
        const measurement = await measureLatency(target.url, { signal });
        if (isCurrent()) setResult(target.id, { status: TEST_STATUS.DONE, ...measurement });
      } catch (error) {
        if (!isCurrent()) return;
        setResult(
          target.id,
          signal.aborted ? STOPPED_RESULT : { status: TEST_STATUS.ERROR, error: describeMeasurementError(error) },
        );
      } finally {
        if (isCurrent()) measurements.delete(target.id);
      }
    },
    [setResult],
  );

  /** Stops everything: the full run's queue and every measurement in flight. */
  const stopTest = useCallback(() => {
    runRef.current?.controller.abort();
    measurementsRef.current.forEach((controller) => controller.abort());
  }, []);

  // Abort in-flight requests if the component unmounts mid-test.
  useEffect(() => stopTest, [stopTest]);

  /** Stops one target, whether it's being measured or still waiting in the queue. */
  const stopTarget = useCallback((targetId) => {
    runRef.current?.skippedIds.add(targetId);
    const controller = measurementsRef.current.get(targetId);
    measurementsRef.current.delete(targetId);
    controller?.abort();
    setResults((previous) =>
      IN_PROGRESS_STATUSES.includes(previous[targetId]?.status)
        ? { ...previous, [targetId]: STOPPED_RESULT }
        : previous,
    );
  }, []);

  /** Measures one target right away, outside any full run. */
  const testTarget = useCallback(
    (target) => {
      // If a run has it queued, this measurement replaces that one.
      runRef.current?.skippedIds.add(target.id);
      measureTarget(target);
    },
    [measureTarget],
  );

  /** @param {import('@/types/latency').Target[]} targets */
  const startTest = useCallback(
    async (targets) => {
      const previousRun = runRef.current;
      if (previousRun) {
        previousRun.controller.abort();
        setResults((previous) => markQueuedAsStopped(previous, previousRun.targetIds));
      }
      // Silence in-flight measurements of targets this run is about to measure again.
      for (const target of targets) {
        const controller = measurementsRef.current.get(target.id);
        measurementsRef.current.delete(target.id);
        controller?.abort();
      }

      const run = {
        controller: new AbortController(),
        targetIds: new Set(targets.map((t) => t.id)),
        skippedIds: new Set(),
      };
      runRef.current = run;
      const { signal } = run.controller;

      setIsRunning(true);
      setResults((previous) => ({ ...previous, ...createQueuedResults(targets) }));
      await runWithConcurrency(
        targets,
        MAX_CONCURRENT_TARGETS,
        async (target) => {
          if (!run.skippedIds.has(target.id)) await measureTarget(target, signal);
        },
        signal,
      );

      const wasReplacedByNewerRun = runRef.current !== run;
      if (wasReplacedByNewerRun) return;

      runRef.current = null;
      setIsRunning(false);
      if (signal.aborted) setResults((previous) => markQueuedAsStopped(previous, run.targetIds));
    },
    [measureTarget],
  );

  const hasRun = Object.keys(results).length > 0;

  return { results, isRunning, hasRun, startTest, stopTest, testTarget, stopTarget };
}
