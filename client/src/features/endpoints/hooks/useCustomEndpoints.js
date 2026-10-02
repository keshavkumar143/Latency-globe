import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ENDPOINT_LOOKUP_ERROR, LOOKUP_STATUS, SAVED_ENDPOINTS_STORAGE_KEY } from '@/constants/customEndpoints';
import { MEASUREMENT_ERROR } from '@/constants/measurement';
import { IN_PROGRESS_STATUSES, TEST_STATUS } from '@/constants/testStatus';
import { usePersistentState } from '@/hooks/usePersistentState';
import { inspectEndpoint } from '@/services/endpoints/inspectEndpoint';
import { describeMeasurementError, measureLatency } from '@/services/latency/measureLatency';
import {
  getEndpointId,
  isEndpointTesting,
  isValidStoredEndpoints,
  toStoredEndpoint,
  upsertEndpoint,
} from '../utils/endpointRecords';

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
 * browser. Several can be tested at once, and each can be stopped on its own. The list is
 * saved across reloads.
 */
export function useCustomEndpoints() {
  /** @type {[import('../utils/endpointRecords').CustomEndpoint[], Function]} */
  const [endpoints, setEndpoints] = usePersistentState(SAVED_ENDPOINTS_STORAGE_KEY, [], STORAGE_OPTIONS);
  /** One controller per endpoint being tested; only the registered one may write that endpoint's results. */
  const testsRef = useRef(new Map());

  // Abort in-flight requests if the component unmounts mid-test.
  useEffect(() => {
    const tests = testsRef.current;
    return () => tests.forEach((controller) => controller.abort());
  }, []);

  const updateEndpoint = useCallback(
    (id, update) =>
      setEndpoints((previous) => previous.map((endpoint) => (endpoint.id === id ? update(endpoint) : endpoint))),
    [setEndpoints],
  );

  const stopEndpointTest = useCallback(
    (id) => {
      const controller = testsRef.current.get(id);
      if (!controller) return;
      testsRef.current.delete(id);
      controller.abort();
      updateEndpoint(id, markStopped);
    },
    [updateEndpoint],
  );

  const stopAllEndpointTests = useCallback(
    () => [...testsRef.current.keys()].forEach(stopEndpointTest),
    [stopEndpointTest],
  );

  const runTest = useCallback(
    async ({ id, url, hostname }) => {
      const tests = testsRef.current;
      tests.get(id)?.abort();
      const controller = new AbortController();
      tests.set(id, controller);
      const { signal } = controller;

      const patchIfCurrent = (patch) => {
        if (tests.get(id) === controller) updateEndpoint(id, (endpoint) => ({ ...endpoint, ...patch }));
      };

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
        (data) => patchIfCurrent({ lookup: { status: LOOKUP_STATUS.DONE, data } }),
        (error) => patchIfCurrent({ lookup: { status: LOOKUP_STATUS.ERROR, error: describeLookupError(error) } }),
      );
      const latencyTask = measureLatency(url, { signal }).then(
        (measurement) => patchIfCurrent({ result: { status: TEST_STATUS.DONE, ...measurement } }),
        (error) => patchIfCurrent({ result: { status: TEST_STATUS.ERROR, error: describeMeasurementError(error) } }),
      );
      await Promise.all([lookupTask, latencyTask]);

      if (tests.get(id) === controller) tests.delete(id);
    },
    [setEndpoints, updateEndpoint],
  );

  /**
   * Starts testing an endpoint (adding it if new) and returns its id right away.
   * @param {{ url: string, hostname: string }} endpoint Output of parseEndpointInput() or a saved endpoint
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
      stopEndpointTest(id);
      setEndpoints((previous) => previous.filter((endpoint) => endpoint.id !== id));
    },
    [setEndpoints, stopEndpointTest],
  );

  const testingIds = useMemo(() => endpoints.filter(isEndpointTesting).map((endpoint) => endpoint.id), [endpoints]);

  return {
    endpoints,
    testingIds,
    isTesting: testingIds.length > 0,
    testEndpoint,
    stopEndpointTest,
    stopAllEndpointTests,
    removeEndpoint,
  };
}
