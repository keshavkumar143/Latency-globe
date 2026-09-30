/**
 * Runs `worker` on every item with at most `limit` running at once. Once `signal`
 * aborts, no new items are started. `worker` must handle its own errors.
 * @template T
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T) => Promise<void>} worker
 * @param {AbortSignal} [signal]
 */
export async function runWithConcurrency(items, limit, worker, signal) {
  let nextIndex = 0;

  const runLane = async () => {
    while (nextIndex < items.length && !signal?.aborted) {
      const item = items[nextIndex];
      nextIndex += 1;
      await worker(item);
    }
  };

  const laneCount = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: laneCount }, runLane));
}
