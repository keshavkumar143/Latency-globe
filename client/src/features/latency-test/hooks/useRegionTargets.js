import { useEffect, useMemo, useState } from 'react';
import { LOOKUP_STATUS } from '@/constants/customEndpoints';
import { buildRegionTargets, loadCloudflareEdgeTarget } from '@/services/targets';

const REGION_TARGETS = buildRegionTargets();

/**
 * Every measurable region: the fixed cloud regions immediately, plus the user's nearest
 * Cloudflare edge once it's been identified.
 */
export function useRegionTargets() {
  const [edgeTarget, setEdgeTarget] = useState(null);
  const [edgeStatus, setEdgeStatus] = useState(LOOKUP_STATUS.LOADING);

  useEffect(() => {
    const abortController = new AbortController();

    loadCloudflareEdgeTarget(abortController.signal).then(
      (target) => {
        setEdgeTarget(target);
        setEdgeStatus(LOOKUP_STATUS.DONE);
      },
      () => {
        if (!abortController.signal.aborted) setEdgeStatus(LOOKUP_STATUS.ERROR);
      },
    );

    return () => abortController.abort();
  }, []);

  const targets = useMemo(() => (edgeTarget ? [edgeTarget, ...REGION_TARGETS] : REGION_TARGETS), [edgeTarget]);

  return { targets, edgeStatus };
}
