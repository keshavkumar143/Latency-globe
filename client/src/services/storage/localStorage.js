// localStorage can throw (private mode, blocked site data, quota), so every access is guarded.

/** @returns {unknown} The parsed value, or `fallback` if missing or unreadable. */
export function readStoredJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStoredJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is a convenience; the app works without it.
  }
}
