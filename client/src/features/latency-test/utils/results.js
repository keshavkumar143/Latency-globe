import { ALL_PROVIDERS, PROVIDERS } from '@/constants/providers';
import { FINISHED_STATUSES, TEST_STATUS, TEST_STATUS_SORT_ORDER } from '@/constants/testStatus';

/**
 * @typedef {import('@/types/latency').Target} Target
 * @typedef {import('@/types/latency').TestResult} TestResult
 * @typedef {Record<string, TestResult>} ResultsById
 * @typedef {{ target: Target, result: TestResult }} ResultRow
 */

const IDLE_RESULT = Object.freeze({ status: TEST_STATUS.IDLE });

/** @param {Target[]} targets @returns {ResultsById} */
export function createQueuedResults(targets) {
  return Object.fromEntries(targets.map((target) => [target.id, { status: TEST_STATUS.QUEUED }]));
}

/**
 * Marks the given targets as stopped if a run queued them but never started them.
 * @param {ResultsById} results @param {Set<string>} targetIds @returns {ResultsById}
 */
export function markQueuedAsStopped(results, targetIds) {
  const updates = Object.fromEntries(
    [...targetIds]
      .filter((targetId) => results[targetId]?.status === TEST_STATUS.QUEUED)
      .map((targetId) => [targetId, { status: TEST_STATUS.STOPPED }]),
  );
  return Object.keys(updates).length > 0 ? { ...results, ...updates } : results;
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
  return targets.map((target) => ({ target, result: results[target.id] ?? IDLE_RESULT })).sort(compareRows);
}

/** @param {ResultRow[]} sortedRows Output of buildSortedRows() @returns {ResultRow | null} */
export function findFastestRow(sortedRows) {
  const [firstRow] = sortedRows;
  return firstRow?.result.status === TEST_STATUS.DONE ? firstRow : null;
}

/** Highest median among measured rows, used to scale latency bars. @param {ResultRow[]} rows */
export function findSlowestMedianMs(rows) {
  const medians = rows.filter((row) => row.result.status === TEST_STATUS.DONE).map((row) => row.result.medianMs);
  return medians.length > 0 ? Math.max(...medians) : null;
}

/** @param {ResultRow[]} rows */
export function countFinished(rows) {
  return rows.filter((row) => FINISHED_STATUSES.includes(row.result.status)).length;
}

/** @param {ResultRow[]} rows */
export function hasStoppedRows(rows) {
  return rows.some((row) => row.result.status === TEST_STATUS.STOPPED);
}

/** @param {ResultRow[]} rows @param {string} providerFilter A PROVIDER_ID or ALL_PROVIDERS */
export function filterRowsByProvider(rows, providerFilter) {
  return providerFilter === ALL_PROVIDERS ? rows : rows.filter((row) => row.target.provider === providerFilter);
}

/** Case-insensitive match on city, region code or provider label. @param {ResultRow[]} rows */
export function filterRowsByQuery(rows, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return rows;

  return rows.filter(({ target }) =>
    [target.city, target.code, PROVIDERS[target.provider].label].some((text) =>
      text.toLowerCase().includes(normalizedQuery),
    ),
  );
}

/**
 * The fastest measured row for each provider that has one, fastest provider first.
 * @param {ResultRow[]} sortedRows Output of buildSortedRows()
 */
export function findFastestRowPerProvider(sortedRows) {
  const fastestByProvider = new Map();
  for (const row of sortedRows) {
    if (row.result.status !== TEST_STATUS.DONE) break;
    if (!fastestByProvider.has(row.target.provider)) fastestByProvider.set(row.target.provider, row);
  }
  return [...fastestByProvider.values()];
}

/** Number of targets per provider, plus the total under ALL_PROVIDERS. */
export function countTargetsByProvider(targets) {
  const counts = { [ALL_PROVIDERS]: targets.length };
  for (const target of targets) counts[target.provider] = (counts[target.provider] ?? 0) + 1;
  return counts;
}
