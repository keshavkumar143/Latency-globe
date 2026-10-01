import { MARKER_KIND, USER_MARKER_ID } from '@/constants/globe';
import { isEndpointId } from '@/features/endpoints/utils/endpointRecords';

/**
 * Turns the selected id into the thing it refers to: a region row, a custom endpoint, or
 * the user. Null when nothing (or something that no longer exists) is selected.
 */
export function resolveSelection(selectedId, { rows, endpoints }) {
  if (!selectedId) return null;
  if (selectedId === USER_MARKER_ID) return { kind: MARKER_KIND.USER };

  if (isEndpointId(selectedId)) {
    const endpoint = endpoints.find((candidate) => candidate.id === selectedId);
    return endpoint ? { kind: MARKER_KIND.ENDPOINT, endpoint } : null;
  }

  const row = rows.find((candidate) => candidate.target.id === selectedId);
  return row ? { kind: MARKER_KIND.REGION, row } : null;
}
