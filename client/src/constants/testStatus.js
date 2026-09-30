export const TEST_STATUS = Object.freeze({
  IDLE: 'idle',
  QUEUED: 'queued',
  RUNNING: 'running',
  DONE: 'done',
  ERROR: 'error',
  STOPPED: 'stopped',
});

/** Statuses that count toward "Measured X of Y". */
export const FINISHED_STATUSES = Object.freeze([TEST_STATUS.DONE, TEST_STATUS.ERROR]);

/** Statuses a stopped run converts to STOPPED. */
export const IN_PROGRESS_STATUSES = Object.freeze([TEST_STATUS.QUEUED, TEST_STATUS.RUNNING]);

/** Row order in the results list: measured first (then by latency), failures last. */
export const TEST_STATUS_SORT_ORDER = Object.freeze({
  [TEST_STATUS.DONE]: 0,
  [TEST_STATUS.RUNNING]: 1,
  [TEST_STATUS.QUEUED]: 2,
  [TEST_STATUS.IDLE]: 2,
  [TEST_STATUS.STOPPED]: 3,
  [TEST_STATUS.ERROR]: 4,
});
