import { FINISHED_STATUSES, IN_PROGRESS_STATUSES, TEST_STATUS, TEST_STATUS_SORT_ORDER } from '@/constants/testStatus';

/**
 * @typedef {import('@/types/latency').Target} Target
 * @typedef {import('@/types/latency').TestResult} TestResult
 * @typedef {Record<string, TestResult>} ResultsById
 * @typedef {{ target: Target, result: TestResult }} ResultRow
 */

const IDLE_RESULT = Object.freeze({ status: TEST_STATUS.IDLE });

/** @param {ResultsById} results @param {string} targetId @returns {TestResult} */
export function getResult(results, targetId) {
  return results[targetId] ?? IDLE_RESULT;
}

/** @param {Target[]} targets @returns {ResultsById} */
export function createQueuedResults(targets) {
  return Object.fromEntries(targets.map((target) => [target.id, { status: TEST_STATUS.QUEUED }]));
}

/** Marks every queued or running result as stopped. @param {ResultsById} results @returns {ResultsById} */
export function markInProgressAsStopped(results) {
  return Object.fromEntries(
    Object.entries(results).map(([targetId, result]) => [
      targetId,
      IN_PROGRESS_STATUSES.includes(result.status) ? { status: TEST_STATUS.STOPPED } : result,
    ]),
  );
}

/** @param {ResultsById} results */
export function countFinished(results) {
  return Object.values(results).filter((result) => FINISHED_STATUSES.includes(result.status)).length;
}

/** @param {ResultRow} a @param {ResultRow} b */
function compareRows(a, b) {
  const statusDifference = TEST_STATUS_SORT_ORDER[a.result.status] - TEST_STATUS_SORT_ORDER[b.result.status];
  if (statusDifference !== 0) return statusDifference;
  return (a.result.medianMs ?? 0) - (b.result.medianMs ?? 0);
}

/**
 * Pairs each target with its result, measured rows first, fastest to slowest.
 * @param {Target[]} targets @param {ResultsById} results @returns {ResultRow[]}
 */
export function buildSortedRows(targets, results) {
  return targets.map((target) => ({ target, result: getResult(results, target.id) })).sort(compareRows);
}

/** @param {Target[]} targets @param {ResultsById} results @returns {ResultRow|null} */
export function findFastestRow(targets, results) {
  const [firstRow] = buildSortedRows(targets, results);
  return firstRow?.result.status === TEST_STATUS.DONE ? firstRow : null;
}

/** Highest median among measured rows, used to scale latency bars. @param {ResultRow[]} rows */
export function findSlowestMedianMs(rows) {
  const medians = rows.filter((row) => row.result.status === TEST_STATUS.DONE).map((row) => row.result.medianMs);
  return medians.length > 0 ? Math.max(...medians) : null;
}
