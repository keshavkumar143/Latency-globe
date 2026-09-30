/**
 * Returns `url` with a random value set on `paramName`, making it unique so no cache
 * can answer it.
 * @param {string} url
 * @param {string} paramName
 * @returns {string}
 */
export function addCacheBuster(url, paramName) {
  const uniqueValue = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const withParam = new URL(url);
  withParam.searchParams.set(paramName, uniqueValue);
  return withParam.href;
}
