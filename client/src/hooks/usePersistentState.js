import { useEffect, useState } from 'react';
import { readStoredJson, writeStoredJson } from '@/services/storage/localStorage';

const keepAsIs = (value) => value;

/**
 * useState that survives reloads via localStorage.
 * @param {string} storageKey
 * @param {unknown} defaultValue
 * @param {{ isValid?: (stored: unknown) => boolean, serialize?: (value: any) => unknown }} [options]
 *   `isValid` rejects stale or corrupt stored values; `serialize` picks what gets saved.
 */
export function usePersistentState(storageKey, defaultValue, { isValid = () => true, serialize = keepAsIs } = {}) {
  const [value, setValue] = useState(() => {
    const stored = readStoredJson(storageKey, defaultValue);
    return isValid(stored) ? stored : defaultValue;
  });

  useEffect(() => {
    writeStoredJson(storageKey, serialize(value));
  }, [storageKey, value, serialize]);

  return [value, setValue];
}
