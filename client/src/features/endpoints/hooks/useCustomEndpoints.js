import { useCallback, useEffect, useRef, useState } from 'react';
import { ENDPOINT_LOOKUP_ERROR, LOOKUP_STATUS, SAVED_ENDPOINTS_STORAGE_KEY } from '@/constants/customEndpoints';
import { MEASUREMENT_ERROR } from '@/constants/measurement';
import { IN_PROGRESS_STATUSES, TEST_STATUS } from '@/constants/testStatus';
import { usePersistentState } from '@/hooks/usePersistentState';
import { inspectEndpoint } from '@/services/endpoints/inspectEndpoint';
import { describeMeasurementError, measureLatency } from '@/services/latency/measureLatency';
import { getEndpointId, isValidStoredEndpoints, toStoredEndpoint, upsertEndpoint } from '../utils/endpointRecords';

const KNOWN_LOOKUP_ERRORS = Object.values(ENDPOINT_LOOKUP_ERROR);

const STORAGE_OPTIONS = {
  isValid: isValidStoredEndpoints,
  serialize: (endpoints) => endpoints.map(toStoredEndpoint),
};

function describeLookupError(error) {
  return KNOWN_LOOKUP_ERRORS.includes(error?.message) ? error.message : ENDPOINT_LOOKUP_ERROR.UNAVAILABLE;
}

/** What a stopped test leaves behind: in-flight parts are marked stopped, finished parts kept. */
function markStopped(endpoint) {
  return {
    ...endpoint,
    result: IN_PROGRESS_STATUSES.includes(endpoint.result.status) ? { status: TEST_STATUS.STOPPED } : endpoint.result,
    lookup:
      endpoint.lookup?.status === LOOKUP_STATUS.LOADING
        ? { status: LOOKUP_STATUS.ERROR, error: MEASUREMENT_ERROR.STOPPED }
        : endpoint.lookup,
  };
}

/**
 * The user's own endpoints: each is located (DNS → IP → geolocation) and timed in the
 * browser, in parallel. The list is saved across reloads.
 */
export function useCustomEndpoints() {
  /** @type {[import('../utils/endpointRecords').CustomEndpoint[], Function]} */
  const [endpoints, setEndpoints] = usePersistentState(SAVED_ENDPOINTS_STORAGE_KEY, [], STORAGE_OPTIONS);
  const [testingId, setTestingId] = useState(null);
  const abortControllerRef = useRef(null);

  const stopEndpointTest = useCallback(() => abortControllerRef.current?.abort(), []);
  useEffect(() => stopEndpointTest, [stopEndpointTest]);

  const updateEndpoint = useCallback(
    (id, update) =>
      setEndpoints((previous) => previous.map((endpoint) => (endpoint.id === id ? update(endpoint) : endpoint))),
    [setEndpoints],
  );

  const runTest = useCallback(
    async ({ id, url, hostname }) => {
      abortControllerRef.current?.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const { signal } = abortController;

      const patchUnlessStopped = (patch) => {
        if (!signal.aborted) updateEndpoint(id, (endpoint) => ({ ...endpoint, ...patch }));
      };

      setTestingId(id);
      setEndpoints((previous) =>
        upsertEndpoint(previous, {
          id,
          url,
          hostname,
          addedAt: Date.now(),
          result: { status: TEST_STATUS.RUNNING },
          lookup: { status: LOOKUP_STATUS.LOADING },
        }),
      );

      const lookupTask = inspectEndpoint(hostname, signal).then(
        (data) => patchUnlessStopped({ lookup: { status: LOOKUP_STATUS.DONE, data } }),
        (error) => patchUnlessStopped({ lookup: { status: LOOKUP_STATUS.ERROR, error: describeLookupError(error) } }),
      );
      const latencyTask = measureLatency(url, { signal }).then(
        (measurement) => patchUnlessStopped({ result: { status: TEST_STATUS.DONE, ...measurement } }),
        (error) =>
          patchUnlessStopped({ result: { status: TEST_STATUS.ERROR, error: describeMeasurementError(error) } }),
      );
      await Promise.all([lookupTask, latencyTask]);

      const wasReplacedByNewerTest = abortControllerRef.current !== abortController;
      if (wasReplacedByNewerTest) return;

      abortControllerRef.current = null;
      setTestingId(null);
      if (signal.aborted) updateEndpoint(id, markStopped);
    },
    [setEndpoints, updateEndpoint],
  );

  /**
   * Starts testing an endpoint (adding it if new) and returns its id right away.
   * @param {{ url: string, hostname: string }} endpoint Output of parseEndpointInput()
   */
  const testEndpoint = useCallback(
    ({ url, hostname }) => {
      const id = getEndpointId(url);
      runTest({ id, url, hostname });
      return id;
    },
    [runTest],
  );

  const removeEndpoint = useCallback(
    (id) => {
      if (id === testingId) stopEndpointTest();
      setEndpoints((previous) => previous.filter((endpoint) => endpoint.id !== id));
    },
    [setEndpoints, stopEndpointTest, testingId],
  );

  return { endpoints, testingId, isTesting: testingId !== null, testEndpoint, stopEndpointTest, removeEndpoint };
}
